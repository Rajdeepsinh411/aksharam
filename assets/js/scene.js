/**
 * Aksharam Diagnostics: home page 3D story ("how a scan happens").
 * Everything is built procedurally; no external models.
 *
 * Scroll timeline (t = 0…5, one unit per story step):
 *   0 hero orbit → 1 table glides in → 2 scan plane sweeps → 3 slices fan out
 *   → 4 ultrasound waves → 5 report ready
 */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const RED = 0xae1f27;
const BG = 0x1c1e22;

export async function initScene({ canvas, story, onProgress = () => {}, onReady = () => {} }) {
  const { gsap, ScrollTrigger } = window;
  if (!canvas || !story) throw new Error('Scene: canvas or story element missing');
  if (!gsap || !ScrollTrigger) throw new Error('Scene: GSAP not loaded');

  const wrap = canvas.parentElement;
  const lowPower =
    window.matchMedia('(max-width: 767px)').matches || window.matchMedia('(pointer: coarse)').matches;
  const SEG = lowPower ? 48 : 96;

  /* ---------------- Renderer, scene, camera ---------------- */
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !lowPower || window.devicePixelRatio < 2,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowPower ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BG);
  scene.fog = new THREE.Fog(BG, 12, 26);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.8;
  pmrem.dispose();
  onProgress(0.3);

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x2a2d33, 0.4));
  const key = new THREE.DirectionalLight(0xffffff, 1.7);
  key.position.set(4, 7, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(RED, 3.2);
  rim.position.set(-5, 2.5, -6);
  scene.add(rim);
  const rimPoint = new THREE.PointLight(RED, 5, 9, 2);
  rimPoint.position.set(-2.4, 2.8, -1.4);
  scene.add(rimPoint);

  /* ---------------- Materials ---------------- */
  const M = {
    shell: new THREE.MeshPhysicalMaterial({
      color: 0xf3f4f6, roughness: 0.26, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.12, side: THREE.DoubleSide
    }),
    base: new THREE.MeshStandardMaterial({ color: 0xdfe2e6, roughness: 0.42 }),
    grey: new THREE.MeshStandardMaterial({ color: 0x5e6066, roughness: 0.42, metalness: 0.35 }),
    greyLight: new THREE.MeshStandardMaterial({ color: 0xa3a7ad, roughness: 0.45, metalness: 0.25 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x2a2d32, roughness: 0.5, metalness: 0.2 }),
    red: new THREE.MeshStandardMaterial({ color: RED, emissive: RED, emissiveIntensity: 0.6, roughness: 0.35 }),
    white: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.32 }),
    cushion: new THREE.MeshStandardMaterial({ color: 0xc9d1da, roughness: 0.7 }),
    patient: new THREE.MeshPhysicalMaterial({
      color: 0xe2ebf3, roughness: 0.18, clearcoat: 1, transparent: true, opacity: 0.5, depthWrite: false,
      emissive: 0x16202b, emissiveIntensity: 0.6
    })
  };

  /* ---------------- Floor, logo arcs, soft shadows ---------------- */
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(18, SEG),
    new THREE.MeshStandardMaterial({ color: 0x212429, roughness: 0.92 })
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  const floorArcMat = new THREE.MeshBasicMaterial({ color: 0x3c4047, transparent: true, opacity: 0.7, depthWrite: false });
  for (let i = 0; i < 6; i++) {
    const r = 2.5 + i * 0.55;
    const ring = new THREE.Mesh(new THREE.RingGeometry(r, r + 0.022, SEG, 1, -Math.PI / 4 - 0.85, 1.7), floorArcMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.004;
    scene.add(ring);
  }

  const shadowMat = new THREE.MeshBasicMaterial({ map: radialTexture(), transparent: true, depthWrite: false });
  const blob = (w, d, x, z) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), shadowMat);
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, 0.006, z);
    scene.add(m);
  };
  blob(4.2, 2.4, 0, 0);
  blob(1.8, 4.4, 0, 2.6);
  blob(1.6, 1.6, 6.6, 0.2);
  blob(1.8, 1.4, 3.3, 1.5);

  /* ---------------- CT gantry ---------------- */
  const ct = new THREE.Group();
  scene.add(ct);
  const G_Y = 1.62;
  const RI = 0.82;
  const RO = 1.56;
  const HD = 0.42;
  const CR = 0.12;

  const gantry = new THREE.Group();
  gantry.position.set(0, G_Y, 0);
  ct.add(gantry);

  // Rounded-rectangle profile revolved into a ring (bore axis → world Z).
  const prof = [];
  const corner = (cx, cy, a0, a1) => {
    for (let i = 0; i <= 8; i++) {
      const a = a0 + ((a1 - a0) * i) / 8;
      prof.push(new THREE.Vector2(cx + Math.cos(a) * CR, cy + Math.sin(a) * CR));
    }
  };
  corner(RI + CR, -HD + CR, Math.PI, 1.5 * Math.PI);
  corner(RO - CR, -HD + CR, 1.5 * Math.PI, 2 * Math.PI);
  corner(RO - CR, HD - CR, 0, 0.5 * Math.PI);
  corner(RI + CR, HD - CR, 0.5 * Math.PI, Math.PI);
  prof.push(prof[0].clone());
  const shell = new THREE.Mesh(new THREE.LatheGeometry(prof, SEG), M.shell);
  shell.rotation.x = Math.PI / 2;
  gantry.add(shell);

  // Grey inner ring on the front face, with a rotating detector ring.
  const innerRing = new THREE.Mesh(new THREE.RingGeometry(RI + 0.005, RI + 0.2, SEG), M.grey);
  innerRing.position.z = HD + 0.003;
  gantry.add(innerRing);

  const rotor = new THREE.Group();
  rotor.position.z = HD + 0.008;
  gantry.add(rotor);
  const tickGeo = new THREE.BoxGeometry(0.09, 0.026, 0.012);
  const ticks = lowPower ? 14 : 22;
  for (let i = 0; i < ticks; i++) {
    const a = (i / ticks) * Math.PI * 2;
    const tick = new THREE.Mesh(tickGeo, i % (ticks / 2) === 0 ? M.red : M.greyLight);
    tick.position.set(Math.cos(a) * (RI + 0.1), Math.sin(a) * (RI + 0.1), 0);
    tick.rotation.z = a + Math.PI / 2;
    rotor.add(tick);
  }

  // Thin red accent bands: front face + around the rim.
  const frontBand = new THREE.Mesh(new THREE.TorusGeometry(RO - 0.17, 0.013, 8, SEG), M.red);
  frontBand.position.z = HD + 0.004;
  gantry.add(frontBand);
  const rimBand = new THREE.Mesh(new THREE.TorusGeometry(RO + 0.004, 0.02, 8, SEG), M.red);
  gantry.add(rimBand);

  // Small status panel on the front.
  const panel = new THREE.Mesh(new RoundedBoxGeometry(0.36, 0.15, 0.03, 3, 0.03), M.dark);
  panel.position.set(0, RI + 0.39, HD + 0.01);
  gantry.add(panel);
  const led = new THREE.Mesh(new THREE.CircleGeometry(0.018, 16), M.red);
  led.position.set(0.12, RI + 0.39, HD + 0.027);
  gantry.add(led);

  const stand = new THREE.Mesh(new RoundedBoxGeometry(1.55, 0.56, 1.0, 3, 0.1), M.base);
  stand.position.set(0, 0.28, 0);
  ct.add(stand);

  /* ---------------- Patient table ---------------- */
  const T_Y = 1.12;
  const Z_OUT = 2.5;
  const Z_IN = 0.55;

  const column = new THREE.Mesh(new RoundedBoxGeometry(0.5, 0.95, 1.1, 3, 0.06), M.base);
  column.position.set(0, 0.475, 2.75);
  ct.add(column);
  const foot = new THREE.Mesh(new RoundedBoxGeometry(0.82, 0.08, 1.6, 2, 0.03), M.grey);
  foot.position.set(0, 0.04, 2.75);
  ct.add(foot);
  const carriage = new THREE.Mesh(new RoundedBoxGeometry(0.56, 0.1, 1.5, 2, 0.04), M.greyLight);
  carriage.position.set(0, T_Y - 0.08, 2.55);
  ct.add(carriage);

  const top = new THREE.Group();
  top.position.set(0, T_Y, Z_OUT);
  ct.add(top);
  const slab = new THREE.Mesh(new RoundedBoxGeometry(0.62, 0.07, 3.0, 3, 0.03), M.white);
  top.add(slab);
  const cushion = new THREE.Mesh(new RoundedBoxGeometry(0.54, 0.04, 2.8, 2, 0.02), M.cushion);
  cushion.position.y = 0.05;
  top.add(cushion);
  [-0.312, 0.312].forEach((x) => {
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.014, 2.9), M.red);
    stripe.position.set(x, 0.012, 0);
    top.add(stripe);
  });

  // Abstract patient: featureless translucent capsule + head.
  const SURF = 0.075;
  const patient = new THREE.Group();
  top.add(patient);
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.19, 1.7, 8, lowPower ? 16 : 28), M.patient);
  body.rotation.x = Math.PI / 2;
  body.scale.set(1.25, 1, 0.78);
  body.position.set(0, SURF + 0.148, 0.3);
  patient.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, lowPower ? 16 : 28, lowPower ? 12 : 20), M.patient);
  head.scale.set(1, 0.9, 1.1);
  head.position.set(0, SURF + 0.117, -0.92);
  patient.add(head);

  /* ---------------- Scan plane (flat ring of red light) ---------------- */
  const scanMat = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(0xff3341) }, uOpacity: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uOpacity; varying vec2 vUv;
      void main() {
        float d = length(vUv - 0.5) * 2.0;
        float ring = exp(-pow((d - 0.62) / 0.06, 2.0));
        float fill = (1.0 - smoothstep(0.0, 0.62, d)) * 0.16;
        float a = (ring * 0.95 + fill) * uOpacity;
        if (a < 0.003) discard;
        gl_FragColor = vec4(uColor, a);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending
  });
  const scanPlane = new THREE.Mesh(new THREE.PlaneGeometry(1.25, 1.25), scanMat);
  scanPlane.position.set(0, T_Y + 0.21, 0);
  ct.add(scanPlane);
  const scanLight = new THREE.PointLight(0xff3341, 0, 2.5, 2);
  ct.add(scanLight);

  /* ---------------- Cross-sectional slices ---------------- */
  const N = lowPower ? 10 : 16;
  const sliceGroup = new THREE.Group();
  top.add(sliceGroup);
  const sliceMat = new THREE.MeshPhysicalMaterial({
    color: 0xeef2f6, roughness: 0.3, clearcoat: 0.6, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide
  });
  const sliceEdgeMat = new THREE.MeshBasicMaterial({ color: 0xff4351, transparent: true, opacity: 0, depthWrite: false });
  const sliceInnerMat = new THREE.MeshBasicMaterial({ color: 0x7c828b, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
  const discGeo = new THREE.CylinderGeometry(1, 1, 0.018, 40, 1);
  const edgeGeo = new THREE.TorusGeometry(1, 0.025, 6, 40);
  const innerGeo = new THREE.RingGeometry(0.42, 0.48, 32);
  const slices = [];
  for (let i = 0; i < N; i++) {
    const z0 = -0.98 + (i / (N - 1)) * 2.28;
    const isHead = z0 < -0.76;
    const rx = isHead ? 0.13 : z0 > 1.0 ? 0.19 : 0.235;
    const ry = isHead ? 0.12 : 0.145;
    const s = new THREE.Group();
    const disc = new THREE.Mesh(discGeo, sliceMat);
    disc.rotation.x = Math.PI / 2;
    disc.scale.set(rx, 1, ry);
    const edge = new THREE.Mesh(edgeGeo, sliceEdgeMat);
    edge.scale.set(rx, ry, 1);
    const inner = new THREE.Mesh(innerGeo, sliceInnerMat);
    inner.scale.set(rx, ry, 1);
    inner.position.z = 0.011;
    s.add(disc, edge, inner);
    s.userData = { z0, k: i / (N - 1) - 0.5 };
    sliceGroup.add(s);
    slices.push(s);
  }

  /* ---------------- Ultrasound station ---------------- */
  const us = new THREE.Group();
  us.position.set(6.6, 1.55, 0.2);
  scene.add(us);
  const usMats = [];
  const fade = (m) => {
    m.transparent = true;
    usMats.push(m);
    return m;
  };
  const probeShell = fade(M.shell.clone());
  const probeGrey = fade(M.grey.clone());
  const probeRed = fade(M.red.clone());
  const probeDark = fade(M.dark.clone());

  const probe = new THREE.Group();
  probe.rotation.z = Math.PI / 2; // face (local −Y) points to +X
  probe.rotation.y = -0.25;
  us.add(probe);
  const handle = new THREE.Mesh(
    new THREE.LatheGeometry(
      [[0, 0.02], [0.06, 0.02], [0.075, 0.12], [0.078, 0.46], [0.062, 0.62], [0.036, 0.76], [0.016, 0.84], [0, 0.84]].map(
        ([x, y]) => new THREE.Vector2(x, y)
      ),
      lowPower ? 24 : 40
    ),
    probeShell
  );
  probe.add(handle);
  const probeHead = new THREE.Mesh(new RoundedBoxGeometry(0.2, 0.13, 0.34, 4, 0.05), probeShell);
  probeHead.position.y = -0.03;
  probe.add(probeHead);
  const lens = new THREE.Mesh(new RoundedBoxGeometry(0.17, 0.03, 0.3, 2, 0.012), probeGrey);
  lens.position.y = -0.1;
  probe.add(lens);
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.077, 0.01, 8, 32), probeRed);
  collar.rotation.x = Math.PI / 2;
  collar.position.y = 0.13;
  probe.add(collar);
  const cable = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.82, 0),
        new THREE.Vector3(0.05, 1.2, -0.2),
        new THREE.Vector3(0.35, 1.5, -0.7),
        new THREE.Vector3(0.9, 1.6, -1.4)
      ]),
      32, 0.018, 8
    ),
    probeDark
  );
  probe.add(cable);

  // Concentric arcs pulsing outward (like the logo's sound waves).
  const arcs = [];
  const ARC_LEN = 1.5;
  const arcGeo = new THREE.TorusGeometry(1, 0.012, 6, lowPower ? 40 : 72, ARC_LEN);
  for (let i = 0; i < 6; i++) {
    const m = new THREE.MeshBasicMaterial({
      color: i % 3 === 0 ? 0xff3a48 : 0xd3d6db, transparent: true, opacity: 0, depthWrite: false
    });
    const a = new THREE.Mesh(arcGeo, m);
    a.rotation.z = -ARC_LEN / 2;
    a.userData.red = i % 3 === 0;
    a.position.x = 0.12;
    us.add(a);
    arcs.push(a);
  }
  const beam = new THREE.Mesh(
    new THREE.CircleGeometry(2.3, 32, -0.55, 1.1),
    fade(new THREE.MeshBasicMaterial({ color: 0xff3a48, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }))
  );
  beam.position.x = 0.12;
  us.add(beam);

  /* ---------------- Report card ---------------- */
  const report = new THREE.Group();
  report.position.set(3.3, 1.85, 1.5);
  scene.add(report);
  const repMats = [];
  const rfade = (m) => {
    m.transparent = true;
    repMats.push(m);
    return m;
  };
  const paperMat = rfade(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 }));
  const lineMat = rfade(new THREE.MeshStandardMaterial({ color: 0xc3c7cd, roughness: 0.6 }));
  const repRed = rfade(M.red.clone());
  const badgeMat = rfade(new THREE.MeshStandardMaterial({ color: 0xfbe8ea, roughness: 0.5 }));

  const paper = new THREE.Mesh(new RoundedBoxGeometry(1.1, 1.45, 0.035, 3, 0.03), paperMat);
  report.add(paper);
  const headerBar = new THREE.Mesh(new RoundedBoxGeometry(0.82, 0.07, 0.01, 2, 0.005), repRed);
  headerBar.position.set(0, 0.56, 0.022);
  report.add(headerBar);
  [0.82, 0.7, 0.78, 0.55, 0.74, 0.4].forEach((w, j) => {
    const line = new THREE.Mesh(new THREE.BoxGeometry(w, 0.028, 0.006), lineMat);
    line.position.set(-0.41 + w / 2, 0.39 - j * 0.115, 0.02);
    report.add(line);
  });
  const badge = new THREE.Group();
  badge.position.set(0.26, -0.43, 0.05);
  report.add(badge);
  badge.add(new THREE.Mesh(new THREE.CircleGeometry(0.22, 40), badgeMat));
  const badgeRing = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.016, 8, 48), repRed);
  badge.add(badgeRing);
  const checkPath = new THREE.CurvePath();
  checkPath.add(new THREE.LineCurve3(new THREE.Vector3(-0.1, 0.0, 0.01), new THREE.Vector3(-0.025, -0.08, 0.01)));
  checkPath.add(new THREE.LineCurve3(new THREE.Vector3(-0.025, -0.08, 0.01), new THREE.Vector3(0.12, 0.09, 0.01)));
  const check = new THREE.Mesh(new THREE.TubeGeometry(checkPath, 24, 0.022, 8), repRed);
  badge.add(check);

  onProgress(0.6);

  /* ---------------- Scroll-driven state ---------------- */
  const state = {
    az: 0.62, el: 0.2, dist: 8.4, tx: 0.1, ty: 1.45, tz: 1.2,
    table: 0, rotor: 0.15, scanOn: 0, scan: 0, patient: 1, slices: 0, spread: 0, us: 0, report: 0
  };

  const tl = gsap.timeline({ paused: true, defaults: { ease: 'sine.inOut' } });
  // 0 → 1: the table glides toward the gantry
  tl.to(state, { az: 0.98, el: 0.17, dist: 7.6, tx: 0, ty: 1.4, tz: 0.9, rotor: 0.4, duration: 1 }, 0);
  tl.to(state, { table: 1, duration: 0.85 }, 0.1);
  // 1 → 2: scanning, inner ring speeds up and the scan plane sweeps
  tl.to(state, { az: 1.32, el: 0.22, dist: 6.6, tx: 0, ty: 1.45, tz: 0.55, duration: 1 }, 1);
  tl.to(state, { rotor: 1, duration: 0.4 }, 1);
  tl.to(state, { scanOn: 1, duration: 0.2 }, 1.25);
  tl.fromTo(state, { scan: 0 }, { scan: 1, duration: 1.1, ease: 'none', immediateRender: false }, 1.35);
  tl.to(state, { scanOn: 0, duration: 0.2 }, 2.45);
  // 2 → 3: the silhouette dissolves into slices that fan out and reassemble
  tl.to(state, { az: 1.12, el: 0.28, dist: 7.0, tx: 0, ty: 1.8, tz: 1.2, duration: 1 }, 2);
  tl.to(state, { patient: 0.06, slices: 1, duration: 0.35 }, 2.45);
  tl.to(state, { table: 0.55, rotor: 0.3, duration: 0.5 }, 2.5);
  tl.to(state, { spread: 1, duration: 0.45, ease: 'power2.out' }, 2.75);
  tl.to(state, { spread: 0, duration: 0.45, ease: 'power2.inOut' }, 3.3);
  // 3 → 4: ultrasound waves
  tl.to(state, { az: 0.28, el: 0.14, dist: 5.6, tx: 7.3, ty: 1.55, tz: 0.2, duration: 1 }, 3);
  tl.to(state, { us: 1, duration: 0.4 }, 3.55);
  tl.to(state, { slices: 0, patient: 1, duration: 0.3 }, 3.7);
  // 4 → 5: everything settles, report card appears
  tl.to(state, { az: 0.55, el: 0.16, dist: 7.6, tx: 2.6, ty: 1.65, tz: 0.9, duration: 1 }, 4);
  tl.to(state, { table: 0, duration: 0.8 }, 4.1);
  tl.to(state, { us: 0, duration: 0.35 }, 4.4);
  tl.to(state, { report: 1, duration: 0.45 }, 4.45);
  tl.set({}, {}, 5);

  const st = ScrollTrigger.create({
    trigger: story,
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.8,
    animation: tl
  });

  // Fade the canvas as the story ends and the light sections take over.
  gsap.to(wrap, {
    autoAlpha: 0,
    ease: 'none',
    scrollTrigger: { trigger: story, start: 'bottom bottom', end: 'bottom 35%', scrub: true }
  });

  /* ---------------- Layout / framing ---------------- */
  let portraitFactor = 1;
  function resize() {
    const w = wrap.clientWidth || window.innerWidth;
    const h = wrap.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const aspect = w / h;
    const portrait = aspect < 0.9;
    // Text sits left on wide screens and at the bottom on phones: shift the scene to make room.
    const shiftX = portrait ? 0 : -(w >= 1024 ? 0.17 : 0.1) * w;
    const shiftY = portrait ? 0.15 * h : 0;
    camera.setViewOffset(w, h, shiftX, shiftY, w, h);
    portraitFactor = portrait ? Math.min(2.1, 0.95 / aspect) : aspect < 1.3 ? 1.12 : 1;
    camera.updateProjectionMatrix();
  }
  resize();
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 120);
  });

  // Gentle pointer parallax on desktop.
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  if (!lowPower) {
    window.addEventListener(
      'pointermove',
      (e) => {
        pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
        pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
      },
      { passive: true }
    );
  }

  /* ---------------- Per-frame update ---------------- */
  const target = new THREE.Vector3();
  function update(dt, time) {
    const heroWeight = 1 - Math.min(1, st.progress * 5);
    pointer.sx += (pointer.x - pointer.sx) * 0.05;
    pointer.sy += (pointer.y - pointer.sy) * 0.05;

    const az = state.az + Math.sin(time * 0.22) * 0.14 * heroWeight + pointer.sx * 0.05;
    const el = state.el + pointer.sy * 0.025;
    const dist = state.dist * portraitFactor;
    target.set(state.tx, state.ty, state.tz);
    camera.position.set(
      target.x + dist * Math.cos(el) * Math.sin(az),
      target.y + dist * Math.sin(el),
      target.z + dist * Math.cos(el) * Math.cos(az)
    );
    camera.lookAt(target);

    // Table + inner ring
    top.position.z = Z_OUT + (Z_IN - Z_OUT) * state.table;
    rotor.rotation.z -= dt * (0.25 + state.rotor * 4.5);

    // Scan plane sweeps head → feet along the silhouette
    scanMat.uniforms.uOpacity.value = state.scanOn;
    scanPlane.visible = state.scanOn > 0.002;
    scanPlane.position.z = top.position.z - 1.08 + state.scan * 2.45;
    scanLight.position.copy(scanPlane.position);
    scanLight.intensity = state.scanOn * 3;

    // Patient ↔ slices
    M.patient.opacity = 0.5 * state.patient;
    patient.visible = state.patient > 0.01;
    sliceMat.opacity = 0.6 * state.slices;
    sliceEdgeMat.opacity = 0.95 * state.slices;
    sliceInnerMat.opacity = 0.7 * state.slices;
    sliceGroup.visible = state.slices > 0.01;
    if (sliceGroup.visible) {
      const sp = state.spread;
      for (const s of slices) {
        const { z0, k } = s.userData;
        s.position.set(
          0,
          SURF + 0.148 + sp * (0.72 + Math.sin((k + 0.5) * Math.PI) * 0.2),
          z0 * (1 + sp * 0.5) + sp * 0.35
        );
        s.rotation.set(sp * k * 0.18, sp * (1.05 + k * 0.55), 0);
      }
    }

    // Ultrasound
    us.visible = state.us > 0.01;
    if (us.visible) {
      for (const m of usMats) m.opacity = state.us * (m === beam.material ? 0.07 : 1);
      arcs.forEach((a, i) => {
        const phase = (time * 0.32 + i / arcs.length) % 1;
        const r = 0.28 + phase * 2.0;
        a.scale.setScalar(r);
        a.material.opacity = Math.pow(Math.sin(phase * Math.PI), 1.4) * state.us * (a.userData.red ? 0.95 : 0.75);
      });
    }

    // Report card
    report.visible = state.report > 0.01;
    if (report.visible) {
      for (const m of repMats) m.opacity = state.report;
      const s = 0.9 + 0.1 * state.report;
      report.scale.setScalar(s);
      report.position.y = 1.85 + Math.sin(time * 0.9) * 0.035;
      report.rotation.y = -0.35 + Math.sin(time * 0.4) * 0.06;
    }
  }

  /* ---------------- Render loop: only while visible ---------------- */
  const clock = new THREE.Clock();
  let running = false;
  let inView = true;
  let firstFrame = true;
  function frame() {
    const dt = Math.min(clock.getDelta(), 0.05);
    update(dt, clock.elapsedTime);
    renderer.render(scene, camera);
    if (firstFrame) {
      firstFrame = false;
      onProgress(1);
      onReady();
    }
  }
  function setRunning(on) {
    if (on === running) return;
    running = on;
    if (on) {
      clock.getDelta();
      renderer.setAnimationLoop(frame);
    } else {
      renderer.setAnimationLoop(null);
    }
  }
  function sync() {
    setRunning(inView && !document.hidden);
  }
  new IntersectionObserver(
    ([entry]) => {
      inView = entry.isIntersecting;
      sync();
    },
    { rootMargin: '100px 0px' }
  ).observe(story);
  document.addEventListener('visibilitychange', sync);

  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    setRunning(false);
    document.documentElement.classList.add('no-3d');
  });

  // Compile shaders up front so the first scroll is smooth.
  renderer.compile(scene, camera);
  wrap.classList.add('is-live');
  sync();
}

function radialTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, 'rgba(0,0,0,0.55)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
