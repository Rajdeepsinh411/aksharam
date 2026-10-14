/**
 * Scroll story → scene state (t = 0…5, one unit per story step):
 *   0 hero  → 1 preparing → 2 scanning → 3 slices → image → 4 ultrasound → 5 report ready
 * Everything is scrubbed and fully reversible. Camera moves are eased; a critically
 * damped spring, idle "breathing" and pointer parallax are layered on per frame.
 */
import * as THREE from 'three';

/* Camera keyframes (world metres): position, target, vertical fov, focus subject */
export const SHOTS = {
  hero: { p: [3.35, 1.32, 4.85], t: [-0.35, 1.08, 0.45], fov: 36, f: [0, 1.08, 0.5] },
  prep: { p: [1.2, 0.98, 3.95], t: [0.02, 1.0, 1.05], fov: 33, f: [0, 1.02, 1.6] },
  scan: { p: [1.85, 1.34, 2.2], t: [-0.05, 1.08, 0.2], fov: 33, f: [0, 1.06, 0.45] },
  slices: { p: [1.15, 1.55, 4.3], t: [-0.25, 1.48, 2.5], fov: 34, f: [-0.1, 1.56, 2.55] },
  us: { p: [4.85, 1.46, 1.3], t: [6.05, 1.08, -0.6], fov: 34, f: [5.9, 1.15, -0.7] },
  report: { p: [10.02, 1.3, -0.9], t: [10.42, 1.06, -2.98], fov: 34, f: [10.4, 1.1, -3.05] }
};

export function createState() {
  const s = { table: 0, rotor: 0.12, laser: 0, peel: 0, upright: 0, slices: 0, volume: 0, reveal: 0, planeOn: 0, us: 0, rings: 0, report: 0, dim: 1, bayCT: 1, bayUS: 0.35, bayDesk: 0.25 };
  const h = SHOTS.hero;
  Object.assign(s, { px: h.p[0], py: h.p[1], pz: h.p[2], tx: h.t[0], ty: h.t[1], tz: h.t[2], fov: h.fov, fx: h.f[0], fy: h.f[1], fz: h.f[2] });
  return s;
}

const shot = (name) => {
  const k = SHOTS[name];
  return { px: k.p[0], py: k.p[1], pz: k.p[2], tx: k.t[0], ty: k.t[1], tz: k.t[2], fov: k.fov, fx: k.f[0], fy: k.f[1], fz: k.f[2] };
};

export function createTimeline(gsap, state) {
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'sine.inOut' } });
  const cam = (name, at, dur, ease = 'power2.inOut') => tl.to(state, { ...shot(name), duration: dur, ease }, at);

  // 0 → 1 · Preparing: a low glide along the couch
  cam('prep', 0, 1, 'power1.inOut');
  // 1 → 2 · Scanning: laser on, couch drives into the bore (accelerate / decelerate), rotor spins up
  cam('scan', 1, 1);
  tl.to(state, { laser: 1, duration: 0.12, ease: 'power1.out' }, 1.0);
  tl.to(state, { table: 1, duration: 0.75, ease: 'power2.inOut' }, 1.08);
  tl.to(state, { rotor: 1, duration: 0.45, ease: 'power1.in' }, 1.45);
  tl.to(state, { laser: 0, duration: 0.15 }, 1.85);
  // 2 → 3 · Slices → image: couch returns, slices peel away, collapse upright into the volume
  cam('slices', 2, 1);
  tl.to(state, { rotor: 0.12, duration: 0.5, ease: 'power1.out' }, 2.05);
  tl.to(state, { table: 0, duration: 0.5, ease: 'power2.inOut' }, 2.0);
  tl.to(state, { slices: 1, duration: 0.12 }, 2.12);
  tl.to(state, { peel: 1, duration: 0.38, ease: 'power2.out' }, 2.12);
  tl.to(state, { upright: 1, duration: 0.34, ease: 'power2.inOut' }, 2.5);
  tl.to(state, { volume: 1, reveal: 1, duration: 0.26, ease: 'power1.inOut' }, 2.7);
  tl.to(state, { slices: 0, duration: 0.16 }, 2.8);
  tl.to(state, { planeOn: 1, duration: 0.12 }, 2.9);
  // 3 → 4 · Ultrasound: camera tracks across to the ultrasound bay
  cam('us', 3.32, 0.68);
  tl.to(state, { volume: 0, planeOn: 0, duration: 0.18 }, 3.55);
  tl.to(state, { bayUS: 1, duration: 0.35 }, 3.35);
  tl.to(state, { us: 1, duration: 0.25 }, 3.5);
  tl.to(state, { rings: 1, duration: 0.3 }, 3.62);
  // 4 → 5 · Report ready: soft light fade across to the reading desk
  tl.to(state, { dim: 0.12, duration: 0.22, ease: 'power1.in' }, 4.12);
  cam('report', 4.18, 0.5, 'power2.inOut');
  tl.to(state, { rings: 0, us: 0, duration: 0.2 }, 4.2);
  tl.to(state, { bayDesk: 1, duration: 0.3 }, 4.3);
  tl.to(state, { dim: 1, duration: 0.3, ease: 'power1.out' }, 4.55);
  tl.to(state, { report: 1, duration: 0.25, ease: 'power2.out' }, 4.68);
  tl.set({}, {}, 5);
  return tl;
}

/* ------------------------------------------------------------------ */
/* Camera rig: spring smoothing, breathing, parallax, framing           */
/* ------------------------------------------------------------------ */
function spring(x, v, goal, omega, dt) {
  // critically damped spring (exact integration)
  const d = x - goal;
  const e = Math.exp(-omega * dt);
  const nx = (d + (v + omega * d) * dt) * e;
  const nv = (v - omega * (v + omega * d) * dt) * e;
  return [goal + nx, nv];
}

export function createCameraRig(camera) {
  const pos = new THREE.Vector3(), tgt = new THREE.Vector3(), focus = new THREE.Vector3();
  const vp = new THREE.Vector3(), vt = new THREE.Vector3();
  const goalP = new THREE.Vector3(), goalT = new THREE.Vector3();
  let fov = 35, init = false;
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  const layout = { portrait: false, aspect: 16 / 9, pull: 1, fovBoost: 0 };

  return {
    pointer,
    layout,
    focus,
    /** intro: 1 → 0 over the hero dolly-in; breathing: 0 in record mode */
    update(state, dt, time, { intro = 0, breathing = 1, parallax = true } = {}) {
      goalP.set(state.px, state.py, state.pz);
      goalT.set(state.tx, state.ty, state.tz);
      // portrait phones: pull back along the view direction so the subject still fits
      if (layout.pull !== 1) goalP.sub(goalT).multiplyScalar(layout.pull).add(goalT);
      // hero dolly-in from further back
      if (intro > 0) {
        const back = new THREE.Vector3().subVectors(goalP, goalT).normalize();
        goalP.addScaledVector(back, intro * 1.6).y += intro * 0.18;
      }
      // idle breathing: small incommensurate sines, never fully static
      if (breathing) {
        goalP.x += Math.sin(time * 0.31) * 0.014 * breathing;
        goalP.y += Math.sin(time * 0.23 + 1.3) * 0.009 * breathing;
        goalP.z += Math.sin(time * 0.17 + 2.1) * 0.012 * breathing;
        goalT.x += Math.sin(time * 0.27 + 0.4) * 0.006 * breathing;
        goalT.y += Math.sin(time * 0.19 + 2.7) * 0.004 * breathing;
      }
      if (parallax) {
        const k = 1 - Math.exp(-dt * 3);
        pointer.sx += (pointer.x - pointer.sx) * k;
        pointer.sy += (pointer.y - pointer.sy) * k;
        const right = new THREE.Vector3().subVectors(goalT, goalP).cross(camera.up).normalize();
        goalP.addScaledVector(right, pointer.sx * 0.06);
        goalP.y -= pointer.sy * 0.035;
      }
      if (!init || dt === 0) {
        pos.copy(goalP);
        tgt.copy(goalT);
        vp.set(0, 0, 0);
        vt.set(0, 0, 0);
        init = true;
      } else {
        for (const ax of ['x', 'y', 'z']) {
          [pos[ax], vp[ax]] = spring(pos[ax], vp[ax], goalP[ax], 5.5, dt);
          [tgt[ax], vt[ax]] = spring(tgt[ax], vt[ax], goalT[ax], 5.5, dt);
        }
      }
      fov += (state.fov + layout.fovBoost - fov) * (dt === 0 ? 1 : 1 - Math.exp(-dt * 5));
      camera.position.copy(pos);
      camera.lookAt(tgt);
      if (Math.abs(camera.fov - fov) > 1e-3) {
        camera.fov = fov;
        camera.updateProjectionMatrix();
      }
      focus.set(state.fx, state.fy, state.fz);
      return camera.position.distanceTo(focus);
    },
    snap() {
      init = false;
    }
  };
}
