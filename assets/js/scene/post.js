/**
 * Post-processing (pmndrs/postprocessing + N8AO), tuned per quality tier.
 *
 *   Render → N8AO → [DoF · Bloom(HDR, high threshold) · Exposure/Fade · Neutral tone map · Grade]
 *          → SMAA (on the tone-mapped image) → [Chromatic aberration (edges) · Vignette · Grain]
 */
import * as THREE from 'three';
import {
  EffectComposer,
  RenderPass,
  EffectPass,
  ShaderPass,
  CopyMaterial,
  Effect,
  BlendFunction,
  BloomEffect,
  SMAAEffect,
  SMAAPreset,
  EdgeDetectionMode,
  DepthOfFieldEffect,
  VignetteEffect,
  NoiseEffect,
  ChromaticAberrationEffect,
  ToneMappingEffect,
  ToneMappingMode
} from 'postprocessing';
import { N8AOPostPass } from 'n8ao';

/** Exposure + scene fade (used for soft light transitions between bays). Runs before tone mapping. */
class ExposureEffect extends Effect {
  constructor() {
    super(
      'ExposureEffect',
      /* glsl */ `
      uniform float exposure;
      uniform vec3 whiteBalance;
      void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
        outputColor = vec4(inputColor.rgb * exposure * whiteBalance, inputColor.a);
      }`,
      // slightly cool white balance (≈ 6000 K) so whites read clean and clinical, never cream
      { uniforms: new Map([['exposure', new THREE.Uniform(1)], ['whiteBalance', new THREE.Uniform(new THREE.Vector3(0.95, 0.985, 1.06))]]) }
    );
  }
  set exposure(v) {
    this.uniforms.get('exposure').value = v;
  }
}

/** Film-like response after tone mapping: slightly cool shadows, clean neutral whites, gentle toe. */
class GradeEffect extends Effect {
  constructor() {
    super(
      'GradeEffect',
      /* glsl */ `
      void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
        vec3 c = inputColor.rgb;
        float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
        c += vec3(-0.004, 0.0, 0.007) * (1.0 - smoothstep(0.0, 0.35, l)); // cool lift in the shadows
        c = mix(c, c * c * (3.0 - 2.0 * c), 0.12);                        // soft S-curve
        outputColor = vec4(max(c, 0.0), inputColor.a);
      }`
    );
  }
}

export function createPost(renderer, scene, camera, tier) {
  const high = tier === 'high';
  const composer = new EffectComposer(renderer, { frameBufferType: THREE.HalfFloatType, multisampling: 0 });
  composer.addPass(new RenderPass(scene, camera));

  const size = renderer.getSize(new THREE.Vector2());
  const ao = new N8AOPostPass(scene, camera, size.x, size.y);
  ao.configuration.aoRadius = 0.8;
  ao.configuration.distanceFalloff = 1.0;
  ao.configuration.intensity = high ? 3.4 : 2.8;
  ao.configuration.color = new THREE.Color(0x0b0d10);
  ao.configuration.halfRes = !high;
  ao.configuration.gammaCorrection = false;
  ao.configuration.transparencyAware = false;
  ao.setQualityMode(high ? 'High' : 'Low');
  composer.addPass(ao);
  // N8AO swaps buffers; copy once more so the scene depth texture is back on the input
  // buffer (otherwise the depth-of-field pass would read and write the same framebuffer).
  composer.addPass(new ShaderPass(new CopyMaterial()));

  const dof = high
    ? new DepthOfFieldEffect(camera, { worldFocusDistance: 4, worldFocusRange: 1.6, bokehScale: 3, resolutionScale: 0.5 })
    : null;
  const bloom = new BloomEffect({
    blendFunction: BlendFunction.ADD,
    luminanceThreshold: 1.6,
    luminanceSmoothing: 0.4,
    intensity: high ? 0.55 : 0.45,
    mipmapBlur: true,
    radius: 0.62,
    levels: high ? 7 : 5
  });
  const exposure = new ExposureEffect();
  const tone = new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL });
  const grade = new GradeEffect();
  let mainPass = new EffectPass(camera, ...[dof, bloom, exposure, tone, grade].filter(Boolean));
  composer.addPass(mainPass);
  let dofOn = !!dof;
  const rebuildMain = (withDof, withBloom) => {
    const index = composer.passes.indexOf(mainPass);
    composer.removePass(mainPass);
    mainPass.dispose();
    mainPass = new EffectPass(camera, ...[withDof && dof, withBloom && bloom, exposure, tone, grade].filter(Boolean));
    composer.addPass(mainPass, index);
  };

  const smaa = new SMAAEffect({ preset: high ? SMAAPreset.ULTRA : SMAAPreset.MEDIUM, edgeDetectionMode: EdgeDetectionMode.COLOR });
  composer.addPass(new EffectPass(camera, smaa));

  const vignette = new VignetteEffect({ offset: 0.32, darkness: 0.42 });
  const noise = new NoiseEffect({ blendFunction: BlendFunction.SOFT_LIGHT, premultiply: false });
  noise.blendMode.opacity.value = high ? 0.12 : 0.08;
  const finishing = [vignette, noise];
  let ca = null;
  if (high) {
    ca = new ChromaticAberrationEffect({ offset: new THREE.Vector2(0.0006, 0.0006), radialModulation: true, modulationOffset: 0.55 });
    finishing.unshift(ca);
  }
  composer.addPass(new EffectPass(camera, ...finishing));

  return {
    composer,
    ao,
    dof,
    bloom,
    exposure,
    setSize(w, h) {
      composer.setSize(w, h);
    },
    /** Rack focus: world-space distance from the camera to the subject. */
    setFocus(distance, range) {
      if (!dofOn) return;
      dof.cocMaterial.worldFocusDistance = distance;
      if (range) dof.cocMaterial.worldFocusRange = range;
    },
    /** Step quality down when the frame rate can't keep up. */
    degrade(level) {
      if (level >= 1) ao.configuration.halfRes = true;
      if (level >= 1 && dofOn) {
        dofOn = false;
        rebuildMain(false, true);
      }
      if (level >= 2) ao.setQualityMode('Low');
      if (level >= 2 && ca) ca.blendMode.opacity.value = 0;
      if (level >= 3) rebuildMain(false, false);
    },
    get hasDof() {
      return dofOn;
    },
    /** Clean output for the pre-rendered volume loop: no grain, vignette, fringing or shadow lift. */
    setClean(on) {
      noise.blendMode.opacity.value = on ? 0 : high ? 0.12 : 0.08;
      vignette.blendMode.opacity.value = on ? 0 : 1;
      grade.blendMode.opacity.value = on ? 0 : 1;
      if (ca) ca.blendMode.opacity.value = on ? 0 : 1;
    },
    render(dt) {
      composer.render(dt);
    },
    dispose() {
      composer.dispose();
    }
  };
}
