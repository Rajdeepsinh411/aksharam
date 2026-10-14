# Credits and licences

Every third-party asset used by the website, with its source, author and licence.
Items marked **CC BY** or **CC BY-SA** need attribution. That attribution is shown in the
website footer under **Image and media credits** (generated from `assets/js/media.js`).
If you replace an asset, update this file and the matching entry in `media.js`.

## Medical imaging

| Asset | Files | Source | Author | Licence | Changes made |
|---|---|---|---|---|---|
| CT volume (torso, contrast-enhanced, no pathology) | `assets/data/ct-volume-hi.bin.gz`, `ct-volume-lo.bin.gz`, `ct-volume.json` | TotalSegmentator dataset, small subset v2.0.1, case `s1233`. [doi:10.5281/zenodo.10047263](https://doi.org/10.5281/zenodo.10047263) | J. Wasserthal et al., University Hospital Basel | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | Scanner table removed (body mask), cropped to the body, resampled to 110×96×199 and 55×48×100, Hounsfield units mapped to 8-bit |
| CT slice images (12 axial slices) | `assets/data/ct-slices.webp` | same case | same | CC BY 4.0 | Soft-tissue window (W400 L40), letterboxed to 256 px tiles |
| CT reading-room screens | `assets/data/ct-monitor-left.webp`, `ct-monitor-right.webp` | same case | same | CC BY 4.0 | Axial, lung-window, coronal, sagittal and coronal MIP views laid out as a PACS screen. Arms clipped by the scan field of view are cropped out of the coronal views |
| Abdominal ultrasound loop (left kidney) | `assets/video/us-abdomen.webm`, `.mp4`, `us-abdomen-poster.jpg` | [Wikimedia Commons: Human Kidney Ultrasound Scan.webm](https://commons.wikimedia.org/wiki/File:Human_Kidney_Ultrasound_Scan.webm) | Ahmed (AhmedAlElg) | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | Cropped to the scan sector, on-screen labels and the scanner model name masked, crossfaded into a seamless loop, re-encoded at 640×480 |
| Colour Doppler image (right common carotid artery, normal) | `assets/video/us-doppler.webp` | [Wikimedia Commons: Right common carotid artery without and with doppler flow.jpg](https://commons.wikimedia.org/wiki/File:Right_common_carotid_artery_without_and_with_doppler_flow.jpg) | Cerevisae | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | Cropped to the colour-flow pane (annotation and scanner name removed). In the 3D scene a gentle pulsing of the colour flow is added in the shader. This adapted image is shared under the same CC BY-SA 4.0 licence |

No foetal or obstetric images are used anywhere (PC&PNDT).

## Lighting

| Asset | Files | Source | Licence |
|---|---|---|---|
| Hospital Room HDRI (1k and 2k) | `assets/hdri/hospital_room_1k.hdr`, `hospital_room_2k.hdr` | [Poly Haven: Hospital Room](https://polyhaven.com/a/hospital_room) by Oliksiy Yakovlyev | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) |

## Photography (representative stock images)

All photos are graded consistently (white balance to a slightly cool neutral, gentle contrast,
−10 % saturation, light clarity), cropped and exported as AVIF + WebP at 640/1280/1920 px.
They are labelled **Representative image** on the site, because they show equipment and rooms
that are not Aksharam Diagnostics' own (some show manufacturer names). Replace them with
photos of the clinic when you can (README → "Use your own clinic photos").

| Slot (`assets/img/photos/…`) | Shows | Source | Photographer | Licence |
|---|---|---|---|---|
| `svc-ct` | CT scanner, front view | [Pexels 13176357](https://www.pexels.com/photo/13176357/) | Pexels user “contact me +923323219715” | [Pexels License](https://www.pexels.com/license/) |
| `hero-services` | CT scan room | [Pexels 13176452](https://www.pexels.com/photo/13176452/) | same | Pexels License |
| `fac-ct-room` | CT scan room, 3/4 view | [Pexels 13176356](https://www.pexels.com/photo/13176356/) | same | Pexels License |
| `svc-xray` | Digital X-ray room | [Pexels 38901350](https://www.pexels.com/photo/38901350/) | Maxx Sas | Pexels License |
| `svc-usg` | Ultrasound machine | [Pexels 7108402](https://www.pexels.com/photo/7108402/) | Pavel Danilyuk | Pexels License |
| `svc-usg34d` | Ultrasound control panel | [Pexels 7088496](https://www.pexels.com/photo/7088496/) | MART PRODUCTION | Pexels License |
| `fac-ultrasound` | Ultrasound probes | [Pexels 7089288](https://www.pexels.com/photo/7089288/) | MART PRODUCTION | Pexels License |
| `hero-about` | Clinic waiting area | [Pexels 8459996](https://www.pexels.com/photo/8459996/) | Los Muertos Crew | Pexels License |
| `hero-contact` | Waiting area with windows | [Pexels 14535006](https://www.pexels.com/photo/14535006/) | Sururi Ballıdağ | Pexels License |
| `fac-waiting` | Waiting-area seating | [Pexels 9259472](https://www.pexels.com/photo/9259472/) | Jan van der Wolf | Pexels License |
| `texture-paper` | Paper texture (doctor cards) | [Pexels 20899958](https://www.pexels.com/photo/20899958/) | Артем Дворецкий | Pexels License |
| `svc-doppler` | Colour Doppler on an ultrasound monitor | [Wikimedia Commons: CarotidDoppler1.jpg](https://commons.wikimedia.org/wiki/File:CarotidDoppler1.jpg) | Etan J. Tal | [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/) |

Photos were checked by eye for the correct machine type (CT, not MRI) and for visible branding of
other clinics (excluded).

## 3D models

No third-party 3D models are included yet. The scanner, couch, patient, room, ultrasound station
and reporting desk are generated in code (`assets/js/scene/`). `ASSETS.md` lists the models to
add; record each one here when you do.

## Libraries (loaded from CDNs)

| Library | Version | Licence |
|---|---|---|
| three.js | 0.169.0 | MIT |
| postprocessing (pmndrs) | 6.36.4 | Zlib |
| n8ao | 1.9.4 | ISC |
| detect-gpu (pmndrs) | 5.0.70 | MIT |
| GSAP + ScrollTrigger | 3.12.5 | GreenSock standard licence |
| Lenis | 1.1.13 | MIT |
