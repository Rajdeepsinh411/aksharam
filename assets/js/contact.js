/**
 * Aksharam Diagnostics: contact page.
 * Branch tabs with lazy Google Maps, and the appointment form that
 * validates input and opens WhatsApp with a ready-to-send message.
 */
import { config, activeServices, branchById, mapsEmbedUrl, directionsUrl, whatsappUrl } from './config.js';
import { t, L, getLang } from './i18n.js';
import { icons, applyAll, isMobileDevice } from './main.js';

/* ------------------------------------------------------------------ */
/* Branch tabs                                                         */
/* ------------------------------------------------------------------ */
function initBranchTabs() {
  const tablist = document.querySelector('[data-branch-tabs]');
  const panels = document.querySelector('[data-branch-panels]');
  if (!tablist || !panels) return;

  tablist.innerHTML = config.branches
    .map(
      (b, i) => `
      <button type="button" class="tab" role="tab" id="tab-${b.id}" aria-controls="panel-${b.id}" aria-selected="false" tabindex="-1">
        ${icons.pin}<span data-cfg="branches.${i}.name"></span>
      </button>`
    )
    .join('');

  panels.innerHTML = config.branches
    .map(
      (b, i) => `
      <div class="tab-panel" role="tabpanel" id="panel-${b.id}" aria-labelledby="tab-${b.id}" tabindex="0" hidden>
        <div class="map-frame">
          <iframe data-src="${mapsEmbedUrl(b)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen
            data-i18n-attr="title:contact.mapTitle" title=""></iframe>
        </div>
        <div class="card branch-detail">
          <h3 class="card__title" data-cfg="branches.${i}.name"></h3>
          <dl class="info-list">
            <div><dt>${icons.pin}<span data-i18n="common.address"></span></dt><dd data-cfg="branches.${i}.address"></dd></div>
            <div><dt>${icons.clock}<span data-i18n="common.timings"></span></dt><dd data-cfg="timings.label"></dd></div>
            <div><dt>${icons.phone}<span data-i18n="common.phone"></span></dt><dd><a href="tel:${b.phone.tel}">${b.phone.display}</a></dd></div>
            <div><dt>${icons.phone}<span data-i18n="contact.other"></span></dt><dd><a href="tel:${config.additionalPhone.tel}">${config.additionalPhone.display}</a></dd></div>
          </dl>
          <p class="emergency-note">${icons.emergency}<span data-i18n="common.emergencyNote"></span></p>
          <div class="btn-row">
            <a class="btn btn--red" href="${directionsUrl(b)}" target="_blank" rel="noopener">${icons.nav}<span data-i18n="cta.directions"></span><span class="sr-only"> – <span data-cfg="branches.${i}.name"></span> <span data-i18n="common.opensNewTab"></span></span></a>
            <a class="btn btn--ghost" href="tel:${b.phone.tel}">${icons.phone}<span data-i18n="common.callBranch"></span><span class="sr-only"> <span data-cfg="branches.${i}.name"></span></span></a>
            <a class="btn btn--wa" href="${whatsappUrl()}" target="_blank" rel="noopener" data-wa-hello>${icons.whatsapp}<span data-i18n="cta.whatsapp"></span></a>
          </div>
        </div>
      </div>`
    )
    .join('');
  applyAll(tablist);
  applyAll(panels);
  // WhatsApp greeting link uses the current language.
  panels.querySelectorAll('[data-wa-hello]').forEach((a) => (a.href = whatsappUrl(t('wa.hello'))));

  const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
  const select = (tab, focus = false) => {
    tabs.forEach((tb) => {
      const on = tb === tab;
      tb.setAttribute('aria-selected', String(on));
      tb.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(tb.getAttribute('aria-controls'));
      panel.hidden = !on;
      if (on) {
        const frame = panel.querySelector('iframe[data-src]');
        if (frame && !frame.src) frame.src = frame.dataset.src;
      }
    });
    if (focus) tab.focus();
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', (e) => {
      let next = null;
      if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === 'Home') next = tabs[0];
      if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) {
        e.preventDefault();
        select(next, true);
      }
    });
  });

  const params = new URLSearchParams(location.search);
  const wanted = params.get('branch');
  select(tabs.find((tb) => tb.id === `tab-${wanted}`) || tabs[0]);
}

/* ------------------------------------------------------------------ */
/* Appointment form                                                    */
/* ------------------------------------------------------------------ */
const MOBILE_RE = /^(?:\+?91|0)?([6-9]\d{9})$/;

function todayISO() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatDate(iso) {
  if (!iso) return '-';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function initForm() {
  const form = document.getElementById('appointment-form');
  if (!form) return;
  const submit = form.querySelector('[type="submit"]');
  const success = document.getElementById('form-success');
  const againLink = document.getElementById('form-again');

  // Options from config
  const branchSel = form.elements.branch;
  branchSel.insertAdjacentHTML(
    'beforeend',
    config.branches.map((b, i) => `<option value="${b.id}" data-cfg="branches.${i}.name"></option>`).join('')
  );
  const testSel = form.elements.test;
  testSel.insertAdjacentHTML(
    'beforeend',
    activeServices().map((s) => `<option value="${s.id}" data-i18n="svc.${s.id}.name"></option>`).join('') +
      '<option value="other" data-i18n="form.notSure"></option>'
  );
  applyAll(form);

  form.elements.date.min = todayISO();

  // Pre-fill from URL (?test=ct&branch=bopal)
  const params = new URLSearchParams(location.search);
  const pTest = params.get('test');
  if (pTest && testSel.querySelector(`option[value="${CSS.escape(pTest)}"]`)) testSel.value = pTest;
  const pBranch = params.get('branch');
  if (pBranch && branchById(pBranch)) branchSel.value = pBranch;

  const rules = {
    name: (v) => (v.trim().length >= 2 ? '' : 'err.name'),
    mobile: (v) => (MOBILE_RE.test(v.replace(/[\s-]/g, '')) ? '' : 'err.mobile'),
    age: (v) => {
      if (!v.trim()) return '';
      const n = Number(v);
      return Number.isInteger(n) && n >= 0 && n <= 120 ? '' : 'err.age';
    },
    branch: (v) => (v ? '' : 'err.branch'),
    test: (v) => (v ? '' : 'err.test'),
    date: (v) => (v && v >= todayISO() ? '' : 'err.date'),
    slot: (v) => (v ? '' : 'err.slot')
  };
  const touched = new Set();

  const fieldValue = (name) => form.elements[name].value; // RadioNodeList also exposes .value

  function showError(name, key) {
    const err = document.getElementById(`err-${name}`);
    const el = form.elements[name];
    const targets = el instanceof RadioNodeList ? Array.from(el) : [el];
    targets.forEach((x) => x.setAttribute('aria-invalid', key ? 'true' : 'false'));
    const wrap = (targets[0].closest('.field') || targets[0].parentElement);
    wrap.classList.toggle('is-invalid', !!key);
    if (!err) return;
    if (key) {
      const span = document.createElement('span');
      span.dataset.i18n = key;
      span.textContent = t(key);
      err.innerHTML = icons.info;
      err.appendChild(span);
      err.hidden = false;
    } else {
      err.hidden = true;
      err.textContent = '';
    }
  }

  // The button stays focusable (aria-disabled) so pressing it can still reveal what is missing.
  function validate(show = true) {
    let ok = true;
    for (const [name, rule] of Object.entries(rules)) {
      const key = rule(fieldValue(name));
      if (key) ok = false;
      if (show && touched.has(name)) showError(name, key);
    }
    submit.setAttribute('aria-disabled', String(!ok));
    submit.classList.toggle('is-disabled', !ok);
    return ok;
  }

  form.addEventListener('input', (e) => {
    const name = e.target.name;
    if (!name) return;
    if (e.target.type === 'radio' || e.target.tagName === 'SELECT' || e.target.type === 'date') touched.add(name);
    if (touched.has(name)) validate();
    else validate(false);
    success.hidden = true;
  });
  form.addEventListener('change', (e) => {
    if (e.target.name) touched.add(e.target.name);
    validate();
  });
  form.addEventListener(
    'blur',
    (e) => {
      if (e.target.name && rules[e.target.name] && e.target.type !== 'radio') {
        touched.add(e.target.name);
        validate();
      }
    },
    true
  );

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    Object.keys(rules).forEach((n) => touched.add(n));
    if (!validate()) {
      const firstBad = form.querySelector('[aria-invalid="true"]');
      firstBad?.focus();
      return;
    }
    const url = whatsappUrl(buildMessage(form));
    againLink.href = url;
    success.hidden = false;
    if (isMobileDevice) {
      location.href = url;
    } else {
      window.open(url, '_blank', 'noopener');
    }
    success.focus();
  });

  window.addEventListener('langchange', () => {
    applyAll(form);
    // Refresh visible error messages and the "open again" link in the new language.
    form.querySelectorAll('.field-error span[data-i18n]').forEach((s) => (s.textContent = t(s.dataset.i18n)));
    if (!success.hidden) againLink.href = whatsappUrl(buildMessage(form));
  });

  validate(false);
}

function buildMessage(form) {
  const v = (n) => (form.elements[n].value || '').trim();
  const lang = getLang();
  const branch = branchById(v('branch'));
  const test = v('test') === 'other' ? t('form.notSure') : t(`svc.${v('test')}.name`);
  const digits = v('mobile').replace(/[\s-]/g, '').match(MOBILE_RE);
  const mobile = digits ? `+91 ${digits[1]}` : v('mobile');
  const slot = v('slot') ? t(`slot.${v('slot')}`) : '-';
  const lines = [
    `*${t('wa.title')}*`,
    `${t('wa.patient')}: ${v('name')}`,
    `${t('wa.mobile')}: ${mobile}`,
    `${t('wa.age')}: ${v('age') || '-'}`,
    `${t('wa.branch')}: ${branch ? L(branch.name, lang) : '-'}`,
    `${t('wa.test')}: ${test}`,
    `${t('wa.preferred')}: ${formatDate(v('date'))}, ${slot}`,
    `${t('wa.referred')}: ${v('referrer') || '-'}`,
    `${t('wa.message')}: ${v('message') || '-'}`
  ];
  return lines.join('\n');
}

initBranchTabs();
initForm();
