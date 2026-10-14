/**
 * Recording helper for the low tier and the still frames (index.html?record=…).
 * Steps the story deterministically, frame by frame, and saves PNG frames.
 *
 *   ?record=story&w=1280&h=720&frames=240&fps=24   whole scroll story (low-tier video)
 *   ?record=stills&w=1920&h=1080                    one frame per step (reduced-motion stills)
 *   ?record=volume&w=720&h=720&frames=144           rotating CT volume loop (volume fallback)
 *
 * In Chrome/Edge a "Choose folder & record" button writes frames with the File System
 * Access API. tools/record.mjs drives the same API headlessly (window.__recorder).
 * Encode with ffmpeg: see README.md → "Record the fallback video".
 */
import * as THREE from 'three';

export function recordOptions() {
  const q = new URLSearchParams(location.search);
  if (!q.has('record')) return null;
  const mode = q.get('record') === '1' ? 'story' : q.get('record');
  const defaults = { story: [1280, 720, 240], stills: [1920, 1080, 6], volume: [720, 720, 144] }[mode] || [1280, 720, 240];
  return {
    mode,
    width: Number(q.get('w')) || defaults[0],
    height: Number(q.get('h')) || defaults[1],
    frames: mode === 'stills' ? 6 : Number(q.get('frames')) || defaults[2],
    fps: Number(q.get('fps')) || 24
  };
}

async function seekVideo(video, t) {
  if (!video || !video.duration) return;
  const target = t % video.duration;
  if (Math.abs(video.currentTime - target) < 1e-3) return;
  await new Promise((resolve) => {
    video.addEventListener('seeked', resolve, { once: true });
    video.currentTime = target;
  });
}

export async function startRecorder(ctrl, opts) {
  const root = document.documentElement;
  root.classList.add('is-recording');
  const canvas = ctrl.renderer.domElement;
  canvas.style.width = `${opts.width}px`;
  canvas.style.height = `${opts.height}px`;
  ctrl.resize(opts.width, opts.height);

  // wait for all background assets (volume, textures, video)
  await Promise.race([ctrl.background, new Promise((r) => setTimeout(r, 20000))]);
  const video = ctrl.usVideo();
  if (video) video.pause();

  const volumeOnly = opts.mode === 'volume';
  if (volumeOnly) {
    // pure black background, only the CT rig (upright, fully revealed), no film effects
    ctrl.scene.children.forEach((c) => (c.visible = c === ctrl.ctRig));
    ctrl.scene.background = new THREE.Color(0x000000);
    ctrl.post.setClean(true);
  }

  async function frame(i) {
    const t = i / opts.fps;
    let progress;
    if (opts.mode === 'stills') progress = i / 5;
    else if (opts.mode === 'volume') progress = 3.2 / 5;
    else progress = i / Math.max(1, opts.frames - 1);
    await seekVideo(video, opts.mode === 'stills' ? 2.5 : t);
    const tex = ctrl.usTexture && ctrl.usTexture();
    if (tex) tex.needsUpdate = true;
    if (volumeOnly) {
      // full turn across the loop so it repeats seamlessly
      ctrl.renderAtVolume((i / opts.frames) * Math.PI * 2, t);
    } else {
      ctrl.renderAt(progress, opts.mode === 'stills' ? 4 + i * 0.37 : 3 + t);
    }
    return canvas.toDataURL('image/png');
  }

  window.__recorder = { opts, total: opts.frames, frame, ready: true };

  // Manual mode: write frames to a folder chosen by the user.
  if (!navigator.webdriver) {
    const panel = document.createElement('div');
    panel.className = 'record-panel';
    panel.innerHTML = `<p><strong>Record: ${opts.mode}</strong> · ${opts.width}×${opts.height} · ${opts.frames} frames</p>
      <button type="button">Choose folder &amp; record</button><p class="record-panel__status" aria-live="polite"></p>`;
    document.body.appendChild(panel);
    const status = panel.querySelector('.record-panel__status');
    panel.querySelector('button').addEventListener('click', async () => {
      if (!window.showDirectoryPicker) {
        status.textContent = 'This browser cannot write folders. Use Chrome/Edge, or tools/record.mjs.';
        return;
      }
      const dir = await window.showDirectoryPicker({ mode: 'readwrite' });
      for (let i = 0; i < opts.frames; i++) {
        const url = await frame(i);
        const blob = await (await fetch(url)).blob();
        const name = opts.mode === 'stills' ? `step-${i}.png` : `frame_${String(i + 1).padStart(5, '0')}.png`;
        const fh = await dir.getFileHandle(name, { create: true });
        const w = await fh.createWritable();
        await w.write(blob);
        await w.close();
        status.textContent = `${i + 1} / ${opts.frames}`;
      }
      status.textContent = 'Done. Encode with ffmpeg (see README).';
    });
  }
}
