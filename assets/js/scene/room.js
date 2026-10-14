/**
 * Procedural radiology suite (fallback until assets/models/radiology-room.glb is supplied).
 * One continuous space with three lit bays: CT (x≈0), ultrasound (x≈6) and reporting (x≈10.4).
 * Ceiling LED panels are real RectAreaLights; each has an emissive panel mesh so it reads
 * in reflections and blooms slightly.
 */
import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { screenMaterial } from './materials.js';

export const ROOM = { x0: -4.4, x1: 12.6, z0: -3.6, z1: 6.0, h: 2.85 };

/** Ceiling panel layout: [x, z, width, depth, bay] */
export const PANELS = [
  [-1.25, -1.1, 1.2, 0.6, 'ct'],
  [1.25, -1.1, 1.2, 0.6, 'ct'],
  [-1.25, 1.5, 1.2, 0.6, 'ct'],
  [1.25, 1.5, 1.2, 0.6, 'ct'],
  [0, 3.6, 1.2, 0.6, 'ct'],
  [5.6, -0.4, 1.2, 0.6, 'us'],
  [7.4, -0.4, 1.2, 0.6, 'us'],
  [10.4, -1.7, 1.2, 0.6, 'desk']
];

const COOL = new THREE.Color().setHSL(0.58, 0.18, 1); // ≈ 6000 K white
const WARM = new THREE.Color(0xffd6ae);

export function buildRoom(M, { tier, monitorTextures = null } = {}) {
  RectAreaLightUniformsLib.init();
  const g = new THREE.Group();
  g.name = 'Room';
  const W = ROOM.x1 - ROOM.x0, D = ROOM.z1 - ROOM.z0;

  // Floor (receives shadows; reflections are added by the post stack on the high tier)
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), M.floor);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set((ROOM.x0 + ROOM.x1) / 2, 0, (ROOM.z0 + ROOM.z1) / 2);
  floor.receiveShadow = true;
  floor.name = 'Floor';
  // world-scaled UVs so maps tile at a constant physical size (≈ 1.6 m)
  const uv = floor.geometry.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * (W / 1.6) / 3, uv.getY(i) * (D / 1.6) / 3);
  g.add(floor);

  // Back wall: panelled, with the control-room window behind the gantry.
  const backing = new THREE.Mesh(new THREE.PlaneGeometry(W, ROOM.h), new THREE.MeshStandardMaterial({ color: 0x9aa0a6, roughness: 0.9 }));
  backing.position.set((ROOM.x0 + ROOM.x1) / 2, ROOM.h / 2, ROOM.z0 - 0.012);
  g.add(backing);
  const WIN = { x0: -2.75, x1: -0.35, y0: 0.95, y1: 2.05 };
  const panelW = 1.2, gap = 0.006;
  const panelGeo = new RoundedBoxGeometry(panelW - gap, ROOM.h - 0.12, 0.02, 2, 0.004);
  for (let x = ROOM.x0; x < ROOM.x1 - 0.01; x += panelW) {
    const cx = x + panelW / 2;
    if (cx > WIN.x0 - 0.1 && cx < WIN.x1 + 0.1) {
      // panels around the window opening
      const below = new THREE.Mesh(new RoundedBoxGeometry(panelW - gap, WIN.y0 - 0.12, 0.02, 2, 0.004), M.wallPanel);
      below.position.set(cx, 0.12 + (WIN.y0 - 0.12) / 2, ROOM.z0);
      const above = new THREE.Mesh(new RoundedBoxGeometry(panelW - gap, ROOM.h - WIN.y1, 0.02, 2, 0.004), M.wallPanel);
      above.position.set(cx, WIN.y1 + (ROOM.h - WIN.y1) / 2, ROOM.z0);
      g.add(below, above);
      continue;
    }
    const p = new THREE.Mesh(panelGeo, M.wallPanel);
    p.position.set(cx, 0.12 + (ROOM.h - 0.12) / 2, ROOM.z0);
    p.receiveShadow = true;
    g.add(p);
  }
  // window opening: remove backing behind it by covering with the control room
  const skirting = new THREE.Mesh(new THREE.BoxGeometry(W, 0.12, 0.03), M.skirting);
  skirting.position.set((ROOM.x0 + ROOM.x1) / 2, 0.06, ROOM.z0 + 0.01);
  g.add(skirting);

  // Control-room window: aluminium frame, glass, dim room behind with glowing screens.
  const cw = WIN.x1 - WIN.x0, ch = WIN.y1 - WIN.y0, cxw = (WIN.x0 + WIN.x1) / 2, cyw = (WIN.y0 + WIN.y1) / 2;
  const frame = new THREE.Group();
  const bar = (w, h, x, y) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.07), M.aluminium);
    m.position.set(x, y, ROOM.z0 + 0.01);
    frame.add(m);
  };
  bar(cw + 0.08, 0.05, cxw, WIN.y0);
  bar(cw + 0.08, 0.05, cxw, WIN.y1);
  bar(0.05, ch, WIN.x0, cyw);
  bar(0.05, ch, WIN.x1, cyw);
  bar(0.03, ch, cxw, cyw);
  g.add(frame);
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(cw, ch), M.glass);
  glass.position.set(cxw, cyw, ROOM.z0 + 0.01);
  g.add(glass);
  // hole in backing: render the control room behind at lower brightness
  backing.material = backing.material.clone();
  const ctrl = new THREE.Group();
  const ctrlMat = new THREE.MeshStandardMaterial({ color: 0x3a4048, roughness: 0.9 });
  const ctrlBox = new THREE.Mesh(new THREE.BoxGeometry(cw + 0.6, ROOM.h, 2.4), ctrlMat);
  ctrlBox.material.side = THREE.BackSide;
  ctrlBox.position.set(cxw, ROOM.h / 2, ROOM.z0 - 1.21);
  ctrl.add(ctrlBox);
  const ctrlDesk = new THREE.Mesh(new RoundedBoxGeometry(cw, 0.04, 0.7, 2, 0.01), new THREE.MeshStandardMaterial({ color: 0x8c8f93, roughness: 0.5 }));
  ctrlDesk.position.set(cxw, 0.76, ROOM.z0 - 0.55);
  ctrl.add(ctrlDesk);
  const ctrlScreens = [];
  [-0.55, 0.0, 0.55].forEach((dx, i) => {
    const s = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.31), new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xbcd3ff, emissiveIntensity: i === 1 ? 1.1 : 0.7 }));
    s.position.set(cxw + dx, 1.12, ROOM.z0 - 0.78);
    ctrl.add(s);
    ctrlScreens.push(s);
  });
  const ctrlLight = new THREE.PointLight(0x9fb7d6, 0.8, 4, 2);
  ctrlLight.position.set(cxw, 2.2, ROOM.z0 - 1.2);
  ctrl.add(ctrlLight);
  g.add(ctrl);
  // cut the backing where the window is (backing split into four strips)
  g.remove(backing);
  const backStrips = [
    [ROOM.x0, WIN.x0, 0, ROOM.h],
    [WIN.x1, ROOM.x1, 0, ROOM.h],
    [WIN.x0, WIN.x1, 0, WIN.y0],
    [WIN.x0, WIN.x1, WIN.y1, ROOM.h]
  ];
  backStrips.forEach(([xa, xb, ya, yb]) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(xb - xa, yb - ya), backing.material);
    m.position.set((xa + xb) / 2, (ya + yb) / 2, ROOM.z0 - 0.012);
    g.add(m);
  });

  // Side walls: dark backing with the same panel system as the back wall
  const side = (x, rotY) => {
    const w = new THREE.Mesh(new THREE.PlaneGeometry(D, ROOM.h), backing.material);
    w.position.set(x, ROOM.h / 2, (ROOM.z0 + ROOM.z1) / 2);
    w.rotation.y = rotY;
    g.add(w);
    const dir = Math.sign(-x + (ROOM.x0 + ROOM.x1) / 2);
    for (let z = ROOM.z0; z < ROOM.z1 - 0.01; z += panelW) {
      const p = new THREE.Mesh(panelGeo, M.wallPanel);
      p.rotation.y = rotY;
      p.position.set(x + dir * 0.012, 0.12 + (ROOM.h - 0.12) / 2, z + panelW / 2);
      p.receiveShadow = true;
      g.add(p);
    }
  };
  side(ROOM.x0, Math.PI / 2);
  side(ROOM.x1, -Math.PI / 2);

  // Low cabinets along the left wall (dark doors, light worktop), like a real scan room.
  const cab = new THREE.Group();
  const doorMat = new THREE.MeshStandardMaterial({ color: 0x3c4148, roughness: 0.3 });
  for (let i = 0; i < 4; i++) {
    const door = new THREE.Mesh(new RoundedBoxGeometry(0.58, 0.82, 0.6, 2, 0.01), doorMat);
    door.position.set(0, 0.45, -1.6 + i * 0.6);
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.012, 0.16), M.aluminium);
    handle.position.set(0.31, 0.72, -1.6 + i * 0.6);
    cab.add(door, handle);
  }
  const worktop = new THREE.Mesh(new RoundedBoxGeometry(0.64, 0.035, 2.44, 2, 0.008), M.deskTop);
  worktop.position.set(0, 0.875, -0.7);
  cab.add(worktop);
  cab.position.set(ROOM.x0 + 0.32, 0, 0);
  cab.traverse((m) => m.isMesh && ((m.castShadow = true), (m.receiveShadow = true)));
  g.add(cab);

  // Frosted glass partition between the CT and ultrasound bays.
  const part = new THREE.Group();
  const pg = new THREE.Mesh(new THREE.PlaneGeometry(2.9, ROOM.h - 0.1), M.frostedGlass);
  pg.rotation.y = Math.PI / 2;
  pg.position.set(3.45, (ROOM.h - 0.1) / 2 + 0.05, ROOM.z0 + 1.45);
  part.add(pg);
  [ROOM.z0 + 0.0, ROOM.z0 + 2.9].forEach((z) => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.05, ROOM.h, 0.05), M.aluminium);
    post.position.set(3.45, ROOM.h / 2, z);
    part.add(post);
  });
  g.add(part);

  // Ceiling with recessed light panels.
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(W, D), M.ceiling);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set((ROOM.x0 + ROOM.x1) / 2, ROOM.h, (ROOM.z0 + ROOM.z1) / 2);
  g.add(ceiling);

  // Each ceiling panel is its own emissive mesh; light comes from one RectAreaLight per
  // panel group (fewer lights = much faster shader compiles, same look).
  const panels = [];
  PANELS.forEach(([x, z, w, d, bay], i) => {
    const mat = M.ceilingPanel.clone();
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat);
    panel.rotation.x = Math.PI / 2;
    panel.position.set(x, ROOM.h - 0.004, z);
    // aluminium frame around the diffuser (four thin bars, so the panel itself stays visible)
    for (const [bw, bd, ox, oz] of [[w + 0.05, 0.025, 0, d / 2 + 0.012], [w + 0.05, 0.025, 0, -d / 2 - 0.012], [0.025, d, w / 2 + 0.012, 0], [0.025, d, -w / 2 - 0.012, 0]]) {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(bw, 0.012, bd), M.aluminium);
      bar.position.set(x + ox, ROOM.h - 0.006, z + oz);
      g.add(bar);
    }
    g.add(panel);
    panels.push({ mesh: panel, bay, index: i });
  });
  const lights = [];
  const group = (indices, bay, luminance) => {
    const ps = indices.map((i) => PANELS[i]);
    const xa = Math.min(...ps.map((p) => p[0] - p[2] / 2)), xb = Math.max(...ps.map((p) => p[0] + p[2] / 2));
    const za = Math.min(...ps.map((p) => p[1] - p[3] / 2)), zb = Math.max(...ps.map((p) => p[1] + p[3] / 2));
    const w = xb - xa, d = zb - za, emitting = ps.reduce((a, p) => a + p[2] * p[3], 0);
    const light = new THREE.RectAreaLight(COOL, 0, w, d);
    light.position.set((xa + xb) / 2, ROOM.h - 0.01, (za + zb) / 2);
    light.lookAt((xa + xb) / 2, 0, (za + zb) / 2);
    g.add(light);
    // same total flux as the individual panels
    lights.push({ light, bay, base: (luminance * emitting) / (w * d), panelIdx: indices });
  };
  group([0, 2], 'ct', 11);
  group([1, 3], 'ct', 11);
  group([5, 6], 'us', 11);
  group([7], 'desk', 5);

  // Shadow-casting key lights (soft spots from the ceiling) — give the contact shadows direction.
  const shadowSize = tier === 'high' ? 2048 : 1024;
  const spots = [];
  const spot = (x, z, tx, tz, intensity, bay, cast) => {
    const s = new THREE.SpotLight(COOL, 0, 7, 0.95, 1, 2);
    s.position.set(x, ROOM.h - 0.05, z);
    s.target.position.set(tx, 0, tz);
    s.castShadow = cast;
    if (cast) {
      s.shadow.mapSize.set(shadowSize, shadowSize);
      s.shadow.bias = -0.0002;
      s.shadow.normalBias = 0.025;
      s.shadow.radius = 6;
      s.shadow.camera.near = 0.5;
      s.shadow.camera.far = 6;
    }
    g.add(s, s.target);
    spots.push({ light: s, base: intensity, bay });
    return s;
  };
  spot(0.6, 1.6, 0, 1.2, 7, 'ct', true);
  spot(6.4, 0.2, 6.2, -0.4, 5, 'us', tier === 'high');

  // The one subtle warm fill: the desk lamp in the reporting bay.
  const warm = new THREE.PointLight(WARM, 0, 3.2, 2);
  warm.position.set(9.6, 1.25, -2.6);
  g.add(warm);

  return { group: g, lights, panels, spots, warm, ctrlScreens, floor };
}
