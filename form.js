/* ==========================================================================
   RAJWADI KANGAN — form.js
   "Join Our Network" reseller form: inline validation + honeypot spam trap.
   The site has no backend, so on success we hand the visitor's details to
   WhatsApp as a pre-filled message to +91 88288 88129 — the same number
   already used throughout the site — which the team can simply reply to.
   ========================================================================== */

(function () {
  'use strict';

  const form = document.getElementById('reseller-form');
  if (!form) return;

  const WHATSAPP_NUMBER = '918828888129';
  const statusEl = form.querySelector('[data-form-status]');

  const rules = {
    fullName: { required: true, label: 'Full name' },
    storeName: { required: true, label: 'Store / brand name' },
    whatsappNumber: {
      required: true,
      label: 'WhatsApp number',
      pattern: /^[+]?[\d\s-]{10,15}$/,
      patternMessage: 'Enter a valid phone number (10–15 digits)',
    },
    socialLink: { required: false, label: 'Social media / website' },
    businessDescription: { required: true, label: 'Business description', minLength: 10 },
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
    if (value && rule.minLength && value.length < rule.minLength) {
      showError(name, `Tell us a little more (min ${rule.minLength} characters)`);
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
      `*Store / Brand:* ${data.storeName}`,
      `*WhatsApp:* ${data.whatsappNumber}`,
    ];
    if (data.socialLink) lines.push(`*Social / Website:* ${data.socialLink}`);
    lines.push('', `*About the business:*`, data.businessDescription);
    return lines.join('\n');
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
      storeName: form.elements['storeName'].value.trim(),
      whatsappNumber: form.elements['whatsappNumber'].value.trim(),
      socialLink: form.elements['socialLink'].value.trim(),
      businessDescription: form.elements['businessDescription'].value.trim(),
    };

    const message = buildWhatsAppMessage(data);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    statusEl.textContent = 'Thank you! Opening WhatsApp to send your details…';
    statusEl.className = 'reseller-form__status is-success';

    window.open(url, '_blank', 'noopener');
    form.reset();
  });
})();
