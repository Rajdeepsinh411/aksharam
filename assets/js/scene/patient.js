/**
 * Procedural patient (fallback until assets/models/patient.glb is supplied):
 * an adult lying supine in a hospital gown, a cotton sheet over the legs,
 * head on a low pad and turned slightly away from the camera.
 * Sculpted as a signed-distance field and polygonised with marching cubes.
 *
 * Local space: origin = centre of the couch pad surface, +y up, +x patient's left,
 * head toward −z (the gantry).
 */
import * as THREE from 'three';
import { MarchingCubes } from 'three/addons/objects/MarchingCubes.js';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

/* ---------- SDF primitives ---------- */
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
function ellipsoid(px, py, pz, c, r) {
  const x = (px - c[0]) / r[0], y = (py - c[1]) / r[1], z = (pz - c[2]) / r[2];
  const k0 = Math.hypot(x, y, z);
  const k1 = Math.hypot(x / r[0], y / r[1], z / r[2]);
  return k1 === 0 ? -Math.min(...r) : (k0 * (k0 - 1)) / k1;
}
function cone(px, py, pz, a, b, ra, rb) {
  const bx = b[0] - a[0], by = b[1] - a[1], bz = b[2] - a[2];
  const qx = px - a[0], qy = py - a[1], qz = pz - a[2];
  const h = clamp((qx * bx + qy * by + qz * bz) / (bx * bx + by * by + bz * bz), 0, 1);
  return Math.hypot(qx - bx * h, qy - by * h, qz - bz * h) - (ra + (rb - ra) * h);
}
const smin = (a, b, k) => {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
};
const smax = (a, b, k) => -smin(-a, -b, k);

const HEAD_C = [0, 0.118, -0.905];
const HEAD_YAW = -0.28; // turned slightly toward the patient's right (away from the main camera)
const DZ = -0.16;
const P = (x, y, z) => [x, y, z + DZ];

/** Arms: upper arms along the sides, forearms resting on the abdomen (keeps the figure on the pad). */
function armSDF(ax, y, z) {
  let d = cone(ax, y, z, P(0.193, 0.086, -0.48), P(0.214, 0.074, -0.27), 0.044, 0.038); // upper arm
  d = smin(d, forearmSDF(ax, y, z), 0.02);
  return d;
}
function forearmSDF(ax, y, z) {
  let d = cone(ax, y, z, P(0.214, 0.074, -0.27), P(0.105, 0.196, -0.17), 0.035, 0.028); // forearm
  d = smin(d, ellipsoid(ax, y, z, P(0.07, 0.205, -0.15), [0.046, 0.018, 0.034]), 0.018); // hand
  return d;
}
function torsoSDF(x, y, z) {
  let d = ellipsoid(x, y, z, P(0, 0.112, -0.38), [0.168, 0.112, 0.17]); // chest
  d = smin(d, ellipsoid(x, y, z, P(0, 0.104, -0.15), [0.156, 0.108, 0.17]), 0.07); // abdomen
  d = smin(d, ellipsoid(x, y, z, P(0, 0.098, 0.06), [0.17, 0.098, 0.13]), 0.07); // pelvis
  d = smin(d, cone(x, y, z, P(-0.162, 0.094, -0.505), P(0.162, 0.094, -0.505), 0.06, 0.06), 0.06); // shoulders
  d = smin(d, cone(x, y, z, P(0, 0.084, -0.69), P(0, 0.092, -0.55), 0.05, 0.056), 0.04); // neck
  return d;
}
function legSDF(ax, y, z) {
  let d = cone(ax, y, z, P(0.09, 0.094, 0.12), P(0.096, 0.074, 0.5), 0.086, 0.055); // thigh
  d = smin(d, cone(ax, y, z, P(0.096, 0.072, 0.52), P(0.091, 0.056, 0.86), 0.052, 0.032), 0.03); // calf
  d = smin(d, ellipsoid(ax, y, z, P(0.094, 0.082, 0.9), [0.042, 0.068, 0.05]), 0.03); // foot
  return d;
}
/** Body from neck to feet (no head). */
function bodySDF(x, y, z) {
  const ax = Math.abs(x);
  let d = torsoSDF(x, y, z);
  d = smin(d, armSDF(ax, y, z), 0.03);
  d = smin(d, legSDF(ax, y, z), 0.05);
  return Math.max(d, -y + 0.004); // flattened where it rests on the pad
}

/** Head with neutral facial form, in head-local coordinates (face toward +y, crown toward −z). */
function headSDF(x, y, z) {
  const ax = Math.abs(x);
  let d = ellipsoid(x, y, z, [0, 0, -0.008], [0.077, 0.091, 0.1]); // cranium
  d = smin(d, ellipsoid(x, y, z, [0, 0.042, 0.068], [0.056, 0.05, 0.045]), 0.035); // jaw
  d = smin(d, ellipsoid(x, y, z, [0, 0.064, 0.098], [0.026, 0.02, 0.018]), 0.02); // chin
  d = smin(d, ellipsoid(ax, y, z, [0.044, 0.06, 0.03], [0.03, 0.032, 0.034]), 0.02); // cheeks
  d = smin(d, ellipsoid(x, y, z, [0, 0.074, -0.018], [0.058, 0.024, 0.02]), 0.02); // brow
  d = smin(d, ellipsoid(x, y, z, [0, 0.098, 0.026], [0.011, 0.019, 0.026]), 0.012); // nose
  d = smin(d, ellipsoid(x, y, z, [0, 0.082, 0.066], [0.021, 0.008, 0.009]), 0.008); // lips
  d = smin(d, ellipsoid(ax, y, z, [0.079, 0.0, 0.004], [0.011, 0.028, 0.022]), 0.008); // ears
  d = smax(d, -ellipsoid(ax, y, z, [0.031, 0.088, 0.004], [0.017, 0.012, 0.013]), 0.012); // eye sockets
  d = smin(d, ellipsoid(ax, y, z, [0.031, 0.08, 0.004], [0.013, 0.009, 0.011]), 0.004); // closed lids
  d = smin(d, cone(x, y, z, [0, -0.01, 0.06], [0, -0.012, 0.16], 0.05, 0.052), 0.03); // neck stub
  return d;
}

/** Polygonise an SDF over a box with three's MarchingCubes; returns an indexed geometry in metres. */
function polygonise(sdf, min, max, res) {
  const mc = new MarchingCubes(res, new THREE.MeshBasicMaterial(), false, false, 220000);
  mc.isolation = 80;
  const size = mc.size;
  const sx = (max[0] - min[0]) / 2, sy = (max[1] - min[1]) / 2, sz = (max[2] - min[2]) / 2;
  const cx = (max[0] + min[0]) / 2, cy = (max[1] + min[1]) / 2, cz = (max[2] + min[2]) / 2;
  const field = mc.field;
  for (let k = 0; k < size; k++) {
    const z = cz + ((k - mc.halfsize) / mc.halfsize) * sz;
    for (let j = 0; j < size; j++) {
      const y = cy + ((j - mc.halfsize) / mc.halfsize) * sy;
      for (let i = 0; i < size; i++) {
        const x = cx + ((i - mc.halfsize) / mc.halfsize) * sx;
        field[i + j * size + k * size * size] = 80 - sdf(x, y, z) * 2400;
      }
    }
  }
  mc.update();
  const count = mc.count;
  const pos = new Float32Array(count * 3);
  for (let v = 0; v < count; v++) {
    pos[v * 3] = cx + mc.positionArray[v * 3] * sx;
    pos[v * 3 + 1] = cy + mc.positionArray[v * 3 + 1] * sy;
    pos[v * 3 + 2] = cz + mc.positionArray[v * 3 + 2] * sz;
  }
  mc.geometry.dispose();
  mc.material.dispose();
  let geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo = mergeVertices(geo, 1e-5);
  geo.computeVertexNormals();
  return geo;
}

/** Split an indexed geometry into material groups by a per-triangle classifier. */
function groupBy(geo, classify, nGroups) {
  const idx = geo.index.array;
  const pos = geo.attributes.position;
  const buckets = Array.from({ length: nGroups }, () => []);
  const c = new THREE.Vector3();
  for (let t = 0; t < idx.length; t += 3) {
    c.set(0, 0, 0);
    for (let v = 0; v < 3; v++) c.x += pos.getX(idx[t + v]), c.y += pos.getY(idx[t + v]), c.z += pos.getZ(idx[t + v]);
    c.multiplyScalar(1 / 3);
    buckets[classify(c)].push(idx[t], idx[t + 1], idx[t + 2]);
  }
  const all = new Uint32Array(idx.length);
  let o = 0;
  geo.clearGroups();
  buckets.forEach((b, g) => {
    geo.addGroup(o, b.length, g);
    for (let i = 0; i < b.length; i++) all[o++] = b[i];
  });
  geo.setIndex(new THREE.BufferAttribute(all, 1));
  return geo;
}

/** Gentle fabric folds pushed along the normal (gown regions only). */
function addFolds(geo, test, amp) {
  const pos = geo.attributes.position, nrm = geo.attributes.normal;
  for (let v = 0; v < pos.count; v++) {
    const x = pos.getX(v), y = pos.getY(v), z = pos.getZ(v);
    if (!test(x, y, z)) continue;
    const f = Math.sin(z * 46 + Math.sin(x * 21) * 2.2) * 0.6 + Math.sin(z * 17 - x * 31) * 0.4;
    const d = amp * f * clamp(y / 0.08, 0, 1);
    pos.setXYZ(v, x + nrm.getX(v) * d, y + nrm.getY(v) * d, z + nrm.getZ(v) * d);
  }
  geo.computeVertexNormals();
}

/** Body surface height at (x, z) by searching down the SDF; −1 when there is no body. */
function bodyTop(x, z) {
  let y = 0.36;
  let prev = bodySDF(x, y, z);
  for (; y > 0; y -= 0.004) {
    const d = bodySDF(x, y, z);
    if (d < 0) {
      let a = y, b = y + 0.004;
      for (let i = 0; i < 10; i++) {
        const m = (a + b) / 2;
        if (bodySDF(x, m, z) < 0) a = m;
        else b = m;
      }
      return a;
    }
    prev = d;
  }
  return prev > 0 ? -1 : 0;
}

/** Cotton sheet: tented between legs and over the toes, hangs over the pad edges. */
function buildSheet(quality) {
  const nx = quality > 0 ? 64 : 40, nz = quality > 0 ? 120 : 72;
  const x0 = -0.4, x1 = 0.4, z0 = 0.0 + DZ, z1 = 1.02 + DZ;
  const EDGE = 0.215;
  const h = new Float32Array((nx + 1) * (nz + 1));
  const base = new Float32Array(h.length);
  const X = new Float32Array(h.length);
  for (let j = 0; j <= nz; j++) {
    const z = z0 + ((z1 - z0) * j) / nz;
    for (let i = 0; i <= nx; i++) {
      const x = x0 + ((x1 - x0) * i) / nx;
      const n = i + j * (nx + 1);
      const ax = Math.abs(x);
      if (ax <= EDGE) {
        const top = bodyTop(x, z);
        base[n] = Math.max(top + 0.007, 0.004);
        X[n] = x;
      } else {
        // hanging part: almost vertical drop just outside the pad edge
        const t = (ax - EDGE) / (0.4 - EDGE);
        base[n] = 0.004 - t * 0.13;
        X[n] = Math.sign(x) * (EDGE + 0.012 + t * 0.03);
      }
      h[n] = base[n];
    }
  }
  // fabric stiffness: pre-blur the support so separate peaks (toes, knees) become one soft tent
  const blurred = new Float32Array(h.length);
  const R = 3;
  for (let pass = 0; pass < 2; pass++) {
    const src = pass === 0 ? base : blurred.slice();
    for (let j = 0; j <= nz; j++)
      for (let i = 0; i <= nx; i++) {
        let acc = 0, wsum = 0;
        for (let k = -R; k <= R; k++) {
          const ii = pass === 0 ? Math.min(nx, Math.max(0, i + k)) : i, jj = pass === 0 ? j : Math.min(nz, Math.max(0, j + k));
          const wgt = 1 - Math.abs(k) / (R + 1);
          acc += src[ii + jj * (nx + 1)] * wgt;
          wsum += wgt;
        }
        blurred[i + j * (nx + 1)] = acc / wsum;
      }
  }
  for (let n = 0; n < h.length; n++) if (Math.abs(X[n]) <= EDGE) base[n] = Math.max(base[n], blurred[n] * 0.96 + base[n] * 0.04), (h[n] = base[n]);
  // tension: relax toward neighbours but never sink into the body
  const tmp = new Float32Array(h.length);
  for (let it = 0; it < (quality > 0 ? 60 : 36); it++) {
    for (let j = 0; j <= nz; j++)
      for (let i = 0; i <= nx; i++) {
        const n = i + j * (nx + 1);
        if (Math.abs(X[n]) > EDGE) { tmp[n] = base[n]; continue; }
        const l = h[Math.max(0, i - 1) + j * (nx + 1)], r = h[Math.min(nx, i + 1) + j * (nx + 1)];
        const u = h[i + Math.max(0, j - 1) * (nx + 1)], d = h[i + Math.min(nz, j + 1) * (nx + 1)];
        tmp[n] = Math.max(base[n], (l + r + u + d) * 0.25 * 0.985 + h[n] * 0.015);
      }
    h.set(tmp);
  }
  const geo = new THREE.PlaneGeometry(1, 1, nx, nz);
  const pos = geo.attributes.position;
  for (let j = 0; j <= nz; j++)
    for (let i = 0; i <= nx; i++) {
      const v = i + j * (nx + 1);
      const z = z0 + ((z1 - z0) * j) / nz;
      const wr = Math.sin(z * 38 + X[v] * 9) * 0.0018 + Math.sin(z * 11 - X[v] * 23) * 0.0022;
      pos.setXYZ(v, X[v], h[v] + wr, z);
    }
  geo.computeVertexNormals();
  // Turned-down hem at the waist.
  const hem = new THREE.PlaneGeometry(1, 1, nx, 6);
  const hp = hem.attributes.position;
  for (let j = 0; j <= 6; j++)
    for (let i = 0; i <= nx; i++) {
      const v = i + j * (nx + 1);
      const src = i + Math.min(nz, j) * (nx + 1);
      hp.setXYZ(v, X[src], h[src] + 0.006, z0 + (0.07 * j) / 6);
    }
  hem.computeVertexNormals();
  return { geo, hem };
}

export function buildPatient(M, { quality = 1 } = {}) {
  const group = new THREE.Group();
  group.name = 'Patient';

  // Body
  const bodyGeo = polygonise(bodySDF, [-0.3, -0.01, -0.86 + 0.0 + DZ + 0.16 - 0.1], [0.3, 0.27, 0.99 + DZ], quality > 0 ? 116 : 84);
  // skin: neck, forearms + hands, lower legs; gown: torso, short sleeves, thighs
  const isSkin = (x, y, z) => {
    const ax = Math.abs(x);
    if (z < -0.6 + DZ) return true;
    if (forearmSDF(ax, y, z) < Math.min(torsoSDF(x, y, z), legSDF(ax, y, z)) + 0.004) return true;
    return z > 0.36 + DZ;
  };
  addFolds(bodyGeo, (x, y, z) => !isSkin(x, y, z), 0.0035);
  groupBy(bodyGeo, (c) => (isSkin(c.x, c.y, c.z) ? 0 : 1), 2);
  const body = new THREE.Mesh(bodyGeo, [M.skin, M.gown]);
  body.name = 'Body';
  group.add(body);

  // Head (higher resolution for facial form), yawed slightly.
  const headGeo = polygonise(headSDF, [-0.12, -0.12, -0.13], [0.12, 0.12, 0.17], quality > 0 ? 76 : 56);
  groupBy(headGeo, (c) => {
    // hair: crown and the back of the head
    const hair = (c.y < -0.012 && c.z < 0.05) || (c.z < -0.06 && c.y < 0.055);
    return hair ? 1 : 0;
  }, 2);
  const head = new THREE.Mesh(headGeo, [M.skin, M.hair]);
  head.position.set(...HEAD_C);
  head.rotation.z = HEAD_YAW;
  head.name = 'Head';
  group.add(head);

  // Sheet + hem
  const { geo: sheetGeo, hem } = buildSheet(quality);
  const sheet = new THREE.Mesh(sheetGeo, M.sheet);
  sheet.name = 'Sheet';
  const hemMesh = new THREE.Mesh(hem, M.sheet);
  group.add(sheet, hemMesh);

  group.traverse((m) => {
    if (m.isMesh) {
      m.castShadow = true;
      m.receiveShadow = true;
    }
  });
  return { group, body, head, sheet };
}

/** z-range of the torso in patient space (used to place CT slices and the volume). */
export const TORSO = { z0: -0.58 + DZ + 0.02, z1: 0.04 + DZ, y: 0.112 };
