/* ==========================================================================
   RAJWADI KANGAN — form.js
   "Join Our Network" reseller form.

   Flow (as specified):
     User fills form → clicks "Join"
       → POST JSON to a Google Apps Script Web App
           → Apps Script appends a row to a Google Sheet
       → redirect the visitor to WhatsApp with a pre-filled message

   The Google Sheet write and the WhatsApp redirect are intentionally
   independent: if the Apps Script call fails or is blocked (e.g. the
   endpoint hasn't been redeployed yet), the visitor still reaches
   WhatsApp — we never want a backend hiccup to lose an enquiry.
   ========================================================================== */

(function () {
  'use strict';

  const form = document.getElementById('reseller-form');
  if (!form) return;

  /* ---------- Configuration ---------- */
  // Replace with your own /exec URL if you redeploy the Apps Script.
  const GAS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzUxLRfL5FN06u3Iq3vUNREYm0m0bfOayK9NnxnkY9B-wC45C-9PcP2u-ULSZRVjmiWJw/exec';
  const WHATSAPP_NUMBER = '918828888129';

  const statusEl = form.querySelector('[data-form-status]');

  const rules = {
    fullName: { required: true, label: 'Full name' },
    brandName: { required: false, label: 'Brand name' },
    storeName: { required: false, label: 'Store name' },
    whatsapp: {
      required: true,
      label: 'WhatsApp number',
      pattern: /^[+]?[\d\s-]{10,15}$/,
      patternMessage: 'Enter a valid phone number (10–15 digits)',
    },
    website: { required: false, label: 'Website' },
    socialMedia: { required: false, label: 'Social media' },
  };

  function fieldWrap(input) {
    return input.closest('.field');
  }

  function showError(name, message) {
    const input = form.elements[name];
    const wrap = fieldWrap(input);
    const errorEl = form.querySelector(`[data-error-for="${name}"]`);
    if (wrap) wrap.classList.toggle('has-error', Boolean(message));
    if (errorEl) errorEl.textContent = message || '';
  }

  function validateField(name) {
    const input = form.elements[name];
    const rule = rules[name];
    if (!input || !rule) return true;

    const value = input.value.trim();

    if (rule.required && !value) {
      showError(name, `${rule.label} is required`);
      return false;
    }
    if (value && rule.pattern && !rule.pattern.test(value)) {
      showError(name, rule.patternMessage || `${rule.label} looks incorrect`);
      return false;
    }

    showError(name, '');
    return true;
  }

  // live validation as the visitor moves through the form
  Object.keys(rules).forEach((name) => {
    const input = form.elements[name];
    if (!input) return;
    input.addEventListener('blur', () => validateField(name));
    input.addEventListener('input', () => {
      if (fieldWrap(input) && fieldWrap(input).classList.contains('has-error')) {
        validateField(name);
      }
    });
  });

  function buildWhatsAppMessage(data) {
    const lines = [
      'Hello Rajwadi Kangan, I would like to join your reseller network.',
      '',
      `*Name:* ${data.fullName}`,
      `*WhatsApp:* ${data.whatsapp}`,
    ];
    if (data.brandName) lines.push(`*Brand:* ${data.brandName}`);
    if (data.storeName) lines.push(`*Store:* ${data.storeName}`);
    if (data.website) lines.push(`*Website:* ${data.website}`);
    if (data.socialMedia) lines.push(`*Social Media:* ${data.socialMedia}`);
    return lines.join('\n');
  }

  /* Fire-and-forget POST to Google Apps Script.
     `no-cors` + text/plain avoids a CORS preflight (Apps Script Web Apps
     don't handle OPTIONS by default) — Apps Script still reads the raw
     body via e.postData.contents and JSON.parse()s it correctly. The
     response is opaque in no-cors mode, so we can't inspect success/failure
     here; that's fine, this call is supplementary to the WhatsApp redirect. */
  function saveToGoogleSheet(data) {
    if (!GAS_ENDPOINT) return Promise.resolve();
    return fetch(GAS_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(data),
    }).catch((err) => {
      console.warn('Rajwadi Kangan: could not reach the Google Sheet endpoint.', err);
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // honeypot — if this hidden field has a value, silently drop the submission
    const honeypot = form.elements['companyWebsite'];
    if (honeypot && honeypot.value) {
      statusEl.textContent = '';
      return;
    }

    const fieldNames = Object.keys(rules);
    const validity = fieldNames.map(validateField);
    const isValid = validity.every(Boolean);

    if (!isValid) {
      statusEl.textContent = 'Please fix the highlighted fields.';
      statusEl.className = 'reseller-form__status is-error';
      const firstInvalid = fieldNames.find((name, i) => !validity[i]);
      if (firstInvalid) form.elements[firstInvalid].focus();
      return;
    }

    const data = {
      fullName: form.elements['fullName'].value.trim(),
      brandName: form.elements['brandName'].value.trim(),
      storeName: form.elements['storeName'].value.trim(),
      whatsapp: form.elements['whatsapp'].value.trim(),
      website: form.elements['website'].value.trim(),
      socialMedia: form.elements['socialMedia'].value.trim(),
    };

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.setAttribute('disabled', 'true');

    statusEl.textContent = 'Saving your details…';
    statusEl.className = 'reseller-form__status';

    saveToGoogleSheet(data).finally(() => {
      statusEl.textContent = 'Thank you! Opening WhatsApp to confirm your details…';
      statusEl.className = 'reseller-form__status is-success';

      const message = buildWhatsAppMessage(data);
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank', 'noopener');

      form.reset();
      if (submitBtn) submitBtn.removeAttribute('disabled');
    });
  });
})();
