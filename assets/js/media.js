/**
 * Aksharam Diagnostics: photography slots and media credits.
 *
 * To use your own clinic photos, export each one with the same file names into
 * assets/img/photos/ (<slot>-640 / -1280 / -1920 .avif + .webp, see README) and set
 * `stock: false` for that slot. That removes its "Representative image" label and,
 * once no stock photo is left, its credit line.
 */
import { t } from './i18n.js';

export const PHOTO_DIR = 'assets/img/photos/';

/** w/h = pixel size of the largest file; alt = i18n key; credit = id in `credits` */
export const photos = {
  'svc-ct': { w: 1920, h: 1440, widths: [640, 1280, 1920], alt: 'img.svc.ct', stock: true, credit: 'p13176357' },
  'svc-xray': { w: 1920, h: 1440, widths: [640, 1280, 1920], alt: 'img.svc.xray', stock: true, credit: 'p38901350' },
  'svc-usg': { w: 1920, h: 1440, widths: [640, 1280, 1920], alt: 'img.svc.usg', stock: true, credit: 'p7108402' },
  'svc-usg34d': { w: 1920, h: 1440, widths: [640, 1280, 1920], alt: 'img.svc.usg34d', stock: true, credit: 'p7088496' },
  'svc-doppler': { w: 1280, h: 960, widths: [640, 1280], alt: 'img.svc.doppler', stock: true, credit: 'c-carotid-photo' },
  'hero-about': { w: 1920, h: 1080, widths: [640, 1280, 1920], alt: 'img.hero.about', stock: true, credit: 'p8459996', focus: '50% 60%' },
  'hero-services': { w: 1920, h: 1080, widths: [640, 1280, 1920], alt: 'img.hero.services', stock: true, credit: 'p13176452', focus: '45% 55%' },
  'hero-contact': { w: 1920, h: 1080, widths: [640, 1280, 1920], alt: 'img.hero.contact', stock: true, credit: 'p14535006', focus: '40% 55%' },
  'fac-ct-room': { w: 1920, h: 1440, widths: [640, 1280, 1920], alt: 'img.fac.ct', stock: true, credit: 'p13176356' },
  'fac-ultrasound': { w: 1920, h: 1440, widths: [640, 1280, 1920], alt: 'img.fac.usg', stock: true, credit: 'p7089288' },
  'fac-waiting': { w: 1920, h: 1440, widths: [640, 1280, 1920], alt: 'img.fac.waiting', stock: true, credit: 'p9259472' }
};

const pexels = (id, by, profile) => ({ what: `Photo ${id}`, by, url: `https://www.pexels.com/photo/${id}/`, profile, licence: 'Pexels License', licenceUrl: 'https://www.pexels.com/license/' });

/** Everything shown in the footer "Image and media credits" (full list in CREDITS.md). */
export const credits = {
  p13176357: pexels(13176357, 'Pexels user contact-me-923323219715'),
  p13176452: pexels(13176452, 'Pexels user contact-me-923323219715'),
  p13176356: pexels(13176356, 'Pexels user contact-me-923323219715'),
  p38901350: pexels(38901350, 'Maxx Sas'),
  p7108402: pexels(7108402, 'Pavel Danilyuk'),
  p7088496: pexels(7088496, 'MART PRODUCTION'),
  p7089288: pexels(7089288, 'MART PRODUCTION'),
  p8459996: pexels(8459996, 'Los Muertos Crew'),
  p14535006: pexels(14535006, 'Sururi Ballıdağ'),
  p9259472: pexels(9259472, 'Jan van der Wolf'),
  p20899958: pexels(20899958, 'Артем Дворецкий'),
  'c-carotid-photo': {
    what: 'CarotidDoppler1.jpg (cropped, colour-graded)',
    by: 'Etan J. Tal',
    url: 'https://commons.wikimedia.org/wiki/File:CarotidDoppler1.jpg',
    licence: 'CC BY 3.0',
    licenceUrl: 'https://creativecommons.org/licenses/by/3.0/'
  },
  'c-ct-data': {
    what: 'CT volume, slices and monitor images: TotalSegmentator dataset, case s1233 (resampled, windowed)',
    by: 'Wasserthal et al., University Hospital Basel',
    url: 'https://doi.org/10.5281/zenodo.10047263',
    licence: 'CC BY 4.0',
    licenceUrl: 'https://creativecommons.org/licenses/by/4.0/'
  },
  'c-kidney': {
    what: 'Human Kidney Ultrasound Scan.webm (cropped, looped, labels masked)',
    by: 'Ahmed (AhmedAlElg)',
    url: 'https://commons.wikimedia.org/wiki/File:Human_Kidney_Ultrasound_Scan.webm',
    licence: 'CC BY 4.0',
    licenceUrl: 'https://creativecommons.org/licenses/by/4.0/'
  },
  'c-doppler': {
    what: 'Right common carotid artery without and with doppler flow.jpg (cropped; pulsing motion added)',
    by: 'Cerevisae',
    url: 'https://commons.wikimedia.org/wiki/File:Right_common_carotid_artery_without_and_with_doppler_flow.jpg',
    licence: 'CC BY-SA 4.0',
    licenceUrl: 'https://creativecommons.org/licenses/by-sa/4.0/'
  },
  'c-hdri': {
    what: 'Hospital Room HDRI (scene lighting)',
    by: 'Poly Haven',
    url: 'https://polyhaven.com/a/hospital_room',
    licence: 'CC0',
    licenceUrl: 'https://creativecommons.org/publicdomain/zero/1.0/'
  }
};

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/**
 * <picture> with AVIF + WebP sources, srcset 640/1280/1920, explicit size (no layout shift).
 * opts: sizes, className, eager, note (show the "Representative image" label)
 */
export function pictureHTML(slot, { sizes = '100vw', className = '', eager = false, note = true } = {}) {
  const p = photos[slot];
  if (!p) return '';
  const set = (ext) => p.widths.map((w) => `${PHOTO_DIR}${slot}-${w}.${ext} ${Math.min(w, p.w)}w`).join(', ');
  const fallbackW = p.widths.includes(1280) ? 1280 : p.widths[p.widths.length - 1];
  const style = p.focus ? ` style="object-position:${p.focus}"` : '';
  return `<picture class="photo ${className}">
      <source type="image/avif" srcset="${set('avif')}" sizes="${sizes}">
      <source type="image/webp" srcset="${set('webp')}" sizes="${sizes}">
      <img src="${PHOTO_DIR}${slot}-${fallbackW}.webp" width="${p.w}" height="${p.h}" alt="${esc(t(p.alt))}" data-i18n-attr="alt:${p.alt}" loading="${eager ? 'eager' : 'lazy'}" decoding="async"${eager ? ' fetchpriority="high"' : ''}${style}>
    </picture>${p.stock && note ? `<span class="photo__note" data-i18n="photo.representative">${esc(t('photo.representative'))}</span>` : ''}`;
}

/** Footer credit lines for whatever is still stock / third-party. */
export function creditsHTML() {
  const used = new Set(Object.values(photos).filter((p) => p.stock).map((p) => p.credit));
  used.add('p20899958');
  ['c-ct-data', 'c-kidney', 'c-doppler', 'c-hdri'].forEach((k) => used.add(k));
  return [...used]
    .map((k) => credits[k])
    .filter(Boolean)
    .map(
      (c) =>
        `<li><a href="${c.url}" target="_blank" rel="noopener">${esc(c.what)}</a> · ${esc(c.by)} · <a href="${c.licenceUrl}" target="_blank" rel="noopener">${esc(c.licence)}</a></li>`
    )
    .join('');
}
