# Assets: what is in the repository, what to add, and how to optimise it

The site already ships everything it needs to run: real CT data, real ultrasound and Doppler
images, a real HDRI, colour-graded photography, pre-rendered stills and fallback videos.

The **3D models are the one gap.** Good CC0 / CC-BY models of a CT gantry, a patient, an ultrasound
cart and a reading desk are on Sketchfab and similar sites, but they need a logged-in download, so
they could not be fetched automatically. Until you add them, the scene uses procedural models built
in code (`assets/js/scene/scanner.js`, `patient.js`, `room.js`, `stations.js`). These have bevelled
geometry, clearcoat materials, generated roughness and normal detail, and a sculpted patient with a
draped sheet.

Budget: **≤ 12 MB** total initial download on desktop, **≤ 5 MB** on mobile (see the table at the end).

---

## 1. 3D models to add (`assets/models/`)

How to switch one on:

1. Optimise the file (section 4) and save it under the exact name below.
2. In `assets/js/scene/assets.js` → `MODELS`, set `enabled: true` for that entry.
3. Reload. The procedural version is replaced. If the file fails to load, the procedural one stays
   and a warning appears in the console.

Shared rules for every model:

- glTF binary (`.glb`), **metres**, +Y up, origin on the floor.
- Meshopt or Draco geometry compression, KTX2 (Basis UASTC/ETC1S) textures.
- PBR metallic-roughness materials. White plastics should be **glossy and clearcoated** (use
  `KHR_materials_clearcoat`). Avoid baked lighting: the scene lights everything with the HDRI
  and area lights.
- Licence must be **CC0 or CC-BY** (or bought with a commercial licence). Record each model in
  `CREDITS.md`, and add CC-BY attribution to `credits` in `assets/js/media.js` (shown in the footer).

| File | What to look for | Where to search (exact terms) | Poly budget | Textures |
|---|---|---|---|---|
| `ct-scanner.glb` | A **CT** gantry (thin ring, wide short bore, ≈ 2.0 m wide, 0.8 m deep, 0.7–0.8 m aperture) **with patient couch**. Not an MRI (long tube). | Sketchfab, filter *Downloadable* + licence *CC0 / CC Attribution*: “CT scanner”, “computed tomography”, “CT gantry”, “Siemens Somatom” (style reference only), “medical scanner low poly PBR” | desktop ≤ 150k tris, mobile LOD ≤ 50k | 2k desktop / 1k mobile; base colour, ORM, normal |
| `patient.glb` | Adult lying **supine** in a hospital gown, arms by the sides or hands on the abdomen, a light sheet over the legs. Modest; face neutral or turned slightly away. No nudity. | Sketchfab: “hospital patient lying”, “patient in bed gown”, “lying man rigged”, plus “CC0 human” from Quaternius/Poly Pizza (stylised; check it suits). A posed MakeHuman export (CC0) with a cloth sheet in Blender works well. | ≤ 60k tris | 2k / 1k |
| `radiology-room.glb` | Clean scan-room shell: wall panels, ceiling grid with light-panel cut-outs, skirting, a control-room window frame. Lights are added in code, so leave them out of the file. | Sketchfab: “hospital room interior”, “clinic interior modular”, “radiology room”; Poly Haven models for props | ≤ 80k tris | 2k / 1k, tiling where possible |
| `ultrasound-station.glb` | Cart-based ultrasound with probe, cable, console, monitor on an articulating arm. | Sketchfab: “ultrasound machine”, “sonography machine”, “ultrasound scanner cart” | ≤ 60k tris | 2k / 1k |
| `reporting-desk.glb` | Desk with **two** monitors, keyboard, mouse, chair. | Sketchfab: “office desk dual monitor”, “radiology workstation”; Poly Haven: desk, chair props | ≤ 40k tris | 1k |

### Required node names and placement

The code drives a few parts by name, so name these nodes exactly:

| File | Node | Purpose |
|---|---|---|
| `ct-scanner.glb` | `Couch_Top` | The moving table-top. Its local origin is the centre of the pad surface, and it slides along **+Z / −Z** (toward the gantry is −Z). The patient is parented to it. |
| | `LED_Strip` | Thin accent strip on the gantry face. Emissive brand red, intensity animated. |
| | `RotorWindow` *(optional)* | Smoked ring inside the bore. Its material is replaced to show the rotation blur. |
| | placement | Isocentre (bore centre) at **x = 0, y = 1.05, z = 0**, bore axis along Z, couch extending toward +Z |
| `patient.glb` | (root) | Origin at the centre of the pad surface, head toward **−Z**, ≈ 1.7 m long, gown + sheet included |
| `ultrasound-station.glb` | `US_Screen` | Monitor screen mesh with UVs 0–1 (16:10). Receives the B-mode / Doppler shader. |
| | placement | Cart at x ≈ 5.75, z ≈ −0.85 (see `US_POS` in `stations.js`), or keep the origin at the cart base and move it in code |
| `reporting-desk.glb` | `Desk_Screen_L`, `Desk_Screen_R` | Monitor screens (UVs 0–1, 16:10). Receive the CT reading-room images. |
| | placement | Desk centre at x = 10.4, z = −3.0 (`DESK_POS`) |

---

## 2. Media already in the repository

| Path | Content | Size |
|---|---|---|
| `assets/hdri/hospital_room_1k.hdr` | Poly Haven *Hospital Room*, CC0. Medium tier + mobile | 1.3 MB |
| `assets/hdri/hospital_room_2k.hdr` | Same, 2k. High tier only | 5.3 MB |
| `assets/data/ct-volume-hi.bin.gz` / `-lo.bin.gz` + `ct-volume.json` | CT torso volume, 110×96×199 (high) / 55×48×100 (medium), 8-bit, gzip | 1.3 MB / 0.17 MB |
| `assets/data/ct-slices.webp` | 12 axial CT slices (4×3 atlas, 256 px tiles) | 160 KB |
| `assets/data/ct-monitor-left.webp`, `ct-monitor-right.webp` | Reading-room screens built from the same CT | 90 KB each |
| `assets/video/us-abdomen.webm` / `.mp4` + poster | Real kidney ultrasound, 640×480, seamless 6 s loop | 0.4–0.45 MB |
| `assets/video/us-doppler.webp` | Real colour Doppler (common carotid artery) | 25 KB |
| `assets/video/story-landscape.*`, `story-portrait.*` | Low-tier scroll video (pre-rendered from the high tier) | see README |
| `assets/video/ct-volume-loop.*` | Rotating volume loop (fallback if the volume cannot load) | ≈ 0.5 MB |
| `assets/img/stills/step-0…5-landscape|portrait.avif/.webp` | Reduced-motion / no-WebGL still frames, also the hero poster | ≈ 60–150 KB each |
| `assets/img/photos/*` | Graded photography, AVIF + WebP at 640 / 1280 / 1920 | 3.4 MB for all sizes, ≈ 0.3–0.6 MB per page as served |

The CT data came out of the TotalSegmentator dataset (CC BY 4.0) with the scripts described in
README → "Rebuild the CT data". To use another openly licensed CT (for example a chest CT from
The Cancer Imaging Archive, CC BY), produce the same three files with the same `ct-volume.json` keys.

---

## 3. Photography slots (`assets/img/photos/`)

Each slot is `<slot>-640`, `-1280` and `-1920` in `.avif` **and** `.webp`.

| Slot | Used on | Aspect | Replace with (your clinic) |
|---|---|---|---|
| `svc-ct` | Home + Services: CT card | 4:3 | Your CT scanner, front three-quarter view, couch out, room lights on |
| `svc-xray` | Home + Services: X-ray card, About grid | 4:3 | Your digital X-ray room |
| `svc-usg` | Home + Services: Sonography | 4:3 | Your ultrasound machine (screen off or showing a non-obstetric image) |
| `svc-usg34d` | Home + Services: 3D/4D | 4:3 | Console close-up. **Never a foetal image** (PC&PNDT). |
| `svc-doppler` | Home + Services: Doppler | 4:3 | Monitor showing a colour Doppler of a vessel |
| `hero-about` | About page header | 16:9 | Reception / waiting area |
| `hero-services` | Services page header | 16:9 | CT room, wide |
| `hero-contact` | Contact page header | 16:9 | Entrance or waiting area |
| `fac-ct-room`, `fac-ultrasound`, `fac-waiting` | About: facilities grid | 4:3 | CT room, probes / equipment detail, seating |
| `texture-paper` | Doctor cards background | 1:1, 640 only | Any subtle off-white paper texture |

After swapping, set `stock: false` for that slot in `assets/js/media.js`. That removes its
"Representative image" label and its credit line.

---

## 4. Optimisation commands

### 3D models (gltf-transform)

```bash
npm install --global @gltf-transform/cli
# Desktop: Meshopt geometry + KTX2 textures (UASTC for normal maps, ETC1S for colour)
gltf-transform optimize in.glb ct-scanner.glb --compress meshopt --texture-compress ktx2 --texture-size 2048
# Mobile LOD (optional second file, e.g. ct-scanner.mobile.glb)
gltf-transform optimize in.glb ct-scanner.mobile.glb --compress meshopt --texture-compress ktx2 --texture-size 1024 --simplify --simplify-ratio 0.35
# Draco instead of Meshopt
gltf-transform draco in.glb out.glb
# Check the result
gltf-transform inspect ct-scanner.glb
```

KTX2 needs the `toktx` tool (KTX-Software) on your PATH. The loaders in `assets/js/scene/assets.js`
already handle Meshopt, Draco and KTX2 (decoders load from the three.js CDN only when a model is
enabled).

### Video (ffmpeg)

```bash
# In-scene screen loop (B-mode): crop to the scan sector, 640×480, no audio
ffmpeg -i source.webm -vf "crop=1080:810:540:170,scale=640:480:flags=lanczos,format=yuv420p" -an -c:v libvpx-vp9 -crf 36 -b:v 0 -row-mt 1 us-abdomen.webm
ffmpeg -i source.webm -vf "crop=1080:810:540:170,scale=640:480:flags=lanczos,format=yuv420p" -an -c:v libx264 -crf 25 -preset slow -pix_fmt yuv420p -movflags +faststart us-abdomen.mp4
```

The scroll-scrubbed story video is in README → "Record the fallback video".

### Photos (sharp or Squoosh)

```bash
npm install --global sharp-cli
for w in 640 1280 1920; do
  sharp -i photo.jpg -o svc-ct-$w.avif resize $w -- avif --quality 52 --effort 6
  sharp -i photo.jpg -o svc-ct-$w.webp resize $w -- webp --quality 78
done
```

In [Squoosh](https://squoosh.app): resize to the width, then AVIF quality ≈ 52 (effort 6) and
WebP quality ≈ 78. Crop to the slot's aspect ratio first (4:3 cards, 16:9 page headers).

### Grading guide (to match the existing photos)

Clean whites, neutral greys, slightly cool (≈ 6000 K), contrast +5 %, saturation −10 %,
light clarity / sharpening, no vignette, no heavy HDR look.

---

## 5. Download budget (initial load, home page)

| | Desktop (high) | Phone (medium) | Phone (low) |
|---|---|---|---|
| three.js + addons + postprocessing + n8ao (CDN, gzip) | ≈ 0.9 MB | ≈ 0.9 MB | — |
| HDRI | 5.3 MB | 1.3 MB | — |
| CT volume + slices + monitors | 1.6 MB | 0.5 MB | — |
| Ultrasound video + Doppler | 0.45 MB | 0.45 MB | — |
| Story video | — | — | ≈ 2–3 MB (portrait) |
| Hero still (poster) | ≈ 0.1 MB | ≈ 0.1 MB | ≈ 0.1 MB |
| **Total (excluding fonts, page JS/CSS)** | **≈ 8.4 MB** | **≈ 3.3 MB** | **≈ 3 MB** |

Each optional GLB adds to this, so keep models within the table in section 1.
