/* ==========================================================================
   RAJWADI KANGAN — script.js
   Main orchestrator: cinematic loader, footer year, card-tilt micro-
   interaction (shared by product cards / gallery tiles / contact cards),
   and the small WhatsApp helper actions (product enquiry, "download all
   photos"). Everything here is vanilla JS and degrades gracefully if a
   vendor library failed to load.
   ========================================================================== */

(function () {
  'use strict';

  const WHATSAPP_NUMBER = '918828888129';

  /* ---------- Cinematic loader ---------- */
  const loader = document.querySelector('[data-loader]');
  function hideLoader() {
    if (!loader) return;
    loader.classList.add('is-hidden');
    window.setTimeout(() => loader.remove(), 1000);
  }
  if (document.readyState === 'complete') {
    window.setTimeout(hideLoader, 300);
  } else {
    window.addEventListener('load', () => window.setTimeout(hideLoader, 300));
    // safety net in case fonts/assets stall — never trap the visitor behind the loader
    window.setTimeout(hideLoader, 3500);
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Card tilt (product cards, gallery tiles, contact cards) ---------- */
  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!isCoarsePointer && !prefersReducedMotion) {
    const tiltEls = document.querySelectorAll('[data-tilt]');
    const TILT_MAX = 8; // degrees

    tiltEls.forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;  // 0..1
        const py = (e.clientY - rect.top) / rect.height;  // 0..1
        const rotY = (px - 0.5) * TILT_MAX * 2;
        const rotX = (0.5 - py) * TILT_MAX * 2;
        el.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(0)`;
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0)';
      });
    });
  }

  /* ---------- Product "Enquire" buttons → WhatsApp ---------- */
  document.querySelectorAll('[data-inquire]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const product = btn.getAttribute('data-inquire') || 'your collection';
      const message = `Hello Rajwadi Kangan, I'm interested in the ${product}. Could you share more details?`;
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank', 'noopener');
    });
  });

  /* ---------- "Download All Photos" → WhatsApp request ---------- */
  const photosBtn = document.querySelector('[data-photos-request]');
  if (photosBtn) {
    photosBtn.addEventListener('click', () => {
      const message = 'Hello Rajwadi Kangan, could you please send me the full photo pack of your collection?';
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank', 'noopener');
    });
  }
})();
