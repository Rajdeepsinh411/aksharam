/**
 * Asset manifest + loaders.
 *
 * Real 3D models: drop the .glb into assets/models/ and set `enabled: true` below.
 * Until then the procedural fallbacks in scanner.js / patient.js / room.js / stations.js
 * are used. (Files are listed here instead of probed, so missing models never cause
 * 404s in the console.) See ASSETS.md for sourcing, node names and optimisation commands.
 */
import * as THREE from 'three';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

export const BASE = new URL('../../../', import.meta.url).href; // site root

export const MODELS = {
  // Each GLB: metres, +Y up, origin on the floor. Node names in ASSETS.md.
  ctScanner: { url: 'assets/models/ct-scanner.glb', enabled: false, phase: 1 },
  patient: { url: 'assets/models/patient.glb', enabled: false, phase: 1 },
  room: { url: 'assets/models/radiology-room.glb', enabled: false, phase: 1 },
  ultrasound: { url: 'assets/models/ultrasound-station.glb', enabled: false, phase: 2 },
  desk: { url: 'assets/models/reporting-desk.glb', enabled: false, phase: 2 }
};

export const FILES = {
  hdri: { low: 'assets/hdri/hospital_room_1k.hdr', high: 'assets/hdri/hospital_room_2k.hdr' },
  data: 'assets/data/',
  slices: 'assets/data/ct-slices.webp',
  monitorL: 'assets/data/ct-monitor-left.webp',
  monitorR: 'assets/data/ct-monitor-right.webp',
  doppler: 'assets/video/us-doppler.webp',
  usVideo: { webm: 'assets/video/us-abdomen.webm', mp4: 'assets/video/us-abdomen.mp4', poster: 'assets/video/us-abdomen-poster.jpg' },
  volumeLoop: { webm: 'assets/video/ct-volume-loop.webm', mp4: 'assets/video/ct-volume-loop.mp4' }
};

const CDN = 'https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/libs/';

export function createLoaders(onProgress) {
  const manager = new THREE.LoadingManager();
  manager.onProgress = (url, loaded, total) => onProgress(loaded / Math.max(1, total));
  const tex = new THREE.TextureLoader(manager);
  const rgbe = new RGBELoader(manager);
  let gltf = null;

  async function gltfLoader(renderer) {
    if (gltf) return gltf;
    const [{ GLTFLoader }, { DRACOLoader }, { KTX2Loader }, { MeshoptDecoder }] = await Promise.all([
      import('three/addons/loaders/GLTFLoader.js'),
      import('three/addons/loaders/DRACOLoader.js'),
      import('three/addons/loaders/KTX2Loader.js'),
      import('three/addons/libs/meshopt_decoder.module.js')
    ]);
    const draco = new DRACOLoader(manager).setDecoderPath(`${CDN}draco/gltf/`);
    const ktx2 = new KTX2Loader(manager).setTranscoderPath(`${CDN}basis/`).detectSupport(renderer);
    gltf = new GLTFLoader(manager).setDRACOLoader(draco).setKTX2Loader(ktx2).setMeshoptDecoder(MeshoptDecoder);
    return gltf;
  }

  return {
    manager,
    texture(path, { srgb = true, flipY = true } = {}) {
      return new Promise((resolve, reject) =>
        tex.load(
          BASE + path,
          (t) => {
            t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
            t.flipY = flipY;
            t.anisotropy = 8;
            resolve(t);
          },
          undefined,
          reject
        )
      );
    },
    hdri(path, renderer) {
      return new Promise((resolve, reject) =>
        rgbe.load(
          BASE + path,
          (hdr) => {
            const pmrem = new THREE.PMREMGenerator(renderer);
            const env = pmrem.fromEquirectangular(hdr).texture;
            hdr.dispose();
            pmrem.dispose();
            resolve(env);
          },
          undefined,
          reject
        )
      );
    },
    async model(key, renderer) {
      const spec = MODELS[key];
      if (!spec || !spec.enabled) return null;
      const loader = await gltfLoader(renderer);
      const res = await loader.loadAsync(BASE + spec.url);
      const root = res.scene;
      root.traverse((o) => {
        if (o.isMesh) {
          o.castShadow = o.receiveShadow = true;
          const mats = Array.isArray(o.material) ? o.material : [o.material];
          mats.forEach((m) => m && 'envMapIntensity' in m && (m.envMapIntensity = 1));
        }
      });
      return root;
    }
  };
}

/** Muted, looping, inline video for in-scene screens. Resolves when the first frame is decodable. */
export function createVideo({ webm, mp4, poster }, { loop = true } = {}) {
  const v = document.createElement('video');
  v.muted = true;
  v.defaultMuted = true;
  v.loop = loop;
  v.playsInline = true;
  v.setAttribute('playsinline', '');
  v.setAttribute('muted', '');
  v.crossOrigin = 'anonymous';
  v.preload = 'auto';
  if (poster) v.poster = BASE + poster;
  const canWebm = v.canPlayType('video/webm; codecs="vp9"');
  v.src = BASE + (canWebm ? webm : mp4);
  const ready = new Promise((resolve, reject) => {
    v.addEventListener('loadeddata', () => resolve(v), { once: true });
    v.addEventListener('error', () => reject(new Error('video failed: ' + v.src)), { once: true });
  });
  v.load();
  return { video: v, ready };
}

export function videoTexture(video) {
  const t = new THREE.VideoTexture(video);
  t.colorSpace = THREE.SRGBColorSpace;
  t.minFilter = THREE.LinearFilter;
  t.magFilter = THREE.LinearFilter;
  t.generateMipmaps = false;
  return t;
}

/** Dispose every geometry, material and texture under an object. */
export function disposeObject(root) {
  const seen = new Set();
  root.traverse((o) => {
    if (o.geometry && !seen.has(o.geometry)) seen.add(o.geometry), o.geometry.dispose();
    const mats = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
    for (const m of mats) {
      if (seen.has(m)) continue;
      seen.add(m);
      for (const k in m) {
        const v = m[k];
        if (v && v.isTexture && !seen.has(v)) seen.add(v), v.dispose();
      }
      m.dispose();
    }
  });
}
