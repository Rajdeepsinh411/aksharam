/**
 * Chooses the home-page experience before any 3D code is downloaded.
 *
 *   high    desktop / strong GPU: full scene, all post-processing, 2k HDRI, 128³ volume
 *   medium  good phones, laptops: full scene, half-res AO, no DoF, 1k HDRI, 64³ volume
 *   low     weak phones: no real-time 3D, a scroll-scrubbed pre-rendered video of the story
 *   still   reduced motion / no WebGL2: still frames per step with crossfades
 *
 * Override for testing: index.html?tier=high|medium|low|still
 */
const TIERS = ['high', 'medium', 'low', 'still'];

function hasWebGL2() {
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2');
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch (e) {
    return false;
  }
}

function withTimeout(promise, ms) {
  return Promise.race([promise, new Promise((resolve) => setTimeout(() => resolve(null), ms))]);
}

export async function detectTier({ reduceMotion = false } = {}) {
  const q = new URLSearchParams(location.search);
  if (q.has('record')) return 'high';
  const forced = q.get('tier');
  if (TIERS.includes(forced)) return forced;
  if (reduceMotion || !hasWebGL2()) return 'still';

  const conn = navigator.connection;
  if (conn && (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || ''))) return 'low';

  const uaMobile =
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
    (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent));
  const memory = navigator.deviceMemory || (uaMobile ? 4 : 8);
  const cores = navigator.hardwareConcurrency || 4;

  let gpu = null;
  try {
    const { getGPUTier } = await import('detect-gpu');
    gpu = await withTimeout(getGPUTier({ mobileTiers: [0, 15, 30, 60], desktopTiers: [0, 15, 30, 60] }), 1600);
  } catch (e) {
    gpu = null;
  }
  const mobile = gpu && typeof gpu.isMobile === 'boolean' ? gpu.isMobile : uaMobile;
  const t = gpu && typeof gpu.tier === 'number' ? gpu.tier : mobile ? 1 : 2;

  if (!mobile) {
    if (t >= 3 && memory >= 4) return 'high';
    if (t >= 1) return 'medium';
    return 'low';
  }
  // Phones / tablets: never the heaviest tier
  if (t >= 3 && memory >= 4 && cores >= 6) return 'medium';
  if (t >= 2 && memory >= 6 && cores >= 8) return 'medium';
  return 'low';
}
