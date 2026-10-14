/**
 * Real CT data: axial slices as thin glass panes, and a ray-marched volume render.
 * Data: TotalSegmentator dataset case s1233 (CC BY 4.0), see CREDITS.md.
 *
 * Local frame of the CT rig (same for slices and volume):
 *   x = patient's left, y = anterior, z = toward the feet; origin = volume centre; metres.
 */
import * as THREE from 'three';

/* ---------- loading ---------- */
async function gunzip(buf) {
  const bytes = new Uint8Array(buf);
  if (bytes[0] !== 0x1f || bytes[1] !== 0x8b) return bytes; // server already decoded it
  if (typeof DecompressionStream === 'undefined') throw new Error('DecompressionStream unsupported');
  const ds = new DecompressionStream('gzip');
  const stream = new Blob([bytes]).stream().pipeThrough(ds);
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

export async function loadVolumeData(base, quality, onProgress = () => {}) {
  const meta = await (await fetch(`${base}ct-volume.json`)).json();
  const spec = meta[quality === 'hi' ? 'hi' : 'lo'];
  const res = await fetch(`${base}${spec.file}`);
  const total = Number(res.headers.get('content-length')) || 0;
  let buf;
  if (res.body && total) {
    const reader = res.body.getReader();
    const chunks = [];
    let got = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      got += value.length;
      onProgress(Math.min(1, got / total));
    }
    buf = new Uint8Array(got);
    let o = 0;
    for (const c of chunks) buf.set(c, o), (o += c.length);
    buf = buf.buffer;
  } else {
    buf = await res.arrayBuffer();
  }
  const data = await gunzip(buf);
  const [nx, ny, nz] = spec.dims;
  if (data.length !== nx * ny * nz) throw new Error('CT volume size mismatch');
  return { meta, dims: spec.dims, data };
}

/* ---------- transfer function (clinical greyscale + white bone) ---------- */
function byteToHU(b, map) {
  for (let s = 1; s < map.length; s++) {
    const [h0, b0] = map[s - 1], [h1, b1] = map[s];
    if (b <= b1) return h0 + ((b - b0) / (b1 - b0)) * (h1 - h0);
  }
  return map[map.length - 1][0];
}
const bell = (x, c, w) => Math.exp(-((x - c) * (x - c)) / (2 * w * w));
const ramp = (x, a, b) => Math.min(1, Math.max(0, (x - a) / (b - a)));

function transferTexture(map) {
  const N = 256;
  const d = new Uint8Array(N * 4);
  for (let b = 0; b < N; b++) {
    const hu = byteToHU(b, map);
    let a = 0, r = 0, g = 0, bl = 0;
    const add = (alpha, c) => {
      r += c[0] * alpha; g += c[1] * alpha; bl += c[2] * alpha; a += alpha;
    };
    add(0.0035 * bell(hu, -90, 40), [0.8, 0.84, 0.9]); // skin / fat: a faint glassy hull
    add(0.006 * bell(hu, 45, 25), [0.72, 0.76, 0.82]); // soft tissue
    add(0.12 * ramp(hu, 150, 260) * (1 - ramp(hu, 330, 420)), [0.95, 0.95, 0.97]); // enhanced vessels / kidneys
    add(0.8 * ramp(hu, 260, 650), [1.0, 0.99, 0.965]); // bone
    if (a > 0) { r /= a; g /= a; bl /= a; }
    d[b * 4] = r * 255; d[b * 4 + 1] = g * 255; d[b * 4 + 2] = bl * 255; d[b * 4 + 3] = Math.min(1, a) * 255;
  }
  const t = new THREE.DataTexture(d, N, 1);
  t.magFilter = t.minFilter = THREE.LinearFilter;
  t.needsUpdate = true;
  return t;
}

/* ---------- volume ray marcher ---------- */
const volumeVert = /* glsl */ `
  varying vec3 vLocal;
  void main() {
    vLocal = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }`;
const volumeFrag = /* glsl */ `
  precision highp sampler3D;
  uniform sampler3D uVol;
  uniform sampler2D uTF;
  uniform vec3 uCamLocal;
  uniform vec3 uLightLocal;
  uniform vec3 uTexel;
  uniform float uSteps;
  uniform float uOpacity;
  uniform float uReveal;
  uniform float uPlane;
  uniform float uPlaneOn;
  uniform float uFrame;
  uniform mat4 uMVP;
  varying vec3 vLocal;

  vec2 hitBox(vec3 o, vec3 d) {
    vec3 inv = 1.0 / d;
    vec3 t0 = (vec3(-0.5) - o) * inv, t1 = (vec3(0.5) - o) * inv;
    vec3 tmin = min(t0, t1), tmax = max(t0, t1);
    return vec2(max(max(tmin.x, tmin.y), tmin.z), min(min(tmax.x, tmax.y), tmax.z));
  }
  float hash(vec2 p) { return fract(sin(dot(p + uFrame * 0.618, vec2(12.9898, 78.233))) * 43758.5453); }

  void main() {
    vec3 rd = normalize(vLocal - uCamLocal);
    vec2 t = hitBox(uCamLocal, rd);
    if (t.x > t.y) discard;
    t.x = max(t.x, 0.0);
    float dt = 1.0 / uSteps;
    float tt = t.x + dt * hash(gl_FragCoord.xy);
    vec4 acc = vec4(0.0);
    vec3 hit = vec3(0.0);
    bool found = false;
    for (int i = 0; i < MAX_STEPS; i++) {
      if (tt > t.y || acc.a > 0.97) break;
      vec3 p = uCamLocal + rd * tt;
      vec3 uvw = p + 0.5;
      float reveal = 1.0 - smoothstep(uReveal - 0.04, uReveal, uvw.z);
      // soft fade at the field-of-view edges (arms clipped by the scan) and the cut ends
      float edge = smoothstep(0.0, 0.1, uvw.x) * smoothstep(1.0, 0.9, uvw.x) * smoothstep(0.0, 0.04, uvw.z) * smoothstep(1.0, 0.96, uvw.z);
      float v = textureLod(uVol, uvw, 0.0).r;
      vec4 s = textureLod(uTF, vec2(v, 0.5), 0.0);
      s.a *= edge;
      if (s.a > 0.002 && reveal > 0.0) {
        vec3 g = vec3(
          textureLod(uVol, uvw + vec3(uTexel.x, 0.0, 0.0), 0.0).r - textureLod(uVol, uvw - vec3(uTexel.x, 0.0, 0.0), 0.0).r,
          textureLod(uVol, uvw + vec3(0.0, uTexel.y, 0.0), 0.0).r - textureLod(uVol, uvw - vec3(0.0, uTexel.y, 0.0), 0.0).r,
          textureLod(uVol, uvw + vec3(0.0, 0.0, uTexel.z), 0.0).r - textureLod(uVol, uvw - vec3(0.0, 0.0, uTexel.z), 0.0).r);
        float gl = length(g);
        vec3 n = gl > 1e-4 ? -g / gl : -rd;
        float diff = max(dot(n, uLightLocal), 0.0) * 0.8 + abs(dot(n, rd)) * 0.25;
        float spec = pow(max(dot(n, normalize(uLightLocal - rd)), 0.0), 28.0) * smoothstep(0.02, 0.12, gl);
        vec3 col = s.rgb * (0.35 + diff * 1.15) + vec3(spec * 0.45);
        // faint red highlight on the current scan plane
        float pd = uvw.z - uPlane;
        col += vec3(1.0, 0.1, 0.13) * exp(-pd * pd / 0.00004) * uPlaneOn * 2.6;
        float a = 1.0 - pow(1.0 - s.a, dt * 160.0);
        a *= reveal;
        acc.rgb += (1.0 - acc.a) * col * a;
        acc.a += (1.0 - acc.a) * a;
        if (!found && acc.a > 0.12) { hit = p; found = true; }
      }
      tt += dt;
    }
    gl_FragColor = acc * uOpacity; // premultiplied
    // depth of the first solid sample, so depth of field and AO treat the volume as a real object
    if (found) {
      vec4 clip = uMVP * vec4(hit, 1.0);
      gl_FragDepth = clamp((clip.z / clip.w) * 0.5 + 0.5, 0.0, 1.0);
    } else {
      discard; // nothing solid along this ray: leave colour and depth untouched
    }
  }`;

export function createVolumeMesh({ dims, data, meta }, steps) {
  const tex = new THREE.Data3DTexture(data, dims[0], dims[1], dims[2]);
  tex.format = THREE.RedFormat;
  tex.type = THREE.UnsignedByteType;
  tex.minFilter = tex.magFilter = THREE.LinearFilter;
  tex.unpackAlignment = 1;
  tex.needsUpdate = true;
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uVol: { value: tex },
      uTF: { value: transferTexture(meta.huMap) },
      uCamLocal: { value: new THREE.Vector3() },
      uLightLocal: { value: new THREE.Vector3(0.3, 0.8, 0.5).normalize() },
      uTexel: { value: new THREE.Vector3(1 / dims[0], 1 / dims[1], 1 / dims[2]) },
      uSteps: { value: steps },
      uOpacity: { value: 0 },
      uReveal: { value: 1 },
      uPlane: { value: 0.5 },
      uPlaneOn: { value: 0 },
      uFrame: { value: 0 },
      uMVP: { value: new THREE.Matrix4() }
    },
    defines: { MAX_STEPS: Math.ceil(steps * 1.8) },
    vertexShader: volumeVert,
    fragmentShader: volumeFrag,
    side: THREE.BackSide,
    transparent: true,
    depthWrite: true,
    blending: THREE.CustomBlending,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneMinusSrcAlphaFactor
  });
  const size = meta.sizeMm.map((v) => v / 1000);
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), mat);
  mesh.scale.set(size[0], size[1], size[2]);
  mesh.name = 'CT_Volume';
  mesh.renderOrder = 5;
  mesh.frustumCulled = false;
  const inv = new THREE.Matrix4();
  const camLocal = new THREE.Vector3();
  const lightWorld = new THREE.Vector3();
  mesh.onBeforeRender = (renderer, scene, camera) => {
    inv.copy(mesh.matrixWorld).invert();
    camLocal.setFromMatrixPosition(camera.matrixWorld).applyMatrix4(inv);
    mat.uniforms.uCamLocal.value.copy(camLocal);
    // light from above/front-left of the camera, expressed in local space
    lightWorld.set(-0.4, 1.0, 0.6).normalize().transformDirection(inv);
    mat.uniforms.uLightLocal.value.copy(lightWorld).normalize();
    if (!mesh.userData.freezeNoise) mat.uniforms.uFrame.value = (mat.uniforms.uFrame.value + 1) % 64;
    mat.uniforms.uMVP.value.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse).multiply(mesh.matrixWorld);
  };
  return { mesh, size, uniforms: mat.uniforms, dispose: () => (tex.dispose(), mat.uniforms.uTF.value.dispose(), mat.dispose(), mesh.geometry.dispose()) };
}

/* ---------- glass slices ---------- */
export function createSlices(atlas, meta, count) {
  const S = meta.slices;
  const size = meta.sizeMm.map((v) => v / 1000);
  const side = Math.max(size[0], size[1]);
  const group = new THREE.Group();
  group.name = 'CT_Slices';
  const uGlass = { value: 0.1 };
  const all = [];
  const pick = Array.from({ length: count }, (_, i) => Math.round((i * (S.count - 1)) / Math.max(1, count - 1)));
  const geo = new THREE.BoxGeometry(side, side, 0.003);
  pick.forEach((tile, i) => {
    const t = atlas.clone();
    t.repeat.set(1 / S.cols, 1 / S.rows);
    t.offset.set((tile % S.cols) / S.cols, 1 - (Math.floor(tile / S.cols) + 1) / S.rows);
    t.needsUpdate = true;
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0xdfe7ee,
      roughness: 0.06,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.03,
      emissive: 0xffffff,
      emissiveMap: t,
      emissiveIntensity: 1.7,
      alphaMap: t,
      transparent: true,
      opacity: 0,
      depthWrite: true,
      side: THREE.DoubleSide,
      envMapIntensity: 1.3
    });
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uGlass = uGlass;
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', '#include <common>\nuniform float uGlass;')
        .replace('#include <alphamap_fragment>', 'diffuseColor.a *= max(uGlass, texture2D(alphaMap, vAlphaMapUv).g);');
    };
    mat.customProgramCacheKey = () => 'ctSlice';
    const m = new THREE.Mesh(geo, mat);
    const zf = S.z[tile];
    m.userData = { z0: (zf - 0.5) * size[2], k: count > 1 ? i / (count - 1) : 0.5 };
    m.position.z = m.userData.z0;
    m.renderOrder = 6;
    group.add(m);
    all.push(m);
  });
  return {
    group,
    slices: all,
    setOpacity(o) {
      for (const m of all) m.material.opacity = o;
      group.visible = o > 0.002;
    },
    dispose() {
      geo.dispose();
      for (const m of all) m.material.emissiveMap.dispose(), m.material.dispose();
    }
  };
}
