/**
 * Home story without real-time 3D (no three.js is downloaded for these tiers).
 *
 *   low    a scroll-scrubbed HD video of the same story, pre-rendered from the high tier
 *          (assets/video/story-landscape|portrait.mp4/.webm; README → "Record the fallback video")
 *   still  reduced motion or no WebGL2: one still frame per story step, crossfaded
 *          (assets/img/stills/step-N-landscape|portrait.avif/.webp)
 */
const STEPS = 6;
const portraitQuery = window.matchMedia('(max-aspect-ratio: 9/10)');
const isIOS =
  /iPhone|iPad|iPod/.test(navigator.userAgent) ||
  (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent));

function stillPicture(i, eager) {
  const src = (o, ext) => `assets/img/stills/step-${i}-${o}.${ext}`;
  return `<picture class="scene__still${i === 0 ? ' is-active' : ''}" data-step="${i}">
    <source media="(max-aspect-ratio: 9/10)" type="image/avif" srcset="${src('portrait', 'avif')}">
    <source media="(max-aspect-ratio: 9/10)" type="image/webp" srcset="${src('portrait', 'webp')}">
    <source type="image/avif" srcset="${src('landscape', 'avif')}">
    <img src="${src('landscape', 'webp')}" alt="" width="1920" height="1080" decoding="async" loading="${eager ? 'eager' : 'lazy'}">
  </picture>`;
}

function setReport(reportEl, on) {
  if (!reportEl) return;
  reportEl.hidden = !on;
  reportEl.classList.toggle('scene-report--static', true);
  reportEl.style.opacity = on ? '1' : '0';
}

/** Reduced motion / no WebGL: still frames, the active one chosen by the step in view. */
export function initStills({ sceneEl, story, reportEl }) {
  document.documentElement.classList.add('no-3d');
  let box = sceneEl.querySelector('.scene__stills');
  if (!box) {
    box = document.createElement('div');
    box.className = 'scene__stills';
    box.innerHTML = Array.from({ length: STEPS }, (_, i) => stillPicture(i, i === 0)).join('');
    sceneEl.appendChild(box);
  }
  const stills = Array.from(box.children);
  const steps = Array.from(story.querySelectorAll('.story-step'));
  let active = 0;
  const show = (i) => {
    if (i === active) return;
    active = i;
    stills.forEach((s, n) => s.classList.toggle('is-active', n === i));
    setReport(reportEl, i === STEPS - 1);
    // warm the next frame
    const next = stills[Math.min(STEPS - 1, i + 1)].querySelector('img');
    if (next) next.loading = 'eager';
  };
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && show(steps.indexOf(e.target))),
    { rootMargin: '-45% 0px -45% 0px' }
  );
  steps.forEach((s) => io.observe(s));
  sceneEl.classList.add('is-live');
}

/** Weak phones: scrub a pre-rendered video with the scroll position. */
export function initStoryVideo({ sceneEl, story, reportEl, onFail }) {
  const { ScrollTrigger } = window;
  const video = document.createElement('video');
  video.className = 'scene__video';
  video.muted = true;
  video.playsInline = true;
  video.setAttribute('playsinline', '');
  video.setAttribute('muted', '');
  video.preload = 'auto';
  video.disablePictureInPicture = true;
  // H.264 first: hardware-decoded on phones, which keeps scrubbing smooth (and it is the smaller file)
  const ext = video.canPlayType('video/mp4; codecs="avc1.640028"') ? 'mp4' : 'webm';
  const srcFor = () => `assets/video/story-${portraitQuery.matches ? 'portrait' : 'landscape'}.${ext}`;
  video.src = srcFor();
  sceneEl.appendChild(video);
  // iOS Safari does not always start fetching on its own
  video.load();

  let target = 0, seekAt = 0, ready = false, failed = false;
  // Any of these leaves the picture frozen while the text scrolls on, so show the still frames instead.
  const fail = () => {
    if (failed) return;
    failed = true;
    clearTimeout(readyTimer);
    video.remove();
    if (onFail) onFail();
  };
  const readyTimer = setTimeout(() => !ready && fail(), 8000);
  const onData = () => {
    if (ready || failed) return;
    ready = true;
    clearTimeout(readyTimer);
    // iOS only paints seeks after the element has played once. When that is refused
    // (Low Power Mode, data saver), scrubbing would stay on the first frame.
    video.play().then(
      () => {
        video.pause();
        sceneEl.classList.add('is-live', 'has-video');
      },
      () => (isIOS ? fail() : sceneEl.classList.add('is-live', 'has-video'))
    );
  };
  video.addEventListener('loadeddata', onData);
  video.addEventListener('canplay', onData);
  video.addEventListener('error', fail);
  portraitQuery.addEventListener('change', () => {
    const tt = video.currentTime;
    video.src = srcFor();
    video.addEventListener('loadedmetadata', () => (video.currentTime = tt), { once: true });
  });

  const progress = () => {
    const r = story.getBoundingClientRect();
    const span = r.height - window.innerHeight;
    return span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0;
  };
  if (ScrollTrigger) {
    ScrollTrigger.create({ trigger: story, start: 'top top', end: 'bottom bottom', onUpdate: (self) => (target = self.progress) });
  } else {
    window.addEventListener('scroll', () => (target = progress()), { passive: true });
  }
  let shown = false;
  const tick = (now) => {
    if (failed) return;
    // one seek at a time; Safari sometimes never finishes one, so don't wait on it forever
    if (ready && video.duration && (!video.seeking || now - seekAt > 600)) {
      const t = target * (video.duration - 0.05);
      if (Math.abs(video.currentTime - t) > 1 / 48) {
        seekAt = now;
        video.currentTime = t;
      }
    }
    const last = target > (STEPS - 1.6) / (STEPS - 1);
    if (last !== shown) setReport(reportEl, (shown = last));
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
