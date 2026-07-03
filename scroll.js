/* ==========================================================================
   RAJWADI KANGAN — scroll.js
   - Lenis smooth scrolling wired into the GSAP ticker
   - GSAP ScrollTrigger fade-up reveals for [data-reveal] elements
   - Parallax for [data-parallax] elements and the liquid blobs
   - Nav shrink-on-scroll + mobile menu toggle
   - Scroll progress bar + "rk:scroll" event broadcast for particles.js
   ========================================================================== */

(function () {
  'use strict';

  const hasGSAP = typeof gsap !== 'undefined';
  const hasScrollTrigger = hasGSAP && typeof ScrollTrigger !== 'undefined';
  const hasLenis = typeof Lenis !== 'undefined';
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (hasGSAP && hasScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ---------- Lenis smooth scroll ---------- */
  let lenis = null;
  if (hasLenis && !prefersReducedMotion) {
    lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.1,
    });

    if (hasGSAP) {
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      requestAnimationFrame(function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      });
    }

    lenis.on('scroll', hasScrollTrigger ? ScrollTrigger.update : undefined);
  }

  /* expose so script.js can smooth-scroll to anchors on demand */
  window.__rkLenis = lenis;

  /* ---------- Scroll progress bar + rk:scroll broadcast ---------- */
  const progressBar = document.querySelector('[data-scroll-progress]');

  function updateProgress() {
    const doc = document.documentElement;
    const scrollTop = window.scrollY || doc.scrollTop;
    const height = doc.scrollHeight - doc.clientHeight;
    const progress = height > 0 ? Math.min(1, Math.max(0, scrollTop / height)) : 0;

    if (progressBar) progressBar.style.width = `${progress * 100}%`;

    window.dispatchEvent(new CustomEvent('rk:scroll', { detail: { progress, scrollTop } }));
  }

  if (lenis) {
    lenis.on('scroll', updateProgress);
  } else {
    window.addEventListener('scroll', updateProgress, { passive: true });
  }
  updateProgress();

  /* ---------- Nav: shrink on scroll + mobile toggle ---------- */
  const nav = document.querySelector('[data-nav]');
  const navToggle = document.querySelector('[data-nav-toggle]');
  const navLinks = document.querySelector('[data-nav-links]');
  const iconMenu = document.querySelector('[data-icon-menu]');
  const iconClose = document.querySelector('[data-icon-close]');

  function handleNavScroll() {
    if (!nav) return;
    if (window.scrollY > 40) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');
  }
  window.addEventListener('scroll', handleNavScroll, { passive: true });
  if (lenis) lenis.on('scroll', handleNavScroll);
  handleNavScroll();

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
      if (iconMenu && iconClose) {
        iconMenu.hidden = isOpen;
        iconClose.hidden = !isOpen;
      }
    });

    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        if (iconMenu && iconClose) { iconMenu.hidden = false; iconClose.hidden = true; }
      });
    });
  }

  /* ---------- Smooth anchor scrolling (nav links, scroll cue, footer) ---------- */
  document.querySelectorAll('a[href^="#"], [data-scroll-to]').forEach((el) => {
    el.addEventListener('click', (e) => {
      const targetSel = el.getAttribute('href') || el.getAttribute('data-scroll-to');
      if (!targetSel || targetSel === '#') return;
      const target = document.querySelector(targetSel);
      if (!target) return;
      e.preventDefault();
      if (lenis) {
        lenis.scrollTo(target, { offset: -70, duration: 1.3 });
      } else {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ---------- Reveal-on-scroll for [data-reveal] ---------- */
  if (hasGSAP && hasScrollTrigger) {
    const revealEls = gsap.utils.toArray('[data-reveal]');

    revealEls.forEach((el, i) => {
      gsap.set(el, { autoAlpha: 0, y: 34 });

      ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        once: true,
        onEnter: () => {
          gsap.to(el, {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            delay: (i % 3) * 0.08,
            ease: 'power3.out',
          });
        },
      });
    });

    /* Hero timeline plays immediately (not scroll-gated) */
    const heroReveals = document.querySelectorAll('.hero [data-reveal]');
    if (heroReveals.length) {
      gsap.timeline({ delay: 0.4 }).to(heroReveals, {
        autoAlpha: 1,
        y: 0,
        duration: 1.1,
        stagger: 0.12,
        ease: 'power3.out',
      });
    }

    /* ---------- Parallax for [data-parallax] elements ---------- */
    gsap.utils.toArray('[data-parallax]').forEach((el) => {
      const depth = parseFloat(el.getAttribute('data-depth')) || 0.15;
      gsap.to(el, {
        yPercent: depth * 100,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    });
  } else {
    // graceful fallback: make sure everything is simply visible without JS-driven reveal
    document.querySelectorAll('[data-reveal]').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }

  /* ---------- Liquid blob mouse + scroll parallax ---------- */
  const blobWraps = document.querySelectorAll('[data-blob]');
  if (blobWraps.length && !prefersReducedMotion) {
    const mouse = { x: 0, y: 0 };
    const eased = { x: 0, y: 0 };

    window.addEventListener('pointermove', (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });

    let scrollOffset = 0;
    window.addEventListener('rk:scroll', (e) => {
      scrollOffset = e.detail.progress;
    });

    function animateBlobs() {
      eased.x += (mouse.x - eased.x) * 0.05;
      eased.y += (mouse.y - eased.y) * 0.05;

      blobWraps.forEach((wrap) => {
        const depth = parseFloat(wrap.getAttribute('data-depth')) || 0.03;
        const tx = eased.x * 100 * depth * 10;
        const ty = eased.y * 100 * depth * 10 + scrollOffset * -120 * depth * 10;
        wrap.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      });

      requestAnimationFrame(animateBlobs);
    }
    animateBlobs();
  }

  /* ---------- Refresh ScrollTrigger after full load (fonts/images/canvas) ---------- */
  window.addEventListener('load', () => {
    if (hasScrollTrigger) ScrollTrigger.refresh();
  });
  window.addEventListener('resize', () => {
    if (hasScrollTrigger) ScrollTrigger.refresh();
  });
})();
