/* ==========================================================================
   RAJWADI KANGAN — gallery.js
   Lightbox preview for the masonry "Explore Collection" gallery.
   Reveal-on-scroll for the individual tiles is handled by scroll.js via the
   shared [data-reveal] system; this file only owns the lightbox.
   ========================================================================== */

(function () {
  'use strict';

  const galleryRoot = document.querySelector('[data-gallery]');
  const lightbox = document.querySelector('[data-lightbox]');
  if (!galleryRoot || !lightbox) return;

  const items = Array.from(galleryRoot.querySelectorAll('img[data-full]'));
  const lightboxImg = lightbox.querySelector('[data-lightbox-img]');
  const lightboxCaption = lightbox.querySelector('[data-lightbox-caption]');
  const closeBtn = lightbox.querySelector('[data-lightbox-close]');
  const prevBtn = lightbox.querySelector('[data-lightbox-prev]');
  const nextBtn = lightbox.querySelector('[data-lightbox-next]');

  let currentIndex = 0;
  let lastFocusedEl = null;

  function openLightbox(index) {
    currentIndex = (index + items.length) % items.length;
    const item = items[currentIndex];

    lightboxImg.src = item.getAttribute('data-full');
    lightboxImg.alt = item.getAttribute('alt') || '';
    lightboxCaption.textContent = item.getAttribute('data-caption') || '';

    lastFocusedEl = document.activeElement;
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    if (window.__rkLenis) window.__rkLenis.stop();

    closeBtn.focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
    if (window.__rkLenis) window.__rkLenis.start();
    if (lastFocusedEl) lastFocusedEl.focus();
  }

  function showNext(step) {
    openLightbox(currentIndex + step);
  }

  items.forEach((img, index) => {
    const tile = img.closest('.masonry__item');
    if (!tile) return;
    tile.addEventListener('click', () => openLightbox(index));
    tile.setAttribute('tabindex', '0');
    tile.setAttribute('role', 'button');
    tile.setAttribute('aria-label', `View ${img.getAttribute('data-caption') || 'image'} larger`);
    tile.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(index);
      }
    });
  });

  closeBtn.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', () => showNext(-1));
  nextBtn.addEventListener('click', () => showNext(1));

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNext(1);
    if (e.key === 'ArrowLeft') showNext(-1);
  });
})();
