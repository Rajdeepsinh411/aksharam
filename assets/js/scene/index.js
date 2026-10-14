/**
 * Aksharam Diagnostics: home page 3D story ("how a scan happens").
 * Tiers: 'high' (full post, 2k HDRI, 128³ volume, reflections) and 'medium'
 * (half-res AO, no DoF, 1k HDRI, 64³ volume). 'low' and 'still' never load this file.
 */
import * as THREE from 'three';
import { createMaterials, sceneUniforms } from './materials.js';
import { buildRoom, PANELS } from './room.js';
import { buildGantry, buildCouch, TABLE_OUT_Z, TABLE_IN_Z, TABLE_Y, LASER_Z } from './scanner.js';
import { buildPatient } from './patient.js';
import { buildUltrasound, buildDesk } from './stations.js';
import { createVolumeMesh, createSlices, loadVolumeData } from './volume.js';
import { createPost } from './post.js';
import { createLoaders, createVideo, videoTexture, disposeObject, FILES, BASE } from './assets.js';
import { createState, createTimeline, createCameraRig } from './timeline.js';
import { disposeTextureCache } from './textures.js';

const EXPOSURE = 0.95;
const ENV_INTENSITY = 0.3;
const UPRIGHT_POS = new THREE.Vector3(-0.1, 1.56, 2.55);
const UPRIGHT_SCALE = 1.3; // presented slightly larger than life once lifted out of the patient
const TORSO_Z = -0.33; // CT volume centre along the patient (patient space)

export async function initScene({ canvas, story, tier = 'high', onProgress = () => {}, onReady = () => {}, reportEl = null, record = null }) {
  const { gsap, ScrollTrigger } = window;
  if (!canvas || !story) throw new Error('Scene: canvas or story element missing');
  if (!gsap) throw new Error('Scene: GSAP not loaded');
  const high = tier === 'high';
  const wrap = canvas.parentElement;
  const perfOn = /[?&]perf/.test(location.search);
  const T0 = performance.now();
  const times = perfOn ? (window.__initTimes = {}) : null;
  const mark = (label) => times && (times[label] = Math.round(performance.now() - T0));

  /* ---------------- Renderer ---------------- */
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false, // SMAA in post
    powerPreference: 'high-performance',
    stencil: false,
    preserveDrawingBuffer: !!record
  });
  if (!renderer.capabilities.isWebGL2) throw new Error('WebGL2 required');
  const maxDpr = record ? 1 : high ? 1.75 : 1.25;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping; // Neutral tone mapping runs in post
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;
  renderer.debug.checkShaderErrors = !!record; // synchronous shader-log checks only when recording

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0d0f12);
  scene.environmentIntensity = ENV_INTENSITY;
  const camera = new THREE.PerspectiveCamera(35, 16 / 9, 0.05, 40);
  camera.layers.enable(1); // layer 1: CT slices/volume (excluded from floor reflections)

  /* ---------------- Loading progress (real, via LoadingManager) ---------------- */
  let essential = 0;
  const loaders = createLoaders((p) => {
    essential = Math.max(essential, p);
    onProgress(0.15 + essential * 0.75);
  });

  /* ---------------- Phase 1: lighting environment + core models ---------------- */
  // High tier loads the 2k HDRI from the start: swapping it in later would change the
  // environment size baked into every shader and recompile them all mid-scroll.
  const envLow = loaders.hdri(high ? FILES.hdri.high : FILES.hdri.low, renderer);
  const M = createMaterials(tier);
  const room = buildRoom(M, { tier });
  scene.add(room.group);

  let gantry = buildGantry(M);
  const couch = buildCouch(M);
  scene.add(gantry.group, couch.group);
  let couchTop = couch.top;
  mark('gantry+couch');
  let patient = buildPatient(M, { quality: high ? 1 : 0 });
  mark('patient');
  couchTop.add(patient.group);

  const usBay = buildUltrasound(M);
  const desk = buildDesk(M);
  scene.add(usBay.group, desk.group);

  // Optional real models (assets/models/*.glb, see ASSETS.md) replace the procedural ones.
  await Promise.all([
    loaders.model('ctScanner', renderer).then((root) => {
      if (!root) return;
      const top = root.getObjectByName('Couch_Top');
      scene.remove(gantry.group, couch.group);
      disposeObject(gantry.group);
      scene.add(root);
      if (top) {
        couchTop = top;
        couchTop.add(patient.group);
      }
      const led = root.getObjectByName('LED_Strip');
      if (led && led.material) gantry.led = led;
      gantry = { ...gantry, group: root, rotor: root.getObjectByName('RotorWindow') || gantry.rotor };
    }),
    loaders.model('patient', renderer).then((root) => {
      if (!root) return;
      couchTop.remove(patient.group);
      disposeObject(patient.group);
      patient = { group: root };
      couchTop.add(root);
    }),
    loaders.model('room', renderer).then((root) => {
      if (!root) return;
      room.group.children.filter((c) => c.isMesh).forEach((m) => (m.visible = false));
      scene.add(root);
    })
  ]).catch((e) => console.warn('Model load failed, using procedural fallback.', e));

  scene.environment = await envLow;
  mark('hdri');
  onProgress(0.9);

  /* ---------------- CT rig: slices + volume share one local frame ---------------- */
  const ctRig = new THREE.Group();
  ctRig.name = 'CT_Rig';
  scene.add(ctRig);
  let slices = null, volume = null, volumeFallback = null;

  /* ---------------- Post ---------------- */
  const post = createPost(renderer, scene, camera, tier);
  let reflection = null;
  if (high) {
    const { createFloorReflection } = await import('./reflect.js');
    reflection = createFloorReflection(renderer, room.floor, { scale: 0.5, strength: 0.75 });
  }

  /* ---------------- Story ---------------- */
  const state = createState();
  const tl = createTimeline(gsap, state);
  const rig = createCameraRig(camera);
  let st = null;
  if (!record && ScrollTrigger) {
    st = ScrollTrigger.create({ trigger: story, start: 'top top', end: 'bottom bottom', scrub: 0.8, animation: tl });
    // fade the canvas as the light content sections take over
    gsap.to(wrap, { autoAlpha: 0, ease: 'none', scrollTrigger: { trigger: story, start: 'bottom bottom', end: 'bottom 35%', scrub: true } });
  }

  /* ---------------- Layout / framing ---------------- */
  let W = 1, H = 1;
  function resize(w = wrap.clientWidth || window.innerWidth, h = wrap.clientHeight || window.innerHeight) {
    W = w;
    H = h;
    renderer.setSize(w, h, false);
    post.setSize(w, h);
    if (reflection) reflection.setSize(w * renderer.getPixelRatio(), h * renderer.getPixelRatio());
    const aspect = w / h;
    camera.aspect = aspect;
    const portrait = aspect < 0.9;
    // Copy sits left on wide screens and at the bottom on phones: shift the frame to make room.
    const shiftX = portrait ? 0 : -(w >= 1024 ? 0.16 : 0.1) * w;
    const shiftY = portrait ? 0.14 * h : 0;
    camera.setViewOffset(w, h, shiftX, shiftY, w, h);
    rig.layout.portrait = portrait;
    rig.layout.pull = portrait ? Math.min(1.7, 0.84 / aspect) : aspect < 1.3 ? 1.12 : 1;
    rig.layout.fovBoost = portrait ? 9 : 0;
    camera.updateProjectionMatrix();
  }
  resize(record ? record.width : undefined, record ? record.height : undefined);
  let resizeTimer;
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => resize(), 120);
  };
  if (!record) window.addEventListener('resize', onResize);
  const fine = window.matchMedia('(pointer: fine)').matches;
  const onPointer = (e) => {
    rig.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    rig.pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
  };
  if (fine && !record) window.addEventListener('pointermove', onPointer, { passive: true });

  /* ---------------- Background loading (phase 2) ---------------- */
  const bg = [];
  const later = (fn) => bg.push(new Promise((r) => (window.requestIdleCallback || setTimeout)(() => r(fn()), { timeout: 600 })).catch((e) => console.warn(e)));

  // Optional real models for the ultrasound bay and the reading desk (ASSETS.md):
  // their screen meshes take over the live screen materials.
  later(async () => {
    const root = await loaders.model('ultrasound', renderer);
    if (!root) return;
    const screen = root.getObjectByName('US_Screen');
    if (screen) screen.material = usBay.screen.material;
    usBay.group.children.forEach((c) => c !== usBay.rings && (c.visible = false));
    scene.add(root);
    await compileAll(root);
  });
  later(async () => {
    const root = await loaders.model('desk', renderer);
    if (!root) return;
    const names = ['Desk_Screen_L', 'Desk_Screen_R'];
    names.forEach((n, i) => {
      const m = root.getObjectByName(n);
      if (m) {
        m.material = desk.screens[i].material;
        desk.screens[i] = m;
      }
    });
    desk.group.visible = false;
    scene.add(root);
    await compileAll(root);
  });

  // CT images on the reading-desk monitors
  later(async () => {
    const [l, r] = await Promise.all([loaders.texture(FILES.monitorL), loaders.texture(FILES.monitorR)]);
    desk.screens[0].material.emissiveMap = l;
    desk.screens[1].material.emissiveMap = r;
    desk.screens.forEach((s) => (s.material.needsUpdate = true));
    room.ctrlScreens[0].material = room.ctrlScreens[0].material.clone();
    room.ctrlScreens[0].material.emissiveMap = l;
    room.ctrlScreens[2].material = room.ctrlScreens[2].material.clone();
    room.ctrlScreens[2].material.emissiveMap = r;
    desk.loaded = true;
  });
  // Ultrasound: real abdominal B-mode loop + colour Doppler still (pulsatile flow in shader)
  let usVideo = null;
  later(async () => {
    const dop = await loaders.texture(FILES.doppler);
    usBay.screenUniforms.tDoppler.value = dop;
    const { video, ready } = createVideo(FILES.usVideo);
    usVideo = video;
    await ready;
    usBay.screenUniforms.tVideo.value = videoTexture(video);
    usBay.screenUniforms.uHasVideo.value = 1;
  });
  // CT slices + volume
  const volumeQuality = high ? 'hi' : 'lo';
  later(async () => {
    try {
      const [atlas, vol] = await Promise.all([loaders.texture(FILES.slices), loadVolumeData(BASE + FILES.data, volumeQuality)]);
      slices = createSlices(atlas, vol.meta, high ? 12 : 8);
      slices.group.traverse((o) => o.layers.set(1));
      ctRig.add(slices.group);
      volume = createVolumeMesh(vol, high ? 150 : 84);
      volume.mesh.layers.set(1);
      ctRig.add(volume.mesh);
      await compileAll(ctRig);
      mark('volume');
    } catch (e) {
      console.warn('CT volume unavailable, using the pre-rendered loop.', e);
      useVolumeFallback();
    }
  });
  function useVolumeFallback() {
    if (volumeFallback) return;
    const { video, ready } = createVideo(FILES.volumeLoop);
    const tex = videoTexture(video);
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, opacity: 0 });
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 1.15), mat);
    plane.layers.set(1);
    scene.add(plane);
    volumeFallback = { plane, video, mat };
    ready.then(() => video.play().catch(() => {})).catch(() => {});
  }

  /* ---------------- Per-frame update ---------------- */
  const qA = new THREE.Quaternion(), qB = new THREE.Quaternion(), qYaw = new THREE.Quaternion();
  const lyingPos = new THREE.Vector3(), tmp = new THREE.Vector3();
  const anchor = new THREE.Vector3(10.98, 1.3, -2.72);
  const X = new THREE.Vector3(1, 0, 0), Y = new THREE.Vector3(0, 1, 0);
  let lastTable = -1, introStart = -1, rotorAngle = 0;
  let reportShown = false;

  function update(dt, time, opts = {}) {
    // Hero intro: panels light one by one, LED strip glows, camera dollies in.
    if (introStart < 0) introStart = time;
    const it = opts.introDone ? 99 : time - introStart;
    const intro = opts.introDone ? 0 : Math.max(0, 1 - easeOut(Math.min(1, it / 5.5)));
    const panelOn = (i) => smooth01((it - 0.35 - i * 0.32) / 0.7);

    // Camera + rack focus
    const focusDist = rig.update(state, dt, time, { intro, breathing: opts.breathing ?? 1, parallax: !record });
    post.setFocus(focusDist, THREE.MathUtils.clamp(focusDist * 0.42, 0.7, 2.6));

    // Bay lighting
    const bay = { ct: state.bayCT, us: state.bayUS, desk: state.bayDesk };
    room.panels.forEach((p) => (p.mesh.material.emissiveIntensity = (p.bay === 'desk' ? 5.5 : 12) * bay[p.bay] * panelOn(p.index)));
    room.lights.forEach((L) => {
      const on = L.panelIdx.reduce((a, i) => a + panelOn(i), 0) / L.panelIdx.length;
      L.light.intensity = L.base * bay[L.bay] * on;
    });
    const roomOn = panelOn(2);
    room.spots.forEach((s) => (s.light.intensity = s.base * bay[s.bay] * roomOn));
    room.warm.intensity = 1.6 * (0.4 + 0.6 * state.bayDesk) * roomOn;
    scene.environmentIntensity = ENV_INTENSITY * (0.25 + 0.75 * roomOn);
    post.exposure.exposure = EXPOSURE * state.dim;

    // Gantry: LED strip, rotor, laser
    if (gantry.led) gantry.led.material.emissiveIntensity = 26 * smooth01((it - 0.2) / 1.2);
    rotorAngle += dt * (0.35 + state.rotor * 15);
    if (gantry.rotor && gantry.rotor.material.uniforms) {
      gantry.rotor.material.uniforms.uAngle.value = rotorAngle;
      gantry.rotor.material.uniforms.uSpeed.value = state.rotor;
      gantry.rotor.material.uniforms.uGlow.value = state.laser;
    }
    sceneUniforms.uLaserOn.value = state.laser;
    sceneUniforms.uLaserZ.value = LASER_Z;
    if (gantry.laserWins) gantry.laserWins.forEach((w) => (w.material.emissiveIntensity = state.laser * 5));

    // Couch: table position (shadow maps refresh only when something moves)
    couchTop.position.z = TABLE_OUT_Z + (TABLE_IN_Z - TABLE_OUT_Z) * state.table;
    if (Math.abs(state.table - lastTable) > 1e-4) {
      renderer.shadowMap.needsUpdate = true;
      lastTable = state.table;
    }

    // CT rig: lying in the patient → lifted upright, spinning slowly
    lyingPos.set(0, TABLE_Y + 0.145, couchTop.position.z + TORSO_Z);
    const up = state.upright;
    ctRig.position.lerpVectors(lyingPos, UPRIGHT_POS, up);
    qA.identity();
    qB.setFromAxisAngle(X, Math.PI / 2);
    qYaw.setFromAxisAngle(Y, -0.35 + time * 0.32 * up);
    qB.premultiply(qYaw);
    ctRig.quaternion.slerpQuaternions(qA, qB, up);
    ctRig.scale.setScalar(1 + (UPRIGHT_SCALE - 1) * up);
    if (slices) {
      slices.setOpacity(state.slices);
      if (slices.group.visible) {
        const peel = state.peel * (1 - up);
        for (const m of slices.slices) {
          const { z0, k } = m.userData;
          const stag = THREE.MathUtils.clamp(state.peel * 1.6 - k * 0.6, 0, 1) * (1 - up);
          m.position.set(0, stag * (0.36 + Math.sin(k * Math.PI) * 0.12), z0 * (1 + peel * 0.85));
          m.rotation.set(-stag * 0.22, stag * (0.32 + (k - 0.5) * 0.3), 0);
        }
      }
    }
    if (volume) {
      volume.mesh.visible = state.volume > 0.003;
      volume.uniforms.uOpacity.value = state.volume;
      volume.uniforms.uReveal.value = -0.05 + state.reveal * 1.1;
      volume.uniforms.uPlane.value = (time * 0.16) % 1;
      volume.uniforms.uPlaneOn.value = state.planeOn;
    }
    if (volumeFallback) {
      volumeFallback.plane.position.copy(UPRIGHT_POS);
      volumeFallback.plane.lookAt(camera.position);
      volumeFallback.mat.opacity = state.volume;
      volumeFallback.plane.visible = state.volume > 0.003;
    }

    // Ultrasound bay: screen (B-mode ↔ Doppler every ~12 s), floor rings
    const u = usBay.screenUniforms;
    u.uTime.value = time;
    const cyc = (time % 12) / 12;
    u.uMix.value = smooth01((cyc - 0.45) / 0.07) * (1 - smooth01((cyc - 0.92) / 0.07));
    u.uOn.value = 0.25 + 0.75 * Math.max(state.us, state.bayUS * 0.4);
    usBay.ringsMat.uniforms.uTime.value = time;
    usBay.ringsMat.uniforms.uOpacity.value = state.rings;
    usBay.rings.visible = state.rings > 0.003;
    if (usVideo && !record) {
      const want = state.us > 0.01 || state.bayUS > 0.5;
      if (want && usVideo.paused) usVideo.play().catch(() => {});
      else if (!want && !usVideo.paused) usVideo.pause();
    }

    // Reading desk screens
    if (desk.loaded) desk.screens.forEach((s) => (s.material.emissiveIntensity = 0.9 * (0.35 + 0.65 * state.bayDesk)));

    // Report-ready card (HTML overlay, anchored beside the monitors)
    if (reportEl) {
      const show = state.report > 0.01;
      if (show !== reportShown) {
        reportEl.hidden = !show;
        reportShown = show;
      }
      if (show) {
        tmp.copy(anchor).project(camera);
        let x = (tmp.x * 0.5 + 0.5) * W, y = (-tmp.y * 0.5 + 0.5) * H;
        if (rig.layout.portrait) y = Math.min(y, H * 0.42);
        x = Math.min(Math.max(x, 16), W - 16 - (reportEl.offsetWidth || 260));
        reportEl.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translateY(-50%) translateY(${((1 - state.report) * 14).toFixed(1)}px)`;
        reportEl.style.opacity = state.report.toFixed(3);
      }
    }
  }

  /* ---------------- Render ---------------- */
  function renderFrame(dt) {
    if (reflection) reflection.update(scene, camera);
    post.render(dt);
  }

  // Adaptive quality: step down if the frame rate can't keep up (never steps back up).
  let ema = 16, warm = 0, slowFor = 0, level = 0;
  function adapt(dtMs) {
    ema += (dtMs - ema) * 0.05;
    if (++warm < 90) return;
    const budget = high ? 22 : 38;
    slowFor = ema > budget ? slowFor + dtMs : 0;
    if (slowFor > 2000 && level < 3) {
      level++;
      slowFor = 0;
      warm = 30;
      post.degrade(level);
      if (level >= 2) {
        renderer.setPixelRatio(Math.max(0.75, renderer.getPixelRatio() * 0.8));
        resize();
      }
      if (level >= 3 && volume && !high) {
        volume.uniforms.uSteps.value = Math.max(48, volume.uniforms.uSteps.value * 0.7);
      }
    }
  }

  const clock = new THREE.Clock();
  let running = false, inView = true, firstFrame = true;
  const perf = /[?&]perf/.test(location.search) ? (window.__perf = { update: 0, reflect: 0, post: 0, n: 0, max: 0 }) : null;
  function frame() {
    if (firstFrame) mark('frame1-start');
    const dt = Math.min(clock.getDelta(), 0.05);
    sceneUniforms.uTime.value = clock.elapsedTime;
    if (perf) {
      const gl = renderer.getContext();
      const t0 = performance.now();
      update(dt, clock.elapsedTime);
      const t1 = performance.now();
      if (reflection) reflection.update(scene, camera);
      gl.finish();
      const t2 = performance.now();
      post.render(dt);
      gl.finish();
      const t3 = performance.now();
      perf.update += t1 - t0; perf.reflect += t2 - t1; perf.post += t3 - t2; perf.n++; perf.max = Math.max(perf.max, t3 - t0);
    } else {
      update(dt, clock.elapsedTime);
      renderFrame(dt);
    }
    adapt(dt * 1000);
    if (firstFrame) {
      mark('frame1-end');
      firstFrame = false;
      onProgress(1);
      wrap.classList.add('is-live');
      onReady();
    }
  }
  function setRunning(on) {
    if (on === running) return;
    running = on;
    if (on) {
      mark('loop-start');
      clock.getDelta();
      renderer.setAnimationLoop(frame);
    } else renderer.setAnimationLoop(null);
  }
  const sync = () => setRunning(inView && !document.hidden);
  const io = new IntersectionObserver(([e]) => ((inView = e.isIntersecting), sync()), { rootMargin: '100px 0px' });

  function dispose() {
    setRunning(false);
    io.disconnect();
    document.removeEventListener('visibilitychange', sync);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('pointermove', onPointer);
    if (st) st.kill();
    tl.kill();
    if (usVideo) usVideo.pause(), usVideo.removeAttribute('src'), usVideo.load();
    if (volumeFallback) volumeFallback.video.pause();
    slices && slices.dispose();
    volume && volume.dispose();
    reflection && reflection.dispose();
    post.dispose();
    disposeObject(scene);
    scene.environment && scene.environment.dispose();
    disposeTextureCache();
    renderer.dispose();
  }

  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    setRunning(false);
    window.dispatchEvent(new CustomEvent('scene:lost'));
  });
  window.addEventListener('pagehide', (e) => {
    if (!e.persisted) dispose();
  });

  /** Compile every shader up front, in parallel where supported (KHR_parallel_shader_compile),
   *  including objects that start hidden, so nothing compiles mid-scroll. */
  async function compileAll(root = scene) {
    const hidden = [];
    root.traverse((o) => {
      if (!o.visible) {
        o.visible = true;
        hidden.push(o);
      }
    });
    camera.layers.enableAll();
    // Compile for the composer's linear HalfFloat target (the variant actually used),
    // not for the screen's sRGB output: otherwise every material recompiles on frame one.
    const prevTarget = renderer.getRenderTarget();
    renderer.setRenderTarget(post.composer.inputBuffer);
    let pending;
    try {
      pending = renderer.compileAsync(scene, camera);
    } catch (e) {
      renderer.compile(scene, camera);
    }
    renderer.setRenderTarget(prevTarget);
    if (pending) await pending.catch(() => {});
    camera.layers.set(0);
    camera.layers.enable(1);
    hidden.forEach((o) => (o.visible = false));
  }

  renderer.shadowMap.needsUpdate = true;
  update(0, 0, { introDone: !!record });
  mark('pre-compile');
  await compileAll();
  mark('compiled');

  const controller = {
    renderer, scene, camera, state, tl, post, ctRig, resize, get reflection() { return reflection; }, set reflection(v) { reflection = v; },
    background: Promise.allSettled(bg),
    get volumeReady() {
      return !!volume;
    },
    usVideo: () => usVideo,
    usTexture: () => usBay.screenUniforms.tVideo.value,
    /** Volume-only frame (black background) for the pre-rendered volume loop. */
    renderAtVolume(angle, time) {
      camera.clearViewOffset();
      camera.fov = 30;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      camera.position.set(0, UPRIGHT_POS.y, UPRIGHT_POS.z + 2.05);
      camera.lookAt(UPRIGHT_POS);
      ctRig.position.copy(UPRIGHT_POS);
      ctRig.scale.setScalar(UPRIGHT_SCALE);
      qB.setFromAxisAngle(X, Math.PI / 2);
      qYaw.setFromAxisAngle(Y, angle);
      ctRig.quaternion.copy(qB.premultiply(qYaw));
      if (slices) slices.setOpacity(0);
      if (volume) {
        volume.mesh.visible = true;
        volume.mesh.userData.freezeNoise = true; // stable sampling → clean, compact video
        volume.uniforms.uOpacity.value = 1;
        volume.uniforms.uReveal.value = 1.05;
        volume.uniforms.uPlaneOn.value = 0;
      }
      sceneUniforms.uTime.value = time;
      post.exposure.exposure = EXPOSURE;
      post.setFocus(camera.position.distanceTo(UPRIGHT_POS), 1.5);
      renderFrame(1 / 30);
    },
    /** Deterministic frame for recording: timeline progress 0…1 at a given time. */
    renderAt(progress, time, { introDone = true } = {}) {
      tl.progress(progress);
      rig.snap();
      sceneUniforms.uTime.value = time;
      renderer.shadowMap.needsUpdate = true;
      update(1 / 30, time, { introDone, breathing: 0 });
      renderFrame(1 / 30);
    },
    dispose
  };

  if (record) {
    rig.snap();
    return controller;
  }
  io.observe(story);
  document.addEventListener('visibilitychange', sync);
  sync();
  return controller;
}

function smooth01(x) {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
}
function easeOut(t) {
  return 1 - Math.pow(1 - t, 3);
}
