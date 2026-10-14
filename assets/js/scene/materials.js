/**
 * Physically based material library for the procedural (fallback) models.
 * Brand red appears only on practical light sources (gantry LED strip, laser).
 */
import * as THREE from 'three';
import { orangePeelNormal, smudgeRoughness, fabricNormal, floorMaps } from './textures.js';

export const RED = new THREE.Color(0xae1f27);
export const LASER = new THREE.Color(0xff2433);

/** Shared uniforms: the projected laser line and scan-plane glow on any patched material. */
export const sceneUniforms = {
  uLaserZ: { value: 0 },
  uLaserOn: { value: 0 },
  uLaserColor: { value: LASER.clone().multiplyScalar(16) },
  uTime: { value: 0 }
};

/**
 * Adds a thin projected laser line (a plane of light at world z = uLaserZ,
 * restricted to the gantry's height range) to a standard/physical material.
 */
export function withLaser(material) {
  const prev = material.onBeforeCompile;
  material.onBeforeCompile = (shader, renderer) => {
    if (prev) prev(shader, renderer);
    Object.assign(shader.uniforms, sceneUniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vLaserWorld;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvLaserWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        '#include <common>\nvarying vec3 vLaserWorld;\nuniform float uLaserZ;\nuniform float uLaserOn;\nuniform vec3 uLaserColor;'
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
        {
          float d = abs(vLaserWorld.z - uLaserZ);
          float line = exp(-d * d / 0.000012) + 0.12 * exp(-d * d / 0.0012);
          float inGantry = smoothstep(0.55, 0.62, vLaserWorld.y) * (1.0 - smoothstep(1.5, 1.6, vLaserWorld.y)) * step(abs(vLaserWorld.x), 0.42);
          totalEmissiveRadiance += uLaserColor * line * inGantry * uLaserOn;
        }`
      );
  };
  material.customProgramCacheKey = () => 'laser' + (material.type || '');
  return material;
}

export function createMaterials(tier) {
  const hi = tier === 'high';
  const peel = orangePeelNormal(hi ? 256 : 128);
  const smudge = smudgeRoughness(hi ? 512 : 256, 3);
  const smudge2 = smudgeRoughness(hi ? 512 : 256, 8);
  const fabric = fabricNormal(hi ? 256 : 128);
  const floor = floorMaps(hi ? 512 : 256);

  const M = {
    // Glossy clinical white shell: satin base, clearcoat with orange peel and fingerprints.
    shell: new THREE.MeshPhysicalMaterial({
      color: 0xf2f3f4,
      roughness: 0.42,
      roughnessMap: smudge,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.06,
      clearcoatRoughnessMap: smudge2,
      clearcoatNormalMap: peel,
      clearcoatNormalScale: new THREE.Vector2(0.18, 0.18),
      envMapIntensity: 1
    }),
    shellWarm: null, // same as shell (one shader program fewer)
    // Satin grey inner bore and trim
    satin: new THREE.MeshStandardMaterial({ color: 0xbfc3c8, roughness: 0.5, roughnessMap: smudge }),
    satinDark: new THREE.MeshStandardMaterial({ color: 0x6d7279, roughness: 0.5, roughnessMap: smudge2, metalness: 0.1 }),
    plastic: new THREE.MeshStandardMaterial({ color: 0x2b2e33, roughness: 0.48, roughnessMap: smudge }),
    rubber: new THREE.MeshStandardMaterial({ color: 0x1d1f22, roughness: 0.85 }),
    aluminium: new THREE.MeshStandardMaterial({ color: 0xc4c8cd, metalness: 1, roughness: 0.32, roughnessMap: smudge2 }),
    chrome: new THREE.MeshStandardMaterial({ color: 0xeef0f2, metalness: 1, roughness: 0.12 }),
    seam: new THREE.MeshStandardMaterial({ color: 0x8b9096, roughness: 0.6 }),
    // Practical lights (bloom picks these up; nothing else is bright enough to)
    led: new THREE.MeshStandardMaterial({ color: 0x220405, emissive: RED, emissiveIntensity: 26, roughness: 0.3 }),
    laserWindow: new THREE.MeshStandardMaterial({ color: 0x0b0c0e, emissive: LASER, emissiveIntensity: 0, roughness: 0.15 }),
    ceilingPanel: new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xf4f8ff, emissiveIntensity: 0, roughness: 1 }),
    statusGreen: new THREE.MeshStandardMaterial({ color: 0x031208, emissive: 0x39d47a, emissiveIntensity: 2.2 }),
    // Fabrics
    sheet: new THREE.MeshPhysicalMaterial({
      color: 0xdfe4e9, roughness: 0.9, sheen: 0.6, sheenRoughness: 0.6, sheenColor: new THREE.Color(0xe8eef4),
      normalMap: fabric, normalScale: new THREE.Vector2(0.35, 0.35), side: THREE.DoubleSide
    }),
    gown: new THREE.MeshPhysicalMaterial({
      color: 0x9fbdd0, roughness: 0.88, sheen: 0.8, sheenRoughness: 0.6, sheenColor: new THREE.Color(0xdfeaf2),
      normalMap: fabric, normalScale: new THREE.Vector2(0.3, 0.3)
    }),
    skin: new THREE.MeshStandardMaterial({ color: 0x8c6450, roughness: 0.6 }),
    hair: new THREE.MeshStandardMaterial({ color: 0x15110f, roughness: 0.62 }),
    pad: new THREE.MeshStandardMaterial({ color: 0x48525d, roughness: 0.42, roughnessMap: smudge2 }),
    pillow: null, // same as sheet
    // Room
    floor: new THREE.MeshStandardMaterial({
      color: 0x9da2a7, roughness: 0.22, roughnessMap: floor.roughness, normalMap: floor.normal, normalScale: new THREE.Vector2(0.12, 0.12)
    }),
    wall: new THREE.MeshStandardMaterial({ color: 0xeceef0, roughness: 0.82 }),
    wallPanel: new THREE.MeshStandardMaterial({ color: 0xdadde0, roughness: 0.5, roughnessMap: smudge2 }),
    ceiling: new THREE.MeshStandardMaterial({ color: 0xeef0f2, roughness: 0.92, emissive: 0x15171a }),
    skirting: new THREE.MeshStandardMaterial({ color: 0xb8bdc3, roughness: 0.4 }),
    glass: new THREE.MeshPhysicalMaterial({
      color: 0xd8e4ea, roughness: 0.04, metalness: 0, transparent: true, opacity: 0.16, envMapIntensity: 1.4, depthWrite: false
    }),
    frostedGlass: new THREE.MeshPhysicalMaterial({
      color: 0xe8eef1, roughness: 0.45, transparent: true, opacity: 0.55, envMapIntensity: 0.8, depthWrite: false
    }),
    wood: new THREE.MeshStandardMaterial({ color: 0xc9b9a6, roughness: 0.6 }),
    deskTop: new THREE.MeshStandardMaterial({ color: 0xe9e7e3, roughness: 0.32, roughnessMap: smudge })
  };
  M.shellWarm = M.shell;
  M.pillow = M.sheet;

  // The laser line can fall on anything the patient lies on.
  ['sheet', 'gown', 'skin', 'pad', 'shell'].forEach((k) => withLaser(M[k]));
  return M;
}

/** Monitor / display screen: emissive image behind a glossy glass surface. */
export function screenMaterial(map, intensity = 1.25) {
  return new THREE.MeshPhysicalMaterial({
    color: 0x000000,
    emissive: 0xffffff,
    emissiveMap: map,
    emissiveIntensity: intensity,
    roughness: 0.18,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    metalness: 0
  });
}
