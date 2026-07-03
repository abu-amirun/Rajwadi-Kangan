/* ==========================================================================
   RAJWADI KANGAN — cursor.js
   Custom cursor (dot + trailing glow ring), hover-state scaling on all
   interactive elements, and the "magnetic button" micro-interaction.
   Automatically disables itself on touch/coarse-pointer devices.
   ========================================================================== */

(function () {
  'use strict';

  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
  if (isCoarsePointer) return; // respect touch devices — no custom cursor

  const dot = document.querySelector('[data-cursor-dot]');
  const ring = document.querySelector('[data-cursor-ring]');
  if (!dot || !ring) return;

  const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const dotPos = { x: pos.x, y: pos.y };
  const ringPos = { x: pos.x, y: pos.y };

  window.addEventListener('pointermove', (e) => {
    pos.x = e.clientX;
    pos.y = e.clientY;
  }, { passive: true });

  function lerp(a, b, n) { return a + (b - a) * n; }

  function raf() {
    // dot tracks instantly-ish, ring trails a little for a "luxury glow" feel
    dotPos.x = lerp(dotPos.x, pos.x, 0.35);
    dotPos.y = lerp(dotPos.y, pos.y, 0.35);
    ringPos.x = lerp(ringPos.x, pos.x, 0.14);
    ringPos.y = lerp(ringPos.y, pos.y, 0.14);

    dot.style.transform = `translate(${dotPos.x}px, ${dotPos.y}px) translate(-50%,-50%)`;
    ring.style.transform = `translate(${ringPos.x}px, ${ringPos.y}px) translate(-50%,-50%)`;

    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  /* ---------- Hover state on interactive elements ---------- */
  const hoverables = document.querySelectorAll('a, button, input, textarea, [data-tilt]');
  hoverables.forEach((el) => {
    el.addEventListener('mouseenter', () => ring.classList.add('is-hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('is-hover'));
  });

  /* ---------- Magnetic buttons ---------- */
  const magnets = document.querySelectorAll('.magnetic');
  const MAGNET_STRENGTH = 0.35;
  const MAGNET_RADIUS = 70;

  magnets.forEach((magnet) => {
    magnet.addEventListener('mousemove', (e) => {
      const rect = magnet.getBoundingClientRect();
      const relX = e.clientX - (rect.left + rect.width / 2);
      const relY = e.clientY - (rect.top + rect.height / 2);
      const dist = Math.sqrt(relX * relX + relY * relY);

      if (dist < rect.width) {
        magnet.style.transform = `translate(${relX * MAGNET_STRENGTH}px, ${relY * MAGNET_STRENGTH}px)`;
      }
    });

    magnet.addEventListener('mouseleave', () => {
      magnet.style.transform = 'translate(0,0)';
    });

    // ripple effect on click, layered on top of the magnetic movement
    magnet.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height) * 1.4;
      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      this.appendChild(ripple);
      window.setTimeout(() => ripple.remove(), 700);
    });
  });

  void MAGNET_RADIUS; // reserved for future radius-based easing tweaks
})();
