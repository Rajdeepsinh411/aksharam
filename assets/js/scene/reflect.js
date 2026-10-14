/**
 * Soft floor reflections (high tier): a half-resolution planar reflection,
 * blurred and mixed into the floor material by Fresnel and the floor's own
 * roughness map, so it reads as sealed vinyl (roughness ≈ 0.25), not a mirror.
 * Only layer-0 objects are reflected (the CT volume/slices are skipped).
 */
import * as THREE from 'three';
import { Reflector } from 'three/addons/objects/Reflector.js';
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js';

const blurShader = {
  uniforms: { tMap: { value: null }, uDir: { value: new THREE.Vector2() } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tMap; uniform vec2 uDir; varying vec2 vUv;
    void main() {
      vec4 c = texture2D(tMap, vUv) * 0.2270270270;
      c += texture2D(tMap, vUv + uDir * 1.3846153846) * 0.3162162162;
      c += texture2D(tMap, vUv - uDir * 1.3846153846) * 0.3162162162;
      c += texture2D(tMap, vUv + uDir * 3.2307692308) * 0.0702702703;
      c += texture2D(tMap, vUv - uDir * 3.2307692308) * 0.0702702703;
      gl_FragColor = c;
    }`
};

export function createFloorReflection(renderer, floor, { scale = 0.5, strength = 0.55 } = {}) {
  const size = renderer.getDrawingBufferSize(new THREE.Vector2());
  const w = Math.max(64, Math.round(size.x * scale)), h = Math.max(64, Math.round(size.y * scale));
  const reflector = new Reflector(floor.geometry, { textureWidth: w, textureHeight: h, clipBias: 0.002 });
  reflector.position.copy(floor.position);
  reflector.quaternion.copy(floor.quaternion);
  reflector.layers.set(31); // never drawn by the main camera; rendered manually below
  reflector.updateMatrixWorld(true);
  floor.parent.add(reflector);

  const rtA = new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType });
  const rtB = rtA.clone();
  const blurMat = new THREE.ShaderMaterial(blurShader);
  blurMat.depthTest = blurMat.depthWrite = false;
  const quad = new FullScreenQuad(blurMat);

  const uniforms = {
    tReflect: { value: rtB.texture },
    uReflectMatrix: { value: reflector.material.uniforms.textureMatrix.value },
    uReflectStrength: { value: strength }
  };
  const mat = floor.material;
  const prev = mat.onBeforeCompile;
  mat.onBeforeCompile = (shader, r) => {
    if (prev) prev(shader, r);
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform mat4 uReflectMatrix;\nvarying vec4 vReflectUv;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvReflectUv = uReflectMatrix * vec4(transformed, 1.0); // textureMatrix already includes the plane transform');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform sampler2D tReflect;\nuniform float uReflectStrength;\nvarying vec4 vReflectUv;')
      .replace(
        '#include <opaque_fragment>',
        `{
          vec2 ruv = vReflectUv.xy / vReflectUv.w + normal.xz * 0.012;
          vec3 refl = texture2D(tReflect, ruv).rgb;
          vec3 V = normalize(vViewPosition);
          float fres = 0.04 + 0.96 * pow(1.0 - clamp(abs(dot(normal, V)), 0.0, 1.0), 5.0);
          float gloss = clamp(1.0 - roughnessFactor * 1.4, 0.0, 1.0);
          outgoingLight = mix(outgoingLight, outgoingLight * 0.82 + refl, uReflectStrength * mix(0.22, 0.9, fres) * gloss);
        }
        #include <opaque_fragment>`
      );
  };
  mat.customProgramCacheKey = () => 'floorReflect';
  mat.needsUpdate = true;

  return {
    uniforms,
    update(scene, camera) {
      camera.updateMatrixWorld();
      reflector.onBeforeRender(renderer, scene, camera);
      const src = reflector.getRenderTarget();
      const prevTarget = renderer.getRenderTarget();
      blurMat.uniforms.tMap.value = src.texture;
      blurMat.uniforms.uDir.value.set(0.9 / w, 0);
      renderer.setRenderTarget(rtA);
      quad.render(renderer);
      blurMat.uniforms.tMap.value = rtA.texture;
      blurMat.uniforms.uDir.value.set(0, 0.9 / h);
      renderer.setRenderTarget(rtB);
      quad.render(renderer);
      renderer.setRenderTarget(prevTarget);
    },
    setSize(width, height) {
      const ww = Math.max(64, Math.round(width * scale)), hh = Math.max(64, Math.round(height * scale));
      reflector.getRenderTarget().setSize(ww, hh);
      rtA.setSize(ww, hh);
      rtB.setSize(ww, hh);
    },
    dispose() {
      reflector.dispose();
      rtA.dispose();
      rtB.dispose();
      blurMat.dispose();
      quad.dispose();
    }
  };
}
