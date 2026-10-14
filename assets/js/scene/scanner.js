/**
 * Procedural CT scanner (fallback until assets/models/ct-scanner.glb is supplied).
 * Real-world scale in metres. Bore axis = world Z, isocentre at y = ISO_Y.
 * Gantry depth ≈ 0.8 m, aperture 0.78 m, outer width ≈ 2.04 m (typical 16-slice MDCT).
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { gantryDisplayTexture } from './textures.js';
import { screenMaterial } from './materials.js';

export const ISO_Y = 1.05;
export const BORE_R = 0.39;
export const GANTRY_FRONT_Z = 0.42;
export const TABLE_Y = 0.9; // top of the couch pad
export const TABLE_OUT_Z = 1.95; // table-top centre when loading the patient
export const TABLE_IN_Z = 0.62; // table-top centre with the chest at the isocentre
export const LASER_Z = 0.62; // external alignment laser plane, just in front of the gantry

const shadow = (o, cast = true, receive = true) => {
  o.traverse((m) => {
    if (m.isMesh) {
      m.castShadow = cast;
      m.receiveShadow = receive;
    }
  });
  return o;
};

/* ------------------------------------------------------------------ */
/* Gantry                                                              */
/* ------------------------------------------------------------------ */
function housingShape() {
  const W = 1.02, B = 0.1, T = 2.06, rb = 0.16, rt = 0.98;
  const s = new THREE.Shape();
  s.moveTo(-W + rb, B);
  s.lineTo(W - rb, B);
  s.quadraticCurveTo(W, B, W, B + rb);
  s.lineTo(W, T - rt);
  s.absarc(W - rt, T - rt, rt, 0, Math.PI / 2, false);
  s.lineTo(-W + rt, T);
  s.absarc(-W + rt, T - rt, rt, Math.PI / 2, Math.PI, false);
  s.lineTo(-W, B + rb);
  s.quadraticCurveTo(-W, B, -W + rb, B);
  const hole = new THREE.Path();
  hole.absarc(0, ISO_Y, 0.53, 0, Math.PI * 2, true);
  s.holes.push(hole);
  return s;
}

/** Smoked detector window inside the bore: shows the rotor as an angular motion blur. */
function rotorMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { uAngle: { value: 0 }, uSpeed: { value: 0 }, uGlow: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec2 vUv; varying vec3 vN; varying vec3 vView;
      void main() {
        vUv = uv;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal); vView = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uAngle; uniform float uSpeed; uniform float uGlow;
      varying vec2 vUv; varying vec3 vN; varying vec3 vView;
      float hash(float n) { return fract(sin(n) * 43758.5453); }
      void main() {
        float a = vUv.x * 6.2831853;
        // detector modules + tube housing seen through smoked polycarbonate
        float blur = clamp(uSpeed, 0.0, 1.0);
        float acc = 0.0;
        for (int i = 0; i < 12; i++) {
          float o = (float(i) / 11.0 - 0.5) * blur * 1.6;
          float x = a + uAngle + o;
          float mod1 = step(0.55, fract(x * 24.0 / 6.2831853));
          float tube = smoothstep(0.35, 0.0, abs(mod(x, 6.2831853) - 3.14159));
          acc += mod1 * 0.35 + tube * 0.8;
        }
        acc /= 12.0;
        float band = smoothstep(0.0, 0.2, vUv.y) * smoothstep(1.0, 0.8, vUv.y);
        vec3 base = vec3(0.035, 0.038, 0.042);
        vec3 col = base + vec3(0.06, 0.065, 0.07) * acc * band;
        col += vec3(0.9, 0.12, 0.14) * uGlow * band * (0.25 + 0.75 * acc) * 0.25;
        float fres = pow(1.0 - abs(dot(normalize(vN), normalize(vView))), 3.0);
        col += vec3(0.18, 0.2, 0.22) * fres;
        gl_FragColor = vec4(col, 1.0);
      }`,
    side: THREE.DoubleSide
  });
}

export function buildGantry(M) {
  const g = new THREE.Group();
  g.name = 'Gantry';

  // Housing with soft rounded edges (bevel) — the big glossy white shell.
  const depth = 0.56, bevel = 0.12;
  const housingGeo = new THREE.ExtrudeGeometry(housingShape(), {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: 0.075,
    bevelSegments: 10,
    curveSegments: 120
  });
  housingGeo.translate(0, 0, -depth / 2);
  const housing = new THREE.Mesh(housingGeo, M.shell);
  housing.name = 'Housing';
  g.add(housing);

  // Removable front-cover seam and a subtle split line around the side.
  const seam = new THREE.Mesh(new THREE.TorusGeometry(0.86, 0.0035, 6, 160), M.seam);
  seam.position.set(0, ISO_Y, depth / 2 + bevel - 0.002);
  g.add(seam);
  const sideSeam = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.004, 0.004), M.seam);
  sideSeam.position.set(0, 0.62, 0);
  sideSeam.visible = false;
  g.add(sideSeam);

  // Bore liner: rounded lip at both faces, straight satin bore, smoked rotor window in the middle.
  // Convex fillet from the bore wall (r = BORE_R) out to a trim ring standing just proud of the face.
  const zf = depth / 2 + bevel, rIn = BORE_R, rOut = 0.56, R = 0.1;
  const profile = [new THREE.Vector2(rIn, 0.075)];
  for (let i = 0; i <= 16; i++) {
    const a = (i / 16) * (Math.PI / 2);
    profile.push(new THREE.Vector2(rIn + (rOut - rIn) * (1 - Math.cos(a)), zf - R + Math.sin(a) * (R + 0.003)));
  }
  const lipGeo = new THREE.LatheGeometry(profile, 128);
  const lipFront = new THREE.Mesh(lipGeo, M.satin);
  lipFront.rotation.x = Math.PI / 2; // lathe +Y → world +Z (front)
  lipFront.position.y = ISO_Y;
  g.add(lipFront);
  const lipBack = lipFront.clone();
  lipBack.scale.y = -1; // mirrored to the back face
  g.add(lipBack);
  M.satin.side = THREE.DoubleSide;

  const rotor = new THREE.Mesh(new THREE.CylinderGeometry(rIn + 0.002, rIn + 0.002, 0.15, 128, 1, true), rotorMaterial());
  rotor.rotation.x = Math.PI / 2;
  rotor.position.y = ISO_Y;
  rotor.name = 'RotorWindow';
  g.add(rotor);

  // Thin brand-red LED strip set into a groove around the bore face.
  const groove = new THREE.Mesh(new THREE.TorusGeometry(0.61, 0.009, 8, 160), M.plastic);
  groove.position.set(0, ISO_Y, zf - 0.004);
  g.add(groove);
  const led = new THREE.Mesh(new THREE.TorusGeometry(0.61, 0.0042, 8, 160), M.led);
  led.position.set(0, ISO_Y, zf + 0.0015);
  led.name = 'LED_Strip';
  g.add(led);

  // Laser exit windows above the bore.
  const laserWins = [];
  [-0.2, 0.2].forEach((x) => {
    const w = new THREE.Mesh(new RoundedBoxGeometry(0.14, 0.018, 0.012, 2, 0.006), M.laserWindow);
    w.position.set(x, ISO_Y + 0.69, zf - 0.002);
    g.add(w);
    laserWins.push(w);
  });

  // Control panels either side of the bore.
  const btnGeo = new THREE.CylinderGeometry(0.011, 0.011, 0.006, 24);
  [-1, 1].forEach((side) => {
    const p = new THREE.Group();
    p.position.set(side * 0.78, ISO_Y - 0.02, zf - 0.006);
    p.rotation.z = side * -0.08;
    const plate = new THREE.Mesh(new RoundedBoxGeometry(0.12, 0.3, 0.02, 3, 0.008), M.satinDark);
    p.add(plate);
    for (let i = 0; i < 6; i++) {
      const b = new THREE.Mesh(btnGeo, i === 0 ? M.statusGreen : M.shellWarm);
      b.rotation.x = Math.PI / 2;
      b.position.set((i % 2 ? 0.025 : -0.025), 0.1 - Math.floor(i / 2) * 0.07, 0.012);
      p.add(b);
    }
    g.add(p);
  });

  // Patient-facing display (breath-hold pictogram, no text).
  const disp = new THREE.Group();
  disp.position.set(0, ISO_Y + 0.82, zf - 0.004);
  const bezel = new THREE.Mesh(new RoundedBoxGeometry(0.31, 0.16, 0.022, 3, 0.012), M.plastic);
  disp.add(bezel);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.27, 0.125), screenMaterial(gantryDisplayTexture(), 0.9));
  screen.position.z = 0.0115;
  disp.add(screen);
  g.add(disp);

  // Recessed plinth.
  const plinth = new THREE.Mesh(new RoundedBoxGeometry(1.78, 0.1, 0.62, 2, 0.02), M.satinDark);
  plinth.position.set(0, 0.05, 0);
  g.add(plinth);

  shadow(g);
  rotor.castShadow = false;
  return { group: g, rotor, led, laserWins };
}

/* ------------------------------------------------------------------ */
/* Couch                                                              */
/* ------------------------------------------------------------------ */
function cradleShape(w = 0.47, t = 0.032, lift = 0.04) {
  // shallow concave cradle cross-section (x across, y up)
  const s = new THREE.Shape();
  const n = 24;
  const top = [], bot = [];
  for (let i = 0; i <= n; i++) {
    const x = -w / 2 + (w * i) / n;
    const y = lift * Math.pow(Math.abs(x) / (w / 2), 2.4);
    top.push([x, y]);
    bot.push([x, y - t]);
  }
  s.moveTo(bot[0][0], bot[0][1]);
  for (const [x, y] of bot) s.lineTo(x, y);
  for (let i = n; i >= 0; i--) s.lineTo(top[i][0], top[i][1]);
  s.closePath();
  return s;
}

export function buildCouch(M) {
  const g = new THREE.Group();
  g.name = 'Couch';

  // Static base: foot plate, lift column, carriage rail.
  const foot = new THREE.Mesh(new RoundedBoxGeometry(0.64, 0.08, 1.7, 3, 0.03), M.satinDark);
  foot.position.set(0, 0.04, 1.95);
  const column = new THREE.Mesh(new RoundedBoxGeometry(0.5, 0.62, 1.2, 4, 0.07), M.shell);
  column.position.set(0, 0.39, 2.05);
  const shroud = new THREE.Mesh(new RoundedBoxGeometry(0.54, 0.09, 1.95, 3, 0.035), M.shellWarm);
  shroud.position.set(0, 0.725, 1.85);
  const rail = new THREE.Mesh(new RoundedBoxGeometry(0.4, 0.05, 1.9, 2, 0.015), M.satin);
  rail.position.set(0, 0.79, 1.75);
  g.add(foot, column, shroud, rail);

  // Moving table-top (cradle) with pad, head holder and foot-end handle.
  const top = new THREE.Group();
  top.name = 'Couch_Top';
  const L = 2.15;
  const cradle = new THREE.Mesh(
    new THREE.ExtrudeGeometry(cradleShape(), { depth: L, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.01, bevelSegments: 4, curveSegments: 8 }),
    M.shell
  );
  cradle.geometry.translate(0, 0, -L / 2);
  cradle.position.y = -0.045;
  top.add(cradle);

  const pad = new THREE.Mesh(new RoundedBoxGeometry(0.42, 0.045, 1.94, 4, 0.02), M.pad);
  pad.position.set(0, -0.022, 0.08);
  top.add(pad);

  // Head rests on a low pad at the gantry end.
  const headPad = new THREE.Mesh(new RoundedBoxGeometry(0.2, 0.04, 0.24, 3, 0.018), M.pillow);
  headPad.position.set(0, 0.012, -L / 2 + 0.15);
  top.add(headPad);

  // Foot-end handle loop.
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.017, 12, 48, Math.PI), M.satin);
  handle.rotation.set(-Math.PI / 2, 0, 0);
  handle.position.set(0, -0.03, L / 2 + 0.01);
  top.add(handle);

  top.position.set(0, TABLE_Y, TABLE_OUT_Z);
  g.add(top);
  shadow(g);
  return { group: g, top };
}
