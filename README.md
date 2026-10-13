# Aksharam Diagnostics website

A static, bilingual (English / ગુજરાતી) website for Aksharam Diagnostics, Viramgam and South Bopal.
It is plain HTML, CSS and JavaScript with no build step. Three.js, GSAP and Lenis load from public CDNs.

```
index.html          Home (3D scroll story: how a scan happens)
about.html          About us, radiologists, mission / values, facilities
services.html       Services + patient preparation guide
contact.html        Branches (tabs + Google Maps), appointment form → WhatsApp
assets/css/style.css
assets/js/config.js   ← business details: phones, addresses, timings, coordinates, WhatsApp, toggles
assets/js/i18n.js     ← all English and Gujarati text
assets/js/main.js     shared header/footer, language toggle, smooth scroll, animations
assets/js/scene.js    Three.js scanner scene (home page only)
assets/js/contact.js  branch tabs, form validation, WhatsApp message
assets/img/logo.png   logo (transparent background)
assets/img/favicon.png, apple-touch-icon.png, og-image.png
```

## Preview locally

ES modules do not run from `file://`, so use any small local server from this folder, for example:

```
npx serve .
# or
python -m http.server 8000
```

Then open http://localhost:3000 (or :8000).

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

- The PC&PNDT notice appears in the footer of every page and in every section that mentions sonography: home story step 4, home services, the sonography / 3D-4D / Doppler sections, About facilities, and the Contact form.
- The site makes no statistics, ratings, awards or medical claims. Please keep it that way when you edit the text.

## Deploy

### Netlify
1. Go to https://app.netlify.com → **Add new site → Deploy manually** and drag this folder in, or connect a Git repository with no build command and publish directory `/`.
2. Open **Domain management → Add a domain** and enter `aksharamdiagnostics.com`, then follow the DNS instructions (Netlify DNS, or an `A`/`CNAME` record at your registrar). HTTPS is automatic.

### GitHub Pages
1. Push this folder to a GitHub repository, with `index.html` at the root.
2. Go to **Settings → Pages → Build and deployment**, choose *Deploy from a branch*, then `main` / `/ (root)`.
3. Under **Custom domain**, enter `www.aksharamdiagnostics.com`. This creates a `CNAME` file.
4. At your domain registrar:
   - `CNAME` record: `www` → `<your-github-username>.github.io`
   - `A` records for the bare domain `@`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
5. Tick **Enforce HTTPS** once the certificate is issued.

### Shared hosting (cPanel etc.)
Upload all files and folders into `public_html/`.

## Behaviour notes

- **3D scene:** runs only on the home page, and only while the story is on screen and the tab is visible. With *reduce motion* turned on, or without WebGL, a static SVG scanner illustration is shown and all text stays readable.
- **Appointment form:** builds the message and opens `https://wa.me/<number>?text=…`. Phones open the WhatsApp app; computers open WhatsApp Web in a new tab. Nothing is stored on a server. The visitor still has to press **Send** in WhatsApp.
- **Pre-filled form:** `contact.html?test=ct&branch=bopal#appointment` pre-selects the test and branch. The "Book this test" buttons on the Services page use this. Test ids: `ct`, `xray`, `usg`, `usg34d`, `doppler`, `path`.
