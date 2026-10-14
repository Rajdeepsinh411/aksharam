#!/usr/bin/env node
/**
 * Headless recorder for the home-page story (optional dev tool; the website itself has no build step).
 * Drives index.html?record=… in Chrome/Edge and writes PNG frames.
 *
 *   cd tools && npm install puppeteer-core@23
 *   node record.mjs --mode story  --w 1280 --h 720  --frames 240 --out ../frames/story-landscape
 *   node record.mjs --mode story  --w 720  --h 1280 --frames 240 --out ../frames/story-portrait
 *   node record.mjs --mode stills --w 1920 --h 1080 --out ../frames/stills-landscape
 *   node record.mjs --mode stills --w 1080 --h 1920 --out ../frames/stills-portrait
 *   node record.mjs --mode volume --w 720  --h 720  --frames 144 --out ../frames/volume
 *
 * Options: --url http://localhost:8000/  (a local server for the site root)
 *          --chrome "C:/Program Files/Google/Chrome/Application/chrome.exe"
 * Then encode with ffmpeg (README.md → "Record the fallback video").
 */
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith('--') ? [...acc, [a.slice(2), all[i + 1]]] : acc), [])
);
const mode = args.mode || 'story';
const w = Number(args.w || 1280), h = Number(args.h || 720);
const frames = Number(args.frames || (mode === 'stills' ? 6 : mode === 'volume' ? 144 : 240));
const fps = Number(args.fps || 24);
const out = path.resolve(args.out || `frames/${mode}`);
const url = (args.url || 'http://localhost:8000/').replace(/\/?$/, '/');
const chrome =
  args.chrome ||
  [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome'
  ].find((p) => fs.existsSync(p));

fs.mkdirSync(out, { recursive: true });
const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: 'new',
  args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required', `--window-size=${w},${h}`]
});
const page = await browser.newPage();
await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
page.on('console', (m) => ['error', 'warning'].includes(m.type()) && console.log(`[page ${m.type()}]`, m.text()));
page.on('pageerror', (e) => console.log('[page error]', e.message));
await page.goto(`${url}index.html?record=${mode}&w=${w}&h=${h}&frames=${frames}&fps=${fps}`, { waitUntil: 'load', timeout: 120000 });
await page.waitForFunction(() => window.__recorder && window.__recorder.ready, { timeout: 180000, polling: 250 });

const t0 = Date.now();
for (let i = 0; i < frames; i++) {
  const dataUrl = await page.evaluate((n) => window.__recorder.frame(n), i);
  const name = mode === 'stills' ? `step-${i}.png` : `frame_${String(i + 1).padStart(5, '0')}.png`;
  fs.writeFileSync(path.join(out, name), Buffer.from(dataUrl.split(',')[1], 'base64'));
  if (i % 10 === 0 || i === frames - 1) process.stdout.write(`\r${i + 1}/${frames} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
}
console.log(`\nSaved to ${out}`);
await browser.close();
