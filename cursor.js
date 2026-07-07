/* ==========================================================================
   RAJWADI KANGAN — cursor.js
   NOTE: the custom cursor (dot + trailing ring) was removed per client
   feedback — it read as distracting on desktop. This file now only owns
   the two micro-interactions that don't depend on a custom cursor:
     1) magnetic buttons — any element with class ".magnetic" pulls
        slightly toward the pointer when it's nearby
     2) click ripple — a soft expanding ripple on click, layered on the
        same ".magnetic" elements
   Both are automatically skipped on touch/coarse-pointer devices.
   ========================================================================== */

(function () {
  'use strict';

  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
  if (isCoarsePointer) return; // touch devices get plain, unmodified buttons

  const magnets = document.querySelectorAll('.magnetic');
  const MAGNET_STRENGTH = 0.35;

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
})();
