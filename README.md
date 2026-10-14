# Aksharam Diagnostics website

A static, bilingual (English / ગુજરાતી) website for Aksharam Diagnostics, Viramgam and South Bopal.
It is plain HTML, CSS and JavaScript with no build step. Three.js, postprocessing, N8AO, detect-gpu,
GSAP and Lenis load from public CDNs (versions pinned in the import map in `index.html`).

```
index.html          Home (3D scroll story: how a scan happens)
about.html          About us, radiologists, mission / values, facilities (photo grid)
services.html       Services + patient preparation guide
contact.html        Branches (tabs + Google Maps), appointment form → WhatsApp
assets/css/style.css
assets/js/config.js   ← business details: phones, addresses, timings, coordinates, WhatsApp, toggles
assets/js/i18n.js     ← all English and Gujarati text
assets/js/media.js    ← photo slots ("Representative image" labels) and media credits
assets/js/main.js     shared header/footer, language toggle, smooth scroll, animations, home tiers
assets/js/scene.js    entry for the 3D story → assets/js/scene/
    scene/tier.js       picks high / medium / low / still before any 3D code loads
    scene/index.js      renderer, story wiring, adaptive quality, disposal
    scene/assets.js     asset manifest (optional .glb models), loaders, video
    scene/post.js       N8AO, depth of field, bloom, Neutral tone mapping, SMAA, grain, vignette
    scene/volume.js     real CT slices + ray-marched volume render
    scene/timeline.js   scroll timeline and camera rig
    scene/scanner.js, patient.js, room.js, stations.js   procedural models (until .glb files are added)
    scene/materials.js, textures.js, reflect.js          PBR materials, surface detail, floor reflections
    scene/record.js     ?record= mode for the fallback video and stills
assets/js/story-fallback.js  low tier (scroll-scrubbed video) and still tier (crossfaded frames)
assets/js/contact.js  branch tabs, form validation, WhatsApp message
assets/hdri/          lighting environment (Poly Haven, CC0)
assets/data/          CT volume, slices and reading-room images (TotalSegmentator, CC BY 4.0)
assets/video/         ultrasound loop, Doppler image, fallback story videos, volume loop
assets/img/photos/    photography (AVIF + WebP, 640/1280/1920)
assets/img/stills/    one still frame per story step (landscape + portrait)
assets/models/        optional .glb models (see ASSETS.md)
assets/img/logo.png   logo (transparent background)
assets/img/favicon.png, apple-touch-icon.png, og-image.png
tools/record.mjs      optional helper that records the story frames headlessly
ASSETS.md             what to add, where to find it, how to optimise it
CREDITS.md            every third-party asset with its licence
```

## Preview locally

ES modules do not run from `file://`, so use any small local server from this folder, for example:

```
npx serve .
# or
python -m http.server 8000
```

Then open http://localhost:3000 (or :8000).

Prefer `npx serve .`: it supports HTTP range requests, which the low-tier story video needs to
scrub with the scroll. (`python -m http.server` does not, so on that server the low-tier video
stays on its first frame; GitHub Pages, Netlify and normal web hosts are fine.)

## Replace the logo

The current `assets/img/logo.png` was cut out of a poster screenshot. The background was made transparent, and the small parts hidden by a "3 of 14" overlay (the top of "મ્" and the edge of ®) were filled in.
**When you have the original logo file, replace it.**

1. Save the original as `assets/img/logo.png`, ideally a transparent PNG about 600px wide or larger.
2. If its proportions differ from 588 × 172, update the `width`/`height` attributes on the `<img>` tags in the HTML files and in `assets/js/main.js` (search for `logo.png`).
3. Regenerate `favicon.png` (192 × 192, the red/grey icon mark only), `apple-touch-icon.png` (180 × 180 on white) and `og-image.png` (1200 × 630, logo on white).

## Edit business details (`assets/js/config.js`)

| What | Where in `config` |
|---|---|
| WhatsApp number (form + buttons) | `whatsappNumber`: digits only with country code, e.g. `'919909300966'` |
| Red floating "Call" button | `emergencyPhone` |
| Extra phone line | `additionalPhone` |
| Branch phone / address / name | `branches[n].phone`, `.address` (`en` + `gu`), `.name` |
| Map pin + Get Directions | `branches[n].lat`, `branches[n].lng` |
| Opening hours | `timings.opens`, `timings.closes` (24h, for Google) and `timings.label` (what visitors see) |
| Pathology laboratory | `showPathology: true` shows it on every page and in the form |
| Hide a service | set `enabled: false` in `services` |
| Doctors | `doctors` (name, qualification, initials for the monogram) |

`tel:` links use the `tel` value, e.g. `'+919909300966'`, and the text people see uses `display`.

### Get exact coordinates from Google Maps

The coordinates in `config.js` are placeholders (Viramgam `23.1200, 72.0400`; South Bopal `23.0130, 72.4690`). **Replace them before going live:**

1. Open Google Maps on a computer and find the clinic's entrance.
2. Right-click the exact spot (or the pin).
3. Click the first line in the menu, the numbers such as `23.12345, 72.04567`. They are copied.
4. Paste them into `lat` and `lng` for that branch.

The embedded map, the "Get Directions" buttons and the search-engine data all update automatically.

## Edit text (`assets/js/i18n.js`)

All wording is in two dictionaries, `en` and `gu`, with the same keys. Edit the text between quotes.
- Lists (service uses, preparation steps) are written as one string separated by `|`.
- A key missing in `gu` falls back to English.
- Page titles are the `meta.*.title` keys. The English `<title>` and `<meta name="description">` in each HTML file are what Google reads; keep them in sync.
- The PC&PNDT notice is at the top of the file (`PCPNDT_EN`, `PCPNDT_GU`). It is legally required, so do not remove it.

The visitor's language choice is remembered in their browser.

## Compliance notes

- No foetal or obstetric images are used anywhere: the ultrasound bay shows a kidney scan and a carotid Doppler.
- Stock photos are labelled "Representative image" because they do not show the clinic's own rooms or equipment.

- The PC&PNDT notice appears in the footer of every page and in every section that mentions sonography: home story step 4, home services, the sonography / 3D-4D / Doppler sections, About facilities, and the Contact form.
- The site makes no statistics, ratings, awards or medical claims. Please keep it that way when you edit the text.

## Deploy

### Netlify
1. Go to https://app.netlify.com → **Add new site → Deploy manually** and drag this folder in, or connect a Git repository with no build command and publish directory `/`.
2. Open **Domain management → Add a domain** and enter `aksharamdiagnostics.store`, then follow the DNS instructions (Netlify DNS, or an `A`/`CNAME` record at your registrar). HTTPS is automatic.

### GitHub Pages (current live setup)
The site is hosted on GitHub Pages from the `main` branch of
<https://github.com/Rajdeepsinh411/aksharam>, at **https://aksharamdiagnostics.store**.

To update the live site, commit your changes and run `git push`. GitHub republishes within a minute or two.

The `CNAME` file holds the custom domain, so don't delete it. The empty `.nojekyll` file tells GitHub to serve the files as-is.

If the domain ever changes, find-and-replace `https://aksharamdiagnostics.store` across the four `.html` files, set `siteUrl` in `assets/js/config.js`, and update `CNAME`.

DNS records at the domain registrar:

| Type  | Host / Name | Value                       |
|-------|-------------|-----------------------------|
| A     | `@`         | `185.199.108.153`           |
| A     | `@`         | `185.199.109.153`           |
| A     | `@`         | `185.199.110.153`           |
| A     | `@`         | `185.199.111.153`           |
| CNAME | `www`       | `rajdeepsinh411.github.io`  |

Tick **Enforce HTTPS** in **Settings → Pages** once the certificate is issued.

### Shared hosting (cPanel etc.)
Upload all files and folders into `public_html/`.

## Quality tiers (home page)

Before any 3D code downloads, `assets/js/scene/tier.js` checks the device (detect-gpu benchmark,
mobile or desktop, memory, cores, Save-Data) and picks one experience:

| Tier | Who gets it | What they see |
|---|---|---|
| **high** | Desktops with a strong GPU | Full real-time scene: 2k HDRI, N8AO ambient occlusion, depth of field with rack focus, bloom, soft floor reflections, SMAA, film grain, 128³ CT volume, 2048 px shadows |
| **medium** | Laptops, good phones | Full scene: 1k HDRI, half-resolution AO, no depth of field, bloom, 64³ volume, 1024 px shadows |
| **low** | Weak phones, Save-Data | No real-time 3D: a pre-rendered HD video of the same story, scrubbed by the scroll position |
| **still** | *Reduce motion* turned on, or no WebGL2 | One still frame per story step, crossfaded as the steps change |

- Force a tier for testing: `index.html?tier=high` (or `medium`, `low`, `still`).
- While running, the scene measures its frame rate and steps quality down by itself if a device
  can't keep up (depth of field, then AO quality and chromatic aberration, then resolution, then bloom).
- The hero still (`assets/img/stills/step-0-*`) shows straight away on every tier, so the page is
  readable and looks right within a second or two, even while 3D assets load. The progress shown
  in the loading bar is real (three.js `LoadingManager`).
- All shaders are compiled up front, in parallel where the browser supports it, so nothing
  compiles mid-scroll. Rendering pauses when the story is off screen or the tab is hidden, and
  everything is disposed of when the page is left.
- `index.html?tier=medium&perf` stores start-up timings in `window.__initTimes` (check them in the console).

## Use your own clinic photos

Every photo slot is a set of files in `assets/img/photos/` named `<slot>-640`, `<slot>-1280` and
`<slot>-1920`, each as `.avif` and `.webp`. The slots are listed in `ASSETS.md` §3.

1. Take the photo in landscape, with the room lights on and the equipment clean. Avoid people's
   faces unless you have their consent, and never show a foetal image.
2. Crop to the slot's shape: **4:3** for service cards and the About grid, **16:9** for page headers.
3. Export the three widths in both formats with the same file names (commands in `ASSETS.md` §4,
   or use [Squoosh](https://squoosh.app): AVIF quality ≈ 52, WebP quality ≈ 78).
4. Replace the files in `assets/img/photos/`.
5. In `assets/js/media.js`, set `stock: false` for that slot. Its "Representative image" label
   and credit line go away. If the new photo has a different shape, also update `w` and `h`.

## Record the fallback video (low tier) and the still frames

The low tier and the reduced-motion stills are rendered from the high-tier scene itself.

**In the browser (Chrome or Edge):** run a local server (see above), then open one of these:

```
http://localhost:8000/index.html?record=story&w=1280&h=720&frames=240&fps=24
http://localhost:8000/index.html?record=story&w=720&h=1280&frames=240&fps=24
http://localhost:8000/index.html?record=stills&w=1920&h=1080
http://localhost:8000/index.html?record=stills&w=1080&h=1920
http://localhost:8000/index.html?record=volume&w=720&h=720&frames=144
```

Make the browser window at least as large as `w`×`h` (or use the device toolbar). Press
**Choose folder & record** and pick an empty folder. The story is stepped frame by frame
(deterministically) and saved as `frame_00001.png`, `frame_00002.png`, … (or `step-0.png` …
`step-5.png` for stills).

**Headless (optional):** `cd tools && npm install puppeteer-core@23`, then for example
`node record.mjs --mode story --w 1280 --h 720 --frames 240 --out ../frames/story-landscape --url http://localhost:8000/`.

**Encode with ffmpeg.** A short keyframe interval (`-g 6`) lets the scroll scrub smoothly:

```bash
# Story videos (do landscape and portrait) → assets/video/story-landscape.mp4 / .webm
ffmpeg -framerate 24 -i frames/story-landscape/frame_%05d.png -c:v libx264 -preset slow -crf 24 -g 6 -pix_fmt yuv420p -movflags +faststart -an assets/video/story-landscape.mp4
ffmpeg -framerate 24 -i frames/story-landscape/frame_%05d.png -c:v libvpx-vp9 -crf 36 -b:v 0 -g 6 -row-mt 1 -an assets/video/story-landscape.webm

# Volume loop (black background, blended additively in the scene)
ffmpeg -framerate 24 -i frames/volume/frame_%05d.png -c:v libx264 -preset slow -crf 23 -pix_fmt yuv420p -movflags +faststart -an assets/video/ct-volume-loop.mp4
ffmpeg -framerate 24 -i frames/volume/frame_%05d.png -c:v libvpx-vp9 -crf 34 -b:v 0 -row-mt 1 -an assets/video/ct-volume-loop.webm

# Stills (repeat for portrait, steps 0–5)
for i in 0 1 2 3 4 5; do
  ffmpeg -i frames/stills-landscape/step-$i.png -c:v libaom-av1 -still-picture 1 -crf 32 assets/img/stills/step-$i-landscape.avif
  ffmpeg -i frames/stills-landscape/step-$i.png -c:v libwebp -quality 80 assets/img/stills/step-$i-landscape.webp
done
```

Re-record whenever the scene changes (for example after adding the .glb models).

## Rebuild the CT data

The CT files in `assets/data/` were made from case `s1233` of the TotalSegmentator dataset
(CC BY 4.0, doi:10.5281/zenodo.10047263). The scanner table was removed with a body mask,
the volume was cropped to the body, resampled (110×96×199 and 55×48×100) and stored as 8-bit,
with the Hounsfield mapping recorded in `ct-volume.json` (`huMap`). The slice atlas uses a
soft-tissue window (W400 L40). To use a different openly licensed CT, produce files with the
same names and the same JSON keys (`sizeMm`, `huMap`, `hi`, `lo`, `slices`), and credit it in
`CREDITS.md` and `assets/js/media.js`.

## Behaviour notes

- **3D scene:** runs only on the home page, and only while the story is on screen and the tab is visible. With *reduce motion* turned on, or without WebGL2, still frames of the same story are shown instead and all text stays readable.
- **Appointment form:** builds the message and opens `https://wa.me/<number>?text=…`. Phones open the WhatsApp app; computers open WhatsApp Web in a new tab. Nothing is stored on a server. The visitor still has to press **Send** in WhatsApp.
- **Pre-filled form:** `contact.html?test=ct&branch=bopal#appointment` pre-selects the test and branch. The "Book this test" buttons on the Services page use this. Test ids: `ct`, `xray`, `usg`, `usg34d`, `doppler`, `path`.
