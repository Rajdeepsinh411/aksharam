/**
 * Procedural surface detail: generated once in code so the fallback models
 * never look flat. Every map is small, tileable and uses linear colour space.
 *   - orange-peel normal (painted / clearcoated shells)
 *   - smudge roughness (fingerprints, wipes, micro-scratches)
 *   - fabric weave normal (sheet, gown, cushions)
 *   - floor mottling roughness + normal (sealed vinyl)
 */
import * as THREE from 'three';

/* ---------- tileable value noise ---------- */
function makeNoise(seed = 1) {
  const P = 256;
  const perm = new Uint8Array(P * 2);
  const rnd = mulberry(seed);
  const p = Array.from({ length: P }, (_, i) => i);
  for (let i = P - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  for (let i = 0; i < P * 2; i++) perm[i] = p[i & 255];
  const val = new Float32Array(P);
  for (let i = 0; i < P; i++) val[i] = rnd();
  const fade = (t) => t * t * (3 - 2 * t);
  // period = repeat cells so the texture tiles
  return function noise(x, y, period) {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const x0 = ((xi % period) + period) % period, y0 = ((yi % period) + period) % period;
    const x1 = (x0 + 1) % period, y1 = (y0 + 1) % period;
    const h = (a, b) => val[perm[perm[a & 255] + (b & 255)]];
    const u = fade(xf), v = fade(yf);
    return (h(x0, y0) * (1 - u) + h(x1, y0) * u) * (1 - v) + (h(x0, y1) * (1 - u) + h(x1, y1) * u) * v;
  };
}

function fbm(noise, x, y, period, octaves = 4) {
  let a = 0.5, f = 1, s = 0, n = 0;
  for (let o = 0; o < octaves; o++) {
    s += a * noise(x * f, y * f, period * f);
    n += a;
    a *= 0.5;
    f *= 2;
  }
  return s / n;
}

export function mulberry(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function dataTexture(data, size, { repeat = 1, srgb = false } = {}) {
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat, repeat);
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.anisotropy = 8;
  tex.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/** Height field (Float32Array, size²) → tangent-space normal map. */
function heightToNormal(h, size, strength) {
  const out = new Uint8Array(size * size * 4);
  const at = (x, y) => h[((y + size) % size) * size + ((x + size) % size)];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (at(x + 1, y) - at(x - 1, y)) * strength;
      const dy = (at(x, y + 1) - at(x, y - 1)) * strength;
      const len = Math.hypot(dx, dy, 1);
      const o = (y * size + x) * 4;
      out[o] = ((-dx / len) * 0.5 + 0.5) * 255;
      out[o + 1] = ((dy / len) * 0.5 + 0.5) * 255;
      out[o + 2] = ((1 / len) * 0.5 + 0.5) * 255;
      out[o + 3] = 255;
    }
  }
  return out;
}

const cache = new Map();
function cached(key, fn) {
  if (!cache.has(key)) cache.set(key, fn());
  return cache.get(key);
}

/** Fine orange-peel ripple of sprayed paint under a clearcoat. */
export function orangePeelNormal(size = 256) {
  return cached('peel' + size, () => {
    const n = makeNoise(7);
    const h = new Float32Array(size * size);
    const cells = 32;
    for (let y = 0; y < size; y++)
      for (let x = 0; x < size; x++) h[y * size + x] = fbm(n, (x / size) * cells, (y / size) * cells, cells, 3);
    return dataTexture(heightToNormal(h, size, 2.2), size, { repeat: 6 });
  });
}

/**
 * Roughness variation: soft wipes, oval fingerprint smudges and fine scratches.
 * Values centre around 0.5 so material.roughness acts as the average.
 */
export function smudgeRoughness(size = 512, seed = 3) {
  return cached('smudge' + size + seed, () => {
    const n = makeNoise(seed);
    const rnd = mulberry(seed * 31);
    const r = new Float32Array(size * size);
    for (let y = 0; y < size; y++)
      for (let x = 0; x < size; x++) r[y * size + x] = 0.5 + (fbm(n, (x / size) * 6, (y / size) * 6, 6, 4) - 0.5) * 0.35;
    // fingerprints: concentric ridges inside soft ovals, slightly less rough (oily)
    for (let f = 0; f < 14; f++) {
      const cx = rnd() * size, cy = rnd() * size, rx = 10 + rnd() * 14, ry = rx * (1.2 + rnd() * 0.4), rot = rnd() * Math.PI;
      const c = Math.cos(rot), s = Math.sin(rot);
      for (let y = -ry * 1.3; y < ry * 1.3; y++)
        for (let x = -ry * 1.3; x < ry * 1.3; x++) {
          const u = (x * c + y * s) / rx, v = (-x * s + y * c) / ry;
          const d = Math.hypot(u, v);
          if (d > 1) continue;
          const px = ((Math.round(cx + x) % size) + size) % size, py = ((Math.round(cy + y) % size) + size) % size;
          const ridge = 0.5 + 0.5 * Math.sin(d * 34);
          r[py * size + px] -= (1 - d) * (0.12 + ridge * 0.08);
        }
    }
    // micro-scratches: thin bright arcs (rougher)
    for (let k = 0; k < 90; k++) {
      let x = rnd() * size, y = rnd() * size;
      const len = 20 + rnd() * 90, ang = rnd() * Math.PI * 2, curve = (rnd() - 0.5) * 0.02;
      let a = ang;
      for (let t = 0; t < len; t++) {
        a += curve;
        x += Math.cos(a);
        y += Math.sin(a);
        const px = ((Math.round(x) % size) + size) % size, py = ((Math.round(y) % size) + size) % size;
        r[py * size + px] += 0.18 * (1 - t / len);
      }
    }
    const out = new Uint8Array(size * size * 4);
    for (let i = 0; i < size * size; i++) {
      const v = Math.max(0, Math.min(255, r[i] * 255));
      out[i * 4] = out[i * 4 + 1] = out[i * 4 + 2] = v;
      out[i * 4 + 3] = 255;
    }
    return dataTexture(out, size, { repeat: 1 });
  });
}

/** Plain-weave cotton: crossing threads plus slub irregularity. */
export function fabricNormal(size = 256) {
  return cached('fabric' + size, () => {
    const n = makeNoise(11);
    const h = new Float32Array(size * size);
    const threads = 64;
    for (let y = 0; y < size; y++)
      for (let x = 0; x < size; x++) {
        const u = (x / size) * threads * Math.PI * 2, v = (y / size) * threads * Math.PI * 2;
        const over = Math.sin(u / 2) * Math.sin(v / 2) > 0 ? 1 : 0;
        const warp = Math.pow(Math.abs(Math.sin(u)), 0.6), weft = Math.pow(Math.abs(Math.sin(v)), 0.6);
        h[y * size + x] = (over ? warp : weft) * 0.6 + fbm(n, (x / size) * 16, (y / size) * 16, 16, 3) * 0.6;
      }
    return dataTexture(heightToNormal(h, size, 1.6), size, { repeat: 8 });
  });
}

/** Sealed vinyl floor: broad mottling in roughness, very faint undulation in normal. */
export function floorMaps(size = 512) {
  return cached('floor' + size, () => {
    const n = makeNoise(5);
    const n2 = makeNoise(9);
    const rough = new Uint8Array(size * size * 4);
    const h = new Float32Array(size * size);
    for (let y = 0; y < size; y++)
      for (let x = 0; x < size; x++) {
        const big = fbm(n, (x / size) * 4, (y / size) * 4, 4, 5);
        const fine = fbm(n2, (x / size) * 48, (y / size) * 48, 48, 2);
        const v = 0.42 + (big - 0.5) * 0.5 + (fine - 0.5) * 0.12;
        const o = (y * size + x) * 4;
        rough[o] = rough[o + 1] = rough[o + 2] = Math.max(0, Math.min(255, v * 255));
        rough[o + 3] = 255;
        h[y * size + x] = big * 0.6 + fine * 0.15;
      }
    return {
      roughness: dataTexture(rough, size, { repeat: 3 }),
      normal: dataTexture(heightToNormal(h, size, 0.9), size, { repeat: 3 })
    };
  });
}

/** Soft radial gradient (white centre → transparent) for light glows and floor rings. */
export function radialSprite(size = 128) {
  return cached('radial' + size, () => {
    const out = new Uint8Array(size * size * 4);
    for (let y = 0; y < size; y++)
      for (let x = 0; x < size; x++) {
        const d = Math.hypot(x / (size - 1) - 0.5, y / (size - 1) - 0.5) * 2;
        const a = Math.max(0, 1 - d);
        const o = (y * size + x) * 4;
        out[o] = out[o + 1] = out[o + 2] = 255;
        out[o + 3] = a * a * 255;
      }
    const t = dataTexture(out, size);
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    return t;
  });
}

/** Small canvas texture for the gantry's patient display (breath-hold icon, no text). */
export function gantryDisplayTexture() {
  return cached('gantryDisplay', () => {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 128;
    const g = c.getContext('2d');
    const grd = g.createLinearGradient(0, 0, 0, 128);
    grd.addColorStop(0, '#0b1a24');
    grd.addColorStop(1, '#06121a');
    g.fillStyle = grd;
    g.fillRect(0, 0, 256, 128);
    g.strokeStyle = '#9fd3ef';
    g.lineWidth = 5;
    g.lineCap = 'round';
    // simple lungs pictogram
    g.beginPath();
    g.moveTo(128, 30);
    g.lineTo(128, 62);
    g.moveTo(120, 58);
    g.bezierCurveTo(90, 52, 80, 96, 92, 104);
    g.bezierCurveTo(104, 110, 118, 100, 120, 86);
    g.closePath();
    g.moveTo(136, 58);
    g.bezierCurveTo(166, 52, 176, 96, 164, 104);
    g.bezierCurveTo(152, 110, 138, 100, 136, 86);
    g.closePath();
    g.stroke();
    // progress ring segments
    g.lineWidth = 4;
    for (let i = 0; i < 12; i++) {
      g.strokeStyle = i < 8 ? '#9fd3ef' : '#29404d';
      g.beginPath();
      const a0 = -Math.PI / 2 + (i / 12) * Math.PI * 2 + 0.06, a1 = a0 + (Math.PI * 2) / 12 - 0.12;
      g.arc(214, 64, 26, a0, a1);
      g.stroke();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  });
}

export function disposeTextureCache() {
  for (const v of cache.values()) {
    if (v && v.isTexture) v.dispose();
    else if (v) Object.values(v).forEach((t) => t && t.isTexture && t.dispose());
  }
  cache.clear();
}
