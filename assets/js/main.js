/**
 * Aksharam Diagnostics: shared site behaviour.
 * Builds the header, footer and floating buttons from config, handles the
 * language toggle, smooth scrolling, reveal animations and page transitions,
 * and starts the 3D scene on the home page.
 */
import { config, activeServices, directionsUrl, whatsappUrl } from './config.js';
import { t, L, getLang, storedLang, setLang, applyI18n } from './i18n.js';
import { pictureHTML, creditsHTML, photos } from './media.js';

const root = document.documentElement;
export const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const isMobileDevice =
  /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
  (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent));
const page = document.body.dataset.page || '';
const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
if (hasGsap) window.gsap.registerPlugin(window.ScrollTrigger);

/* ------------------------------------------------------------------ */
/* Icons (inline SVG, line style; .ic-accent strokes use brand red)    */
/* ------------------------------------------------------------------ */
const svg = (inner) =>
  `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${inner.replace(/<(path|circle|rect)(?=\s)/g, '<$1 pathLength="1"')}</svg>`;

export const icons = {
  phone: svg('<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>'),
  mail: svg('<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/>'),
  pin: svg('<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3" class="ic-accent"/>'),
  clock: svg('<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2" class="ic-accent"/>'),
  nav: svg('<path d="M3 11 22 2l-9 19-2-8-8-2z"/>'),
  arrow: svg('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  check: svg('<path d="M20 6 9 17l-5-5"/>'),
  info: svg('<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>'),
  alert: svg('<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>'),
  menu: svg('<path d="M4 7h16M4 12h16M4 17h10"/>'),
  close: svg('<path d="M6 6l12 12M18 6 6 18"/>'),
  emergency: svg('<circle cx="12" cy="12" r="10"/><path d="M12 7v5l3 2"/><path d="M4.5 4.5 2 2M19.5 4.5 22 2" class="ic-accent"/>'),
  doctor: svg('<path d="M6 3v5a5 5 0 0 0 10 0V3"/><path d="M11 13v2a5 5 0 0 0 10 0v-2"/><circle cx="21" cy="11" r="2" class="ic-accent"/>'),
  wheelchair: svg('<circle cx="12" cy="4" r="2"/><path d="M12 7v6h5l3 5"/><path d="M9 10.5a6 6 0 1 0 7 8" class="ic-accent"/>'),
  parking: svg('<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M9.5 17V7H13a3 3 0 0 1 0 6H9.5" class="ic-accent"/>'),
  branches: svg('<path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z"/><path d="M9 10a3 3 0 0 1 6 0" class="ic-accent"/>'),
  ct: svg('<circle cx="12" cy="11" r="8"/><circle cx="12" cy="11" r="3.5"/><path d="M5.4 6.6a8 8 0 0 1 3.2-2.9" class="ic-accent"/><path d="M2 21h20M12 19v2"/>'),
  xray: svg('<rect x="3" y="2.5" width="18" height="19" rx="2.5"/><path d="M12 5.5v13" class="ic-accent"/><path d="M7.5 8.5c1.6-.9 3-.9 4.5 0 1.5-.9 2.9-.9 4.5 0M7 12c1.8-.9 3.3-.9 5 0 1.7-.9 3.2-.9 5 0M7.5 15.5c1.6-.8 3-.8 4.5 0 1.5-.8 2.9-.8 4.5 0"/>'),
  usg: svg('<path d="M3 4h6v6a3 3 0 0 1-6 0z"/><path d="M6 4V2"/><path d="M13 8.5a3.5 3.5 0 0 1 0 5" class="ic-accent"/><path d="M15.5 6a7 7 0 0 1 0 10"/><path d="M18 3.5a10.5 10.5 0 0 1 0 15"/>'),
  usg34d: svg('<path d="M12 2.5 19.5 7v9L12 20.5 4.5 16V7z"/><path d="M12 11.5 19.5 7M12 11.5 4.5 7M12 11.5v9"/><path d="M20 19.5a3 3 0 0 0 2-2.8" class="ic-accent"/>'),
  doppler: svg('<path d="M2 12h4l2.5-6 3.5 12 3-9 2 3h5" /><path d="M2 20h20" class="ic-accent"/>'),
  path: svg('<path d="M9 2.5h6M10 2.5v6.5L4.6 18.4A1.8 1.8 0 0 0 6.2 21h11.6a1.8 1.8 0 0 0 1.6-2.6L14 9V2.5"/><path d="M7 15h10" class="ic-accent"/>'),
  accuracy: svg('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4" class="ic-accent"/>'),
  compassion: svg('<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>'),
  access: svg('<path d="M3 10.5 12 3l9 7.5V20a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 20z"/><path d="M9.5 21.5V15h5v6.5" class="ic-accent"/>'),
  integrity: svg('<circle cx="12" cy="12" r="10"/><path d="m8 12 3 3 5-6" class="ic-accent"/>'),
  mission: svg('<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2" class="ic-accent"/>'),
  vision: svg('<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3" class="ic-accent"/>'),
  whatsapp:
    '<svg class="icon icon--fill" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35m-5.42 7.4h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.17-3.48-8.41z"/></svg>'
};

const serviceIcon = { ct: 'ct', xray: 'xray', usg: 'usg', usg34d: 'usg34d', doppler: 'doppler', path: 'path' };

/* ------------------------------------------------------------------ */
/* Config bindings: data-cfg="branches.0.name" → bilingual config text */
/* ------------------------------------------------------------------ */
function cfgGet(path) {
  return path.split('.').reduce((o, k) => (o == null ? o : o[k]), config);
}

export function applyCfg(scope = document) {
  scope.querySelectorAll('[data-cfg]').forEach((el) => {
    el.textContent = L(cfgGet(el.dataset.cfg));
  });
}

export function applyAll(scope = document) {
  applyI18n(scope);
  applyCfg(scope);
}

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/* ------------------------------------------------------------------ */
/* Shared layout                                                       */
/* ------------------------------------------------------------------ */
const navItems = [
  { href: 'index.html', key: 'nav.home', page: 'home' },
  { href: 'about.html', key: 'nav.about', page: 'about' },
  { href: 'services.html', key: 'nav.services', page: 'services' },
  { href: 'contact.html', key: 'nav.contact', page: 'contact' }
];

function navLinks(cls) {
  return navItems
    .map(
      (n, i) =>
        `<a class="${cls}" href="${n.href}" style="--i:${i}"${n.page === page ? ' aria-current="page"' : ''} data-i18n="${n.key}">${esc(t(n.key))}</a>`
    )
    .join('');
}

function langToggle(extraClass = '') {
  return `<button type="button" class="lang-toggle ${extraClass}" data-lang-toggle data-i18n-attr="aria-label:lang.switch" aria-label="${esc(t('lang.switch'))}">
      <span class="lang-toggle__opt" data-opt="en" lang="en">EN</span><span class="lang-toggle__opt" data-opt="gu" lang="gu">ગુજ</span>
    </button>`;
}

function branchPhones(cls) {
  return config.branches
    .map(
      (b, i) =>
        `<a class="${cls}" href="tel:${b.phone.tel}">${icons.phone}<span><span data-cfg="branches.${i}.name">${esc(L(b.name))}</span>: ${esc(b.phone.display)}</span></a>`
    )
    .join('');
}

function headerHTML() {
  return `
  <a class="skip-link" href="#main" data-i18n="skip">${esc(t('skip'))}</a>
  <div class="site-header" id="site-header">
    <div class="topbar">
      <div class="container topbar__inner">
        <p class="topbar__em"><span class="pulse-dot" aria-hidden="true"></span><span data-i18n="top.emergency">${esc(t('top.emergency'))}</span></p>
        <div class="topbar__phones">${branchPhones('topbar__phone')}</div>
      </div>
    </div>
    <header class="nav">
      <div class="container nav__inner">
        <a class="nav__logo" href="index.html" aria-label="${esc(L(config.name))}" data-cfg-label>
          <img src="assets/img/logo.png" alt="${esc(L(config.name))}" width="588" height="172" decoding="async">
        </a>
        <nav class="nav__links" data-i18n-attr="aria-label:nav.main" aria-label="${esc(t('nav.main'))}">${navLinks('nav__link')}</nav>
        <div class="nav__actions">
          ${langToggle()}
          <a class="btn btn--red btn--sm nav__book" href="contact.html#appointment" data-i18n="nav.book">${esc(t('nav.book'))}</a>
          <button type="button" class="nav__burger" aria-expanded="false" aria-controls="mobile-menu" data-i18n-attr="aria-label:nav.menu" aria-label="${esc(t('nav.menu'))}">
            <span class="nav__burger-open">${icons.menu}</span><span class="nav__burger-close">${icons.close}</span>
          </button>
        </div>
      </div>
    </header>
  </div>
  <div class="mmenu" id="mobile-menu" inert>
    <div class="mmenu__inner container">
      <nav class="mmenu__links" data-i18n-attr="aria-label:nav.main" aria-label="${esc(t('nav.main'))}">${navLinks('mmenu__link')}</nav>
      <div class="mmenu__foot" style="--i:4">
        <a class="btn btn--red btn--block" href="contact.html#appointment" data-i18n="nav.book">${esc(t('nav.book'))}</a>
        <div class="mmenu__phones">${branchPhones('mmenu__phone')}</div>
        <p class="mmenu__em"><span class="pulse-dot" aria-hidden="true"></span><span data-i18n="common.emergency24">${esc(t('common.emergency24'))}</span></p>
      </div>
    </div>
  </div>`;
}

export function noticeHTML(extraClass = '') {
  return `<aside class="notice ${extraClass}" role="note">
    ${icons.alert}
    <p><strong data-i18n="pcpndt.title">${esc(t('pcpndt.title'))}</strong> <span data-i18n="pcpndt.text">${esc(t('pcpndt.text'))}</span></p>
  </aside>`;
}

function footerHTML() {
  const branches = config.branches
    .map(
      (b, i) => `
      <div class="footer__branch">
        <h3 class="footer__h" data-cfg="branches.${i}.name">${esc(L(b.name))}</h3>
        <p data-cfg="branches.${i}.address">${esc(L(b.address))}</p>
        <p><a href="tel:${b.phone.tel}">${icons.phone}<span>${esc(b.phone.display)}</span></a></p>
        <p><a href="${directionsUrl(b)}" target="_blank" rel="noopener">${icons.nav}<span data-i18n="cta.directions">${esc(t('cta.directions'))}</span><span class="sr-only"> – <span data-cfg="branches.${i}.name"></span> <span data-i18n="common.opensNewTab"></span></span></a></p>
      </div>`
    )
    .join('');

  return `
  <footer class="footer">
    <div class="container">
      <div class="footer__grid">
        <div class="footer__brand">
          <a class="footer__logo" href="index.html"><img src="assets/img/logo.png" alt="${esc(L(config.name))}" width="588" height="172" loading="lazy" decoding="async"></a>
          <p data-i18n="footer.desc">${esc(t('footer.desc'))}</p>
          <p class="footer__em"><span class="pulse-dot" aria-hidden="true"></span><span data-i18n="common.emergency24">${esc(t('common.emergency24'))}</span></p>
        </div>
        <nav class="footer__col" aria-labelledby="footer-quick">
          <h2 class="footer__h" id="footer-quick" data-i18n="footer.quick">${esc(t('footer.quick'))}</h2>
          <ul class="footer__list">${navItems.map((n) => `<li><a href="${n.href}" data-i18n="${n.key}">${esc(t(n.key))}</a></li>`).join('')}</ul>
        </nav>
        <div class="footer__col footer__col--branches">
          <h2 class="footer__h" data-i18n="footer.branches">${esc(t('footer.branches'))}</h2>
          <div class="footer__branches">${branches}</div>
        </div>
        <div class="footer__col">
          <h2 class="footer__h" data-i18n="footer.contact">${esc(t('footer.contact'))}</h2>
          <ul class="footer__list footer__list--icons">
            <li>${icons.clock}<span><span data-i18n="common.timings">${esc(t('common.timings'))}</span>: <span data-cfg="timings.label">${esc(L(config.timings.label))}</span></span></li>
            <li>${icons.mail}<a href="mailto:${config.email}">${esc(config.email)}</a></li>
            <li>${icons.phone}<a href="tel:${config.additionalPhone.tel}">${esc(config.additionalPhone.display)}</a></li>
            ${config.facilities.wheelchair ? `<li>${icons.wheelchair}<span data-i18n="common.wheelchair">${esc(t('common.wheelchair'))}</span></li>` : ''}
            ${config.facilities.parking ? `<li>${icons.parking}<span data-i18n="common.parking">${esc(t('common.parking'))}</span></li>` : ''}
          </ul>
        </div>
      </div>
      ${noticeHTML('notice--footer')}
      <details class="footer__credits">
        <summary data-i18n="footer.credits">${esc(t('footer.credits'))}</summary>
        <p data-i18n="footer.creditsIntro">${esc(t('footer.creditsIntro'))}</p>
        <ul>${creditsHTML()}</ul>
      </details>
      <div class="footer__bottom">
        <p data-i18n="footer.disclaimer">${esc(t('footer.disclaimer'))}</p>
        <p>© <span data-year>${new Date().getFullYear()}</span> <span data-cfg="name">${esc(L(config.name))}</span>. <span data-i18n="footer.rights">${esc(t('footer.rights'))}</span></p>
      </div>
    </div>
  </footer>`;
}

function fabHTML() {
  return `
  <div class="fab" role="group" aria-label="Quick contact">
    <a class="fab__btn fab__btn--wa" href="${whatsappUrl(t('wa.hello'))}" target="_blank" rel="noopener" data-wa-hello data-i18n-attr="aria-label:fab.whatsapp" aria-label="${esc(t('fab.whatsapp'))}">${icons.whatsapp}</a>
    <a class="fab__btn fab__btn--call" href="tel:${config.emergencyPhone.tel}" data-i18n-attr="aria-label:fab.callLabel" aria-label="${esc(t('fab.callLabel'))}">${icons.phone}<span class="fab__label" data-i18n="fab.call">${esc(t('fab.call'))}</span></a>
  </div>`;
}

function mountLayout() {
  const headerSlot = document.querySelector('[data-slot="header"]');
  const footerSlot = document.querySelector('[data-slot="footer"]');
  if (headerSlot) headerSlot.outerHTML = headerHTML();
  if (footerSlot) footerSlot.outerHTML = footerHTML() + fabHTML();
}

/* ------------------------------------------------------------------ */
/* Content blocks rendered from config                                 */
/* ------------------------------------------------------------------ */
const CARD_SIZES = '(min-width: 1200px) 360px, (min-width: 1024px) 30vw, (min-width: 640px) 46vw, 92vw';

function serviceCard(s) {
  const photo = photos[`svc-${s.id}`];
  return `
  <a class="card card--link service-card${photo ? ' service-card--photo' : ''}" href="services.html#svc-${s.id}">
    ${photo ? `<div class="card__media">${pictureHTML(`svc-${s.id}`, { sizes: CARD_SIZES })}</div>` : ''}
    <span class="icon-circle">${icons[serviceIcon[s.id]]}</span>
    <h3 class="card__title" data-i18n="svc.${s.id}.name">${esc(t(`svc.${s.id}.name`))}</h3>
    <p class="card__text" data-i18n="svc.${s.id}.short">${esc(t(`svc.${s.id}.short`))}</p>
    <span class="card__more"><span data-i18n="cta.learn">${esc(t('cta.learn'))}</span>${icons.arrow}</span>
  </a>`;
}

function doctorCard(d, i, detailed) {
  return `
  <article class="card doctor-card${detailed ? ' doctor-card--detailed' : ''}">
    <div class="monogram monogram--${i % 2 ? 'grey' : 'red'}" aria-hidden="true"><span>${esc(d.initials)}</span></div>
    <div class="doctor-card__body">
      <h3 class="card__title" data-cfg="doctors.${i}.name">${esc(L(d.name))}</h3>
      <p class="doctor-card__qual" data-cfg="doctors.${i}.qualification">${esc(L(d.qualification))}</p>
      <p class="doctor-card__role" data-i18n="doctors.role">${esc(t('doctors.role'))}</p>
      ${detailed ? `<p class="card__text" data-i18n="about.doc.${d.id}.line">${esc(t(`about.doc.${d.id}.line`))}</p>` : ''}
    </div>
  </article>`;
}

function branchCard(b, i) {
  return `
  <article class="card branch-card">
    <div class="branch-card__head">
      <span class="icon-circle">${icons.pin}</span>
      <h3 class="card__title" data-cfg="branches.${i}.name">${esc(L(b.name))}</h3>
    </div>
    <dl class="info-list">
      <div><dt data-i18n="common.address">${esc(t('common.address'))}</dt><dd data-cfg="branches.${i}.address">${esc(L(b.address))}</dd></div>
      <div><dt data-i18n="common.timings">${esc(t('common.timings'))}</dt><dd><span data-cfg="timings.label">${esc(L(config.timings.label))}</span><br><span class="text-red" data-i18n="common.emergency24">${esc(t('common.emergency24'))}</span></dd></div>
      <div><dt data-i18n="common.phone">${esc(t('common.phone'))}</dt><dd><a href="tel:${b.phone.tel}">${esc(b.phone.display)}</a></dd></div>
    </dl>
    <div class="btn-row">
      <a class="btn btn--red" href="${directionsUrl(b)}" target="_blank" rel="noopener">${icons.nav}<span data-i18n="cta.directions">${esc(t('cta.directions'))}</span><span class="sr-only"> – <span data-cfg="branches.${i}.name"></span> <span data-i18n="common.opensNewTab"></span></span></a>
      <a class="btn btn--ghost" href="tel:${b.phone.tel}">${icons.phone}<span data-i18n="common.callBranch">${esc(t('common.callBranch'))}</span><span class="sr-only"> <span data-cfg="branches.${i}.name"></span></span></a>
    </div>
  </article>`;
}

function serviceDetail(s, i) {
  const sono = s.group === 'sono';
  return `
  <section class="svc-detail${i % 2 ? ' svc-detail--alt' : ''}" id="svc-${s.id}" aria-labelledby="svc-${s.id}-title">
    <div class="container svc-detail__grid">
      <div class="svc-detail__main" data-reveal>
        <span class="icon-circle icon-circle--lg">${icons[serviceIcon[s.id]]}</span>
        <h2 class="h2" id="svc-${s.id}-title" data-i18n="svc.${s.id}.name">${esc(t(`svc.${s.id}.name`))}</h2>
        <h3 class="svc-detail__h" data-i18n="services.what">${esc(t('services.what'))}</h3>
        <p data-i18n="svc.${s.id}.what">${esc(t(`svc.${s.id}.what`))}</p>
        <h3 class="svc-detail__h" data-i18n="services.uses">${esc(t('services.uses'))}</h3>
        <ul class="check-list" data-i18n-list="svc.${s.id}.uses"></ul>
        ${sono ? noticeHTML() : ''}
      </div>
      <aside class="card svc-detail__side" data-reveal>
        ${photos[`svc-${s.id}`] ? `<div class="svc-detail__media">${pictureHTML(`svc-${s.id}`, { sizes: '(min-width: 1024px) 400px, 92vw' })}</div>` : ''}
        <p class="svc-detail__label">${icons.clock}<span data-i18n="services.duration">${esc(t('services.duration'))}</span></p>
        <p class="svc-detail__duration" data-i18n="svc.${s.id}.duration">${esc(t(`svc.${s.id}.duration`))}</p>
        <a class="btn btn--red btn--block" href="contact.html?test=${s.id}#appointment"><span data-i18n="cta.bookTest">${esc(t('cta.bookTest'))}</span>${icons.arrow}</a>
        <a class="btn btn--ghost btn--block" href="tel:${config.emergencyPhone.tel}">${icons.phone}<span data-i18n="cta.call">${esc(t('cta.call'))}</span></a>
      </aside>
    </div>
  </section>`;
}

function renderBlocks() {
  const services = activeServices();
  document.querySelectorAll('[data-render]').forEach((el) => {
    switch (el.dataset.render) {
      case 'services':
        el.innerHTML = services.map(serviceCard).join('');
        break;
      case 'services-detail':
        el.innerHTML = services.map(serviceDetail).join('');
        break;
      case 'service-chips':
        el.innerHTML = services
          .map((s) => `<li><a class="chip" href="#svc-${s.id}" data-i18n="svc.${s.id}.name">${esc(t(`svc.${s.id}.name`))}</a></li>`)
          .join('');
        break;
      case 'doctors':
        el.innerHTML = config.doctors.map((d, i) => doctorCard(d, i, el.dataset.variant === 'detailed')).join('');
        break;
      case 'branches':
        el.innerHTML = config.branches.map(branchCard).join('');
        break;
      case 'notice':
        el.outerHTML = noticeHTML(el.dataset.class || '');
        break;
      case 'icon':
        el.outerHTML = icons[el.dataset.icon] || '';
        break;
      case 'photo':
        el.innerHTML = pictureHTML(el.dataset.photo, {
          sizes: el.dataset.sizes || '100vw',
          eager: el.hasAttribute('data-eager'),
          note: !el.hasAttribute('data-no-note')
        });
        break;
    }
  });
  // Pathology mentioned only when enabled
  document.querySelectorAll('[data-if="pathology"]').forEach((el) => {
    if (!config.showPathology) el.remove();
  });
}

function bindLinks() {
  document.querySelectorAll('[data-tel="emergency"]').forEach((a) => (a.href = `tel:${config.emergencyPhone.tel}`));
  updateWaLinks();
}

function updateWaLinks() {
  document.querySelectorAll('[data-wa-hello]').forEach((a) => (a.href = whatsappUrl(t('wa.hello'))));
}

/* ------------------------------------------------------------------ */
/* JSON-LD: one MedicalClinic per branch                               */
/* ------------------------------------------------------------------ */
function injectJsonLd() {
  if (!document.body.hasAttribute('data-jsonld')) return;
  const employees = config.doctors.map((d) => ({
    '@type': 'Person',
    name: d.name.en,
    jobTitle: 'Consultant Radiologist',
    hasCredential: { '@type': 'EducationalOccupationalCredential', credentialCategory: 'degree', name: d.qualification.en }
  }));
  const services = activeServices().map((s) => ({ '@type': 'MedicalTest', name: t(`svc.${s.id}.name`, 'en') }));
  const graph = config.branches.map((b) => ({
    '@type': ['MedicalClinic', 'DiagnosticLab'],
    '@id': `${config.siteUrl}/#${b.id}`,
    name: `${config.name.en} – ${b.name.en}`,
    url: `${config.siteUrl}/`,
    logo: `${config.siteUrl}/assets/img/logo.png`,
    image: `${config.siteUrl}/assets/img/og-image.png`,
    email: config.email,
    telephone: b.phone.tel,
    medicalSpecialty: 'Radiology',
    isAccessibleForFree: false,
    address: {
      '@type': 'PostalAddress',
      streetAddress: b.street,
      addressLocality: b.locality,
      addressRegion: 'Gujarat',
      postalCode: b.postalCode,
      addressCountry: 'IN'
    },
    geo: { '@type': 'GeoCoordinates', latitude: b.lat, longitude: b.lng },
    hasMap: directionsUrl(b),
    openingHoursSpecification: [
      { '@type': 'OpeningHoursSpecification', dayOfWeek: config.timings.days, opens: config.timings.opens, closes: config.timings.closes }
    ],
    amenityFeature: [
      config.facilities.wheelchair && { '@type': 'LocationFeatureSpecification', name: 'Wheelchair-accessible entrance', value: true },
      config.facilities.parking && { '@type': 'LocationFeatureSpecification', name: 'On-site parking', value: true },
      config.emergency24h && { '@type': 'LocationFeatureSpecification', name: '24-hour emergency services', value: true }
    ].filter(Boolean),
    availableService: services,
    employee: employees
  }));
  const s = document.createElement('script');
  s.type = 'application/ld+json';
  s.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
  document.head.appendChild(s);
}

/* ------------------------------------------------------------------ */
/* Language toggle                                                      */
/* ------------------------------------------------------------------ */
function syncLangToggles() {
  const lang = getLang();
  document.querySelectorAll('[data-lang-toggle]').forEach((btn) => {
    btn.querySelectorAll('.lang-toggle__opt').forEach((o) => o.classList.toggle('is-active', o.dataset.opt === lang));
  });
}

function initLang() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-lang-toggle]');
    if (!btn) return;
    setLang(getLang() === 'en' ? 'gu' : 'en');
  });
  window.addEventListener('langchange', () => {
    applyCfg();
    syncLangToggles();
    updateWaLinks();
    document.querySelectorAll('.nav__logo img, .footer__logo img').forEach((img) => (img.alt = L(config.name)));
    document.querySelectorAll('.nav__logo').forEach((a) => a.setAttribute('aria-label', L(config.name)));
    if (hasGsap) window.ScrollTrigger.refresh();
  });
  setLang(storedLang());
}

/* ------------------------------------------------------------------ */
/* Navigation: scrolled state + mobile menu                            */
/* ------------------------------------------------------------------ */
function initNav() {
  const header = document.getElementById('site-header');
  const menu = document.getElementById('mobile-menu');
  const burger = document.querySelector('.nav__burger');
  if (!header) return;

  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const setOpen = (open) => {
    menu.classList.toggle('is-open', open);
    header.classList.toggle('menu-open', open);
    root.classList.toggle('menu-locked', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('data-i18n-attr', `aria-label:${open ? 'nav.close' : 'nav.menu'}`);
    burger.setAttribute('aria-label', t(open ? 'nav.close' : 'nav.menu'));
    if (open) {
      menu.removeAttribute('inert');
      window.__lenis?.stop();
    } else {
      menu.setAttribute('inert', '');
      window.__lenis?.start();
    }
  };
  burger.addEventListener('click', () => setOpen(!menu.classList.contains('is-open')));
  menu.addEventListener('click', (e) => {
    if (e.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) {
      setOpen(false);
      burger.focus();
    }
  });
  window.matchMedia('(min-width: 1024px)').addEventListener('change', (m) => m.matches && setOpen(false));
}

/* ------------------------------------------------------------------ */
/* Smooth scrolling (Lenis) wired to GSAP ScrollTrigger                */
/* ------------------------------------------------------------------ */
function initSmoothScroll() {
  if (reduceMotion || typeof window.Lenis === 'undefined') return;
  const lenis = new window.Lenis({ lerp: 0.1, wheelMultiplier: 1 });
  window.__lenis = lenis;
  if (hasGsap) {
    lenis.on('scroll', window.ScrollTrigger.update);
    window.gsap.ticker.add((time) => lenis.raf(time * 1000));
    window.gsap.ticker.lagSmoothing(0);
  } else {
    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute('href').length < 2) return;
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target, { offset: -headerOffset() });
    history.replaceState(null, '', a.getAttribute('href'));
  });
}

// Sections such as services.html#svc-ct are rendered by JS, so the browser's own jump misses them.
function scrollToHash() {
  if (!location.hash || location.hash.length < 2) return;
  let el = null;
  try {
    el = document.querySelector(decodeURIComponent(location.hash));
  } catch (e) {
    return;
  }
  if (!el) return;
  requestAnimationFrame(() => {
    if (window.__lenis) window.__lenis.scrollTo(el, { offset: -headerOffset(), immediate: true });
    else el.scrollIntoView({ block: 'start' });
  });
}

function headerOffset() {
  const nav = document.querySelector('.nav');
  return (nav ? nav.offsetHeight : 72) + 8;
}

/* ------------------------------------------------------------------ */
/* Reveal animations                                                   */
/* ------------------------------------------------------------------ */
function initReveals() {
  // One IntersectionObserver + CSS transitions (fade, slight rise, blur → sharp, staggered).
  // Far cheaper than a ScrollTrigger per element, which matters on phones.
  if (reduceMotion || !('IntersectionObserver' in window)) return;
  const groups = [
    ...Array.from(document.querySelectorAll('[data-reveal]'), (el) => [el]),
    ...Array.from(document.querySelectorAll('[data-reveal-stagger]'), (el) => Array.from(el.children))
  ].filter((g) => g.length);
  const all = groups.flat();
  all.forEach((el) => {
    el.classList.add('reveal');
    if (el.querySelector('.icon-circle .icon')) el.classList.add('icons-pending');
  });
  groups.forEach((g) => g.forEach((el, i) => el.style.setProperty('--reveal-i', String(i))));
  root.classList.add('reveals');
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        io.unobserve(el);
        el.classList.add('is-revealed');
        const delay = Number(el.style.getPropertyValue('--reveal-i') || 0) * 80;
        setTimeout(() => el.classList.remove('icons-pending'), 120 + delay);
        // hand the element back to its own transitions (e.g. card hover lift) once it has settled
        setTimeout(() => el.classList.remove('reveal', 'is-revealed'), 1100 + delay);
      }),
    { rootMargin: '0px 0px -10% 0px' }
  );
  all.forEach((el) => io.observe(el));
}

/* ------------------------------------------------------------------ */
/* Page transitions (fade)                                             */
/* ------------------------------------------------------------------ */
function initPageTransitions() {
  window.addEventListener('pageshow', () => document.body.classList.remove('is-leaving'));
  if (reduceMotion) return;
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target && a.target !== '_self') return;
    if (a.hasAttribute('download')) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || !/\.html$|\/$/.test(url.pathname)) return;
    if (url.pathname === location.pathname && url.search === location.search) return; // same page / hash links
    e.preventDefault();
    document.body.classList.add('is-leaving');
    setTimeout(() => (location.href = url.href), 220);
  });
}

/* ------------------------------------------------------------------ */
/* Home page: loader, 3D scene and story text                          */
/* ------------------------------------------------------------------ */
function initLoader() {
  const loader = document.querySelector('.loader');
  if (!loader) return { progress() {}, done() {} };
  const bar = loader.querySelector('.loader__bar span');
  let finished = false;
  const done = () => {
    if (finished) return;
    finished = true;
    if (bar) bar.style.transform = 'scaleX(1)';
    loader.classList.add('is-done');
    setTimeout(() => loader.remove(), 700);
  };
  // Never hold the page longer than ~1.8s.
  setTimeout(done, 1800);
  return {
    progress(p) {
      if (bar && !finished) bar.style.transform = `scaleX(${Math.max(0.08, Math.min(1, p))})`;
    },
    done
  };
}

async function initHome() {
  const loader = initLoader();
  loader.progress(0.1);
  initStoryText();
  const sceneEl = document.querySelector('.scene');
  const story = document.getElementById('story');
  const reportEl = document.querySelector('.scene-report');
  const canvas = document.getElementById('scene-canvas');

  const fallback = async (tier) => {
    root.dataset.tier = tier;
    const fb = await import('./story-fallback.js');
    if (tier === 'low') fb.initStoryVideo({ sceneEl, story, reportEl, onFail: () => fallback('still') });
    else fb.initStills({ sceneEl, story, reportEl });
    if (hasGsap) {
      window.gsap.to(sceneEl, { autoAlpha: 0, ease: 'none', scrollTrigger: { trigger: story, start: 'bottom bottom', end: 'bottom 35%', scrub: true } });
      window.ScrollTrigger.refresh();
    }
  };

  let tier = 'still';
  try {
    const { detectTier } = await import('./scene/tier.js');
    tier = await detectTier({ reduceMotion });
  } catch (e) {
    tier = reduceMotion ? 'still' : 'low';
  }
  root.dataset.tier = tier;
  if (tier === 'still' || tier === 'low') {
    await fallback(tier);
    loader.done();
    return;
  }

  try {
    const [{ initScene }, rec] = await Promise.all([import('./scene.js'), import('./scene/record.js')]);
    const record = rec.recordOptions();
    loader.progress(0.25);
    const ctrl = await initScene({
      canvas,
      story,
      tier,
      reportEl,
      record,
      onProgress: (p) => loader.progress(0.25 + p * 0.75),
      onReady: () => loader.done()
    });
    if (record) {
      loader.done();
      window.__scene = ctrl; // for tools/record.mjs diagnostics
      rec.startRecorder(ctrl, record);
    }
    window.addEventListener('scene:lost', () => {
      canvas.remove();
      fallback('still');
    }, { once: true });
  } catch (err) {
    console.warn('3D scene unavailable, showing still frames.', err);
    await fallback('still');
    loader.done();
  }
}

function initStoryText() {
  if (!hasGsap || reduceMotion) return;
  const { gsap } = window;

  // Hero copy drifts up and fades as the story begins.
  const hero = document.querySelector('.story-step--hero .hero__content');
  if (hero) {
    gsap.from(hero.children, { y: 24, autoAlpha: 0, duration: 0.9, ease: 'power2.out', stagger: 0.08, delay: 0.15 });
    gsap.to(hero, {
      y: -60,
      autoAlpha: 0,
      ease: 'none',
      scrollTrigger: { trigger: '.story-step--hero', start: 'top top', end: 'bottom 30%', scrub: true }
    });
  }

  // Each story card fades in as its step arrives and out as it leaves.
  gsap.utils.toArray('.story-step:not(.story-step--hero)').forEach((step, i, all) => {
    const card = step.querySelector('.story-card');
    if (!card) return;
    const last = i === all.length - 1;
    const tl = gsap.timeline({
      scrollTrigger: { trigger: step, start: 'top bottom', end: last ? 'top top' : 'bottom top', scrub: true }
    });
    tl.fromTo(card, { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power1.out' }, 0.15);
    if (!last) {
      tl.to(card, { autoAlpha: 1, duration: 0.2 }, 0.5);
      tl.to(card, { autoAlpha: 0, y: -50, duration: 0.25, ease: 'power1.in' }, 0.72);
    } else {
      tl.to(card, { autoAlpha: 1, duration: 0.5 }, 0.5);
    }
  });
}

/* ------------------------------------------------------------------ */
/* Boot                                                                */
/* ------------------------------------------------------------------ */
mountLayout();
renderBlocks();
initLang(); // applies text for the stored language (also fills data-i18n-list)
bindLinks();
injectJsonLd();
initNav();
initSmoothScroll();
initPageTransitions();
initReveals();
scrollToHash();
if (page === 'home') initHome();
root.classList.add('is-ready');

export { config, t, L, getLang };
