/**
 * Ultrasound bay and radiologist reporting station (procedural fallbacks for
 * assets/models/ultrasound-station.glb and assets/models/reporting-desk.glb).
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { screenMaterial } from './materials.js';

export const US_POS = new THREE.Vector3(5.75, 0, -0.85);
export const BED_POS = new THREE.Vector3(6.75, 0, -0.15);
export const PROBE_POS = new THREE.Vector3(6.47, 0.665, 0.02);
export const DESK_POS = new THREE.Vector3(10.4, 0, -3.0);

const castAll = (o) => o.traverse((m) => m.isMesh && ((m.castShadow = true), (m.receiveShadow = true)));

/* ------------------------------------------------------------------ */
/* Ultrasound screen: real B-mode loop ↔ colour Doppler, glossy glass  */
/* ------------------------------------------------------------------ */
let placeholder = null;
/** 1×1 white map: makes three.js define the emissive UV varying our screen shaders read. */
export function placeholderMap() {
  if (!placeholder) {
    placeholder = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
    placeholder.needsUpdate = true;
  }
  return placeholder;
}

export function ultrasoundScreenMaterial() {
  const uniforms = {
    tVideo: { value: null },
    tDoppler: { value: null },
    uMix: { value: 0 },
    uTime: { value: 0 },
    uHasVideo: { value: 0 },
    uOn: { value: 1 }
  };
  const mat = screenMaterial(placeholderMap(), 1.15);
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform sampler2D tVideo; uniform sampler2D tDoppler; uniform float uMix; uniform float uTime; uniform float uHasVideo; uniform float uOn;`
      )
      .replace(
        '#include <emissivemap_fragment>',
        `{
          // 16:10 panel; the 4:3 image sits left of centre with a dark UI column on the right
          vec2 uv = vEmissiveMapUv;
          vec2 iuv = vec2((uv.x - 0.04) / 0.80, (uv.y - 0.04) / 0.92);
          vec3 img = vec3(0.0);
          if (iuv.x > 0.0 && iuv.x < 1.0 && iuv.y > 0.0 && iuv.y < 1.0) {
            vec3 bmode = uHasVideo > 0.5 ? texture2D(tVideo, iuv).rgb : vec3(0.02);
            vec3 dop = texture2D(tDoppler, iuv).rgb;
            // pulsatile colour flow: modulate saturated (colour) pixels with a cardiac cycle
            float sat = max(dop.r, max(dop.g, dop.b)) - min(dop.r, min(dop.g, dop.b));
            float colourMask = smoothstep(0.18, 0.35, sat);
            float beat = fract(uTime * 1.15);
            float pulse = 0.55 + 0.45 * exp(-beat * 6.0) + 0.12 * exp(-pow((beat - 0.32) * 9.0, 2.0));
            vec3 grey = vec3(dot(dop, vec3(0.299, 0.587, 0.114)));
            dop = mix(dop, grey * 0.9 + dop * 0.1, colourMask * (1.0 - pulse)) * mix(1.0, 1.25, colourMask * pulse);
            img = mix(bmode, dop, uMix);
          }
          // UI chrome: thin rules and a soft grey column of controls on the right
          float ui = step(0.86, uv.x) * (0.06 + 0.05 * step(0.5, fract(uv.y * 9.0)) * step(0.88, uv.x) * step(uv.x, 0.98));
          float rule = (1.0 - smoothstep(0.0, 0.004, abs(uv.y - 0.965))) * 0.12;
          vec3 col = img + vec3(0.55, 0.62, 0.7) * (ui + rule);
          totalEmissiveRadiance = col * emissive * uOn;
        }`
      );
  };
  mat.customProgramCacheKey = () => 'usScreen';
  mat.userData.uniforms = uniforms;
  return mat;
}

/** Faint expanding light rings on the floor under the probe (the logo's sound-wave arcs, as light). */
function floorRingsMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uOpacity: { value: 0 } },
    vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uTime; uniform float uOpacity; varying vec2 vUv;
      void main() {
        float r = length(vUv - 0.5) * 2.0;
        float a = 0.0; vec3 c = vec3(0.0);
        for (int i = 0; i < 4; i++) {
          float ph = fract(uTime * 0.18 + float(i) * 0.25);
          float rr = 0.08 + ph * 0.92;
          float ring = exp(-pow((r - rr) / 0.012, 2.0)) * (1.0 - ph) * (1.0 - ph);
          vec3 tint = i == 0 ? vec3(1.0, 0.25, 0.28) : vec3(0.82, 0.88, 0.95);
          c += tint * ring; a += ring;
        }
        float fade = 1.0 - smoothstep(0.75, 1.0, r);
        gl_FragColor = vec4(c * fade * uOpacity * 1.6, 1.0);
        #include <colorspace_fragment>
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
}

function probeGeometry() {
  // curvilinear abdominal probe: tapered handle + convex footprint head
  const pts = [[0, 0], [0.014, 0.002], [0.017, 0.02], [0.019, 0.07], [0.02, 0.1], [0.026, 0.118], [0.031, 0.13], [0.0, 0.13]].map(
    ([r, y]) => new THREE.Vector2(r, y)
  );
  const handle = new THREE.LatheGeometry(pts, 40);
  handle.scale(1, 1, 0.72);
  return handle;
}

export function buildUltrasound(M) {
  const g = new THREE.Group();
  g.name = 'UltrasoundBay';

  /* Cart */
  const cart = new THREE.Group();
  cart.position.copy(US_POS);
  cart.rotation.y = 0.55;
  g.add(cart);
  const base = new THREE.Mesh(new RoundedBoxGeometry(0.6, 0.12, 0.72, 3, 0.045), M.shellWarm);
  base.position.y = 0.16;
  cart.add(base);
  for (const [x, z] of [[-0.23, -0.27], [0.23, -0.27], [-0.23, 0.27], [0.23, 0.27]]) {
    const caster = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 20), M.rubber);
    caster.rotation.z = Math.PI / 2;
    caster.position.set(x, 0.045, z);
    const fork = new THREE.Mesh(new RoundedBoxGeometry(0.03, 0.08, 0.05, 2, 0.008), M.satinDark);
    fork.position.set(x, 0.09, z);
    cart.add(caster, fork);
  }
  const column = new THREE.Mesh(new RoundedBoxGeometry(0.38, 0.62, 0.44, 4, 0.06), M.shell);
  column.position.set(0, 0.52, -0.04);
  cart.add(column);
  // printer / storage bay with dark front
  const bay = new THREE.Mesh(new RoundedBoxGeometry(0.22, 0.14, 0.02, 2, 0.006), M.plastic);
  bay.position.set(0, 0.46, 0.185);
  cart.add(bay);

  // Console (tilted towards the operator)
  const consoleG = new THREE.Group();
  consoleG.position.set(0, 0.92, 0.08);
  consoleG.rotation.x = -0.2;
  cart.add(consoleG);
  const slab = new THREE.Mesh(new RoundedBoxGeometry(0.7, 0.075, 0.52, 4, 0.035), M.shell);
  consoleG.add(slab);
  const deck = new THREE.Mesh(new RoundedBoxGeometry(0.5, 0.012, 0.3, 2, 0.005), M.plastic);
  deck.position.set(0, 0.031, 0.03);
  consoleG.add(deck);
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.024, 32, 16), M.shell);
  ball.position.set(0, 0.036, 0.1);
  const ballRing = new THREE.Mesh(new THREE.TorusGeometry(0.034, 0.006, 8, 40), M.satin);
  ballRing.rotation.x = Math.PI / 2;
  ballRing.position.set(0, 0.04, 0.1);
  consoleG.add(ball, ballRing);
  const keyGeo = new RoundedBoxGeometry(0.022, 0.008, 0.02, 1, 0.003);
  const keys = new THREE.InstancedMesh(keyGeo, M.shellWarm, 36);
  const mtx = new THREE.Matrix4();
  for (let i = 0; i < 36; i++) {
    const col = i % 12, row = Math.floor(i / 12);
    mtx.makeTranslation(-0.165 + col * 0.03, 0.04, -0.07 + row * 0.028);
    keys.setMatrixAt(i, mtx);
  }
  consoleG.add(keys);
  const knobGeo = new THREE.CylinderGeometry(0.011, 0.012, 0.016, 20);
  for (let i = 0; i < 6; i++) {
    const k = new THREE.Mesh(knobGeo, M.satinDark);
    k.position.set(-0.17 + i * 0.068, 0.045, 0.02);
    consoleG.add(k);
  }
  // touch panel
  const touch = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.13), new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0x2b4d6b, emissiveIntensity: 0.55, roughness: 0.2 }));
  touch.rotation.x = -Math.PI / 2 + 0.35;
  touch.position.set(0, 0.075, -0.15);
  consoleG.add(touch);
  // probe holders + parked probes
  [-0.33, 0.33].forEach((x, i) => {
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.024, 0.07, 24, 1, true), M.satin);
    cup.position.set(x, -0.01, 0.05);
    consoleG.add(cup);
    if (i === 1) {
      const parked = new THREE.Mesh(probeGeometry(), M.shellWarm);
      parked.rotation.x = Math.PI;
      parked.position.set(x, 0.1, 0.05);
      consoleG.add(parked);
    }
  });
  // gel bottle
  const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.03, 0.15, 24), M.shell);
  bottle.position.set(-0.36, 0.06, -0.12);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.022, 0.04, 20), new THREE.MeshStandardMaterial({ color: 0x2f6fb0, roughness: 0.4 }));
  cap.position.set(-0.36, 0.155, -0.12);
  consoleG.add(bottle, cap);

  // Articulating arm + monitor
  const arm1 = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.28, 20), M.satin);
  arm1.position.set(0, 1.08, -0.16);
  const joint = new THREE.Mesh(new THREE.SphereGeometry(0.032, 20, 12), M.satinDark);
  joint.position.set(0, 1.23, -0.16);
  const arm2 = new THREE.Mesh(new RoundedBoxGeometry(0.05, 0.05, 0.22, 2, 0.02), M.satin);
  arm2.position.set(0, 1.25, -0.06);
  arm2.rotation.x = -0.25;
  cart.add(arm1, joint, arm2);
  const monitor = new THREE.Group();
  monitor.position.set(0, 1.5, 0.04);
  monitor.rotation.x = -0.12;
  cart.add(monitor);
  const housing = new THREE.Mesh(new RoundedBoxGeometry(0.58, 0.38, 0.045, 3, 0.014), M.plastic);
  monitor.add(housing);
  const screenMat = ultrasoundScreenMaterial();
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.54, 0.3375), screenMat);
  screen.position.z = 0.0232;
  screen.name = 'US_Screen';
  monitor.add(screen);
  castAll(cart);
  screen.castShadow = false;

  /* Examination bed with paper sheet and pillow */
  const bed = new THREE.Group();
  bed.position.copy(BED_POS);
  g.add(bed);
  const legGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.55, 12);
  for (const [x, z] of [[-0.27, -0.85], [0.27, -0.85], [-0.27, 0.85], [0.27, 0.85]]) {
    const leg = new THREE.Mesh(legGeo, M.aluminium);
    leg.position.set(x, 0.275, z);
    bed.add(leg);
  }
  const bedFrame = new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.06, 1.86, 2, 0.02), M.aluminium);
  bedFrame.position.y = 0.57;
  const mattress = new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.08, 1.88, 4, 0.03), M.pad);
  mattress.position.y = 0.63;
  const paper = new THREE.Mesh(new RoundedBoxGeometry(0.5, 0.004, 1.86, 1, 0.002), M.sheet);
  paper.position.y = 0.672;
  const pillow = new THREE.Mesh(new RoundedBoxGeometry(0.46, 0.08, 0.3, 4, 0.035), M.pillow);
  pillow.position.set(0, 0.705, -0.72);
  bed.add(bedFrame, mattress, paper, pillow);
  castAll(bed);

  /* Probe resting on a gel pad, cable back to the cart */
  const gelPad = new THREE.Mesh(
    new RoundedBoxGeometry(0.11, 0.012, 0.11, 3, 0.005),
    new THREE.MeshStandardMaterial({ color: 0xcfe6f5, roughness: 0.05, transparent: true, opacity: 0.72 })
  );
  gelPad.position.copy(PROBE_POS).add(new THREE.Vector3(0, -0.006, 0));
  g.add(gelPad);
  const probe = new THREE.Mesh(probeGeometry(), M.shellWarm);
  probe.position.copy(PROBE_POS).add(new THREE.Vector3(0, 0.002, 0));
  probe.rotation.set(0, 0, Math.PI / 2 - 0.06);
  probe.rotation.order = 'YXZ';
  probe.rotation.y = 0.9;
  probe.castShadow = true;
  g.add(probe);
  const tail = new THREE.Vector3(-0.13, 0.0, 0).applyEuler(probe.rotation).add(probe.position);
  const cableCurve = new THREE.CatmullRomCurve3([
    tail,
    tail.clone().add(new THREE.Vector3(-0.15, 0.02, -0.08)),
    new THREE.Vector3(6.1, 0.55, -0.35),
    new THREE.Vector3(5.95, 0.42, -0.62),
    new THREE.Vector3(5.98, 0.8, -0.72)
  ]);
  const cable = new THREE.Mesh(new THREE.TubeGeometry(cableCurve, 80, 0.0055, 8), M.plastic);
  cable.castShadow = true;
  g.add(cable);

  /* Floor rings under the probe */
  const ringsMat = floorRingsMaterial();
  const rings = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2), ringsMat);
  rings.rotation.x = -Math.PI / 2;
  rings.position.set(PROBE_POS.x, 0.003, PROBE_POS.z);
  rings.renderOrder = 2;
  g.add(rings);

  return { group: g, screen, screenUniforms: screenMat.userData.uniforms, rings, ringsMat };
}

/* ------------------------------------------------------------------ */
/* Reporting desk                                                       */
/* ------------------------------------------------------------------ */
export function buildDesk(M) {
  const g = new THREE.Group();
  g.name = 'ReportingDesk';
  g.position.copy(DESK_POS);

  const top = new THREE.Mesh(new RoundedBoxGeometry(1.8, 0.035, 0.8, 3, 0.012), M.deskTop);
  top.position.set(0, 0.74, 0.12);
  g.add(top);
  [-0.82, 0.82].forEach((x) => {
    const leg = new THREE.Mesh(new RoundedBoxGeometry(0.06, 0.72, 0.66, 2, 0.01), M.satin);
    leg.position.set(x, 0.36, 0.12);
    g.add(leg);
  });
  const modesty = new THREE.Mesh(new RoundedBoxGeometry(1.6, 0.4, 0.02, 2, 0.006), M.satin);
  modesty.position.set(0, 0.48, -0.2);
  g.add(modesty);

  // Dual diagnostic displays, angled inwards
  const screens = [];
  [-0.34, 0.34].forEach((x, i) => {
    const mon = new THREE.Group();
    mon.position.set(x, 1.1, -0.08);
    mon.rotation.y = i === 0 ? 0.18 : -0.18;
    const housing = new THREE.Mesh(new RoundedBoxGeometry(0.66, 0.43, 0.05, 3, 0.012), M.plastic);
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.632, 0.395), screenMaterial(placeholderMap(), 0));
    screen.position.z = 0.0255;
    screen.name = i === 0 ? 'Desk_Screen_L' : 'Desk_Screen_R';
    mon.add(housing, screen);
    const neck = new THREE.Mesh(new RoundedBoxGeometry(0.06, 0.32, 0.03, 2, 0.01), M.aluminium);
    neck.position.set(0, -0.26, -0.05);
    const foot = new THREE.Mesh(new RoundedBoxGeometry(0.24, 0.015, 0.2, 2, 0.006), M.aluminium);
    foot.position.set(0, -0.355, 0.0);
    mon.add(neck, foot);
    g.add(mon);
    screens.push(screen);
  });

  // Keyboard + mouse
  const kb = new THREE.Mesh(new RoundedBoxGeometry(0.44, 0.018, 0.14, 2, 0.006), M.plastic);
  kb.position.set(-0.05, 0.767, 0.26);
  g.add(kb);
  const keyGeo = new RoundedBoxGeometry(0.0165, 0.006, 0.0165, 1, 0.002);
  const keys = new THREE.InstancedMesh(keyGeo, new THREE.MeshStandardMaterial({ color: 0x3a3e44, roughness: 0.55 }), 15 * 5);
  const mtx = new THREE.Matrix4();
  for (let i = 0; i < 75; i++) {
    const c = i % 15, r = Math.floor(i / 15);
    mtx.makeTranslation(-0.05 - 0.196 + c * 0.028, 0.778, 0.26 - 0.05 + r * 0.025);
    keys.setMatrixAt(i, mtx);
  }
  g.add(keys);
  const mouse = new THREE.Mesh(new THREE.SphereGeometry(0.03, 24, 12), M.plastic);
  mouse.scale.set(1, 0.5, 1.6);
  mouse.position.set(0.32, 0.77, 0.27);
  g.add(mouse);

  // Desk lamp (warm practical): slim LED bar on an arm
  const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.02, 32), M.satinDark);
  lampBase.position.set(-0.76, 0.768, -0.12);
  const lampArm = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.44, 12), M.aluminium);
  lampArm.position.set(-0.76, 0.99, -0.12);
  const lampHead = new THREE.Mesh(new RoundedBoxGeometry(0.05, 0.022, 0.34, 2, 0.008), M.satinDark);
  lampHead.position.set(-0.76, 1.215, 0.02);
  lampHead.rotation.x = -0.12;
  const bulb = new THREE.Mesh(new THREE.PlaneGeometry(0.03, 0.3), new THREE.MeshStandardMaterial({ color: 0, emissive: 0xffd8b0, emissiveIntensity: 4 }));
  bulb.rotation.x = Math.PI / 2 - 0.12;
  bulb.position.set(-0.76, 1.2025, 0.02);
  g.add(lampBase, lampArm, lampHead, bulb);

  // Chair
  const chair = new THREE.Group();
  chair.position.set(0.72, 0, 1.0);
  chair.rotation.y = 0.75;
  const fabric = new THREE.MeshStandardMaterial({ color: 0x2c3036, roughness: 0.9 });
  const seat = new THREE.Mesh(new RoundedBoxGeometry(0.5, 0.08, 0.48, 3, 0.03), fabric);
  seat.position.y = 0.48;
  const back = new THREE.Mesh(new RoundedBoxGeometry(0.46, 0.55, 0.06, 3, 0.03), fabric);
  back.position.set(0, 0.86, 0.24);
  back.rotation.x = -0.12;
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.36, 16), M.chrome);
  post.position.y = 0.27;
  chair.add(seat, back, post);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const spoke = new THREE.Mesh(new RoundedBoxGeometry(0.3, 0.03, 0.04, 2, 0.01), M.satinDark);
    spoke.position.set(Math.cos(a) * 0.15, 0.07, Math.sin(a) * 0.15);
    spoke.rotation.y = -a;
    const wheel = new THREE.Mesh(new THREE.SphereGeometry(0.025, 12, 8), M.rubber);
    wheel.position.set(Math.cos(a) * 0.3, 0.025, Math.sin(a) * 0.3);
    chair.add(spoke, wheel);
  }
  g.add(chair);
  castAll(g);
  screens.forEach((s) => (s.castShadow = false));
  return { group: g, screens };
}
