/* ==========================================================================
   RAJWADI KANGAN — particles.js
   Three.js floating "moti" (pearl) background.

   Per client direction: only ONE pearl style is used site-wide — a soft
   grey-lavender nacre pearl with a warm gold rim light (matching the
   reference photograph supplied), rather than mixed white/gold/glass
   pearls. Mouse-reactive, scroll-reactive, gentle drifting + rotation.

   Dispatches nothing; listens for the "rk:scroll" event fired by scroll.js
   ( CustomEvent detail: { progress: 0..1 } ) to tie particle rotation to
   how far down the page the visitor has scrolled.
   ========================================================================== */

(function () {
  'use strict';

  const canvas = document.getElementById('pearl-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isSmallScreen = window.innerWidth < 700;

  const state = {
    width: window.innerWidth,
    height: window.innerHeight,
    targetRotX: 0,
    targetRotY: 0,
    scrollProgress: 0,
  };

  /* ---------- Scene / camera / renderer ---------- */
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, state.width / state.height, 0.1, 100);
  camera.position.z = 22;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(state.width, state.height);

  /* ---------- Cinematic lighting ----------
     A warm gold key + a cooler fill reproduce the soft lavender-grey pearl
     body with a golden undertone seen in the reference photo. */
  scene.add(new THREE.AmbientLight(0xffffff, 0.45));

  const goldKey = new THREE.PointLight(0xd4af37, 1.6, 60);
  goldKey.position.set(-10, 10, 16);
  scene.add(goldKey);

  const softFill = new THREE.PointLight(0xf8f7f3, 0.7, 60);
  softFill.position.set(12, -6, 12);
  scene.add(softFill);

  /* ---------- Pearl group (single unified material) ---------- */
  const group = new THREE.Group();
  scene.add(group);

  const PEARL_COUNT = isSmallScreen ? 16 : 28;

  const geometry = new THREE.SphereGeometry(1, 24, 24);
  const material = new THREE.MeshStandardMaterial({
    color: 0xd9cfd6,      // soft lavender-grey nacre, matching the reference pearl
    metalness: 0.12,
    roughness: 0.28,
    emissive: 0x3a2e1a,   // faint warm undertone so the gold rim light reads through
    emissiveIntensity: 0.12,
  });

  const pearls = [];

  for (let i = 0; i < PEARL_COUNT; i++) {
    const mesh = new THREE.Mesh(geometry, material);
    const scale = THREE.MathUtils.randFloat(0.34, 1.0);
    mesh.scale.setScalar(scale);
    mesh.position.set(
      THREE.MathUtils.randFloatSpread(36),
      THREE.MathUtils.randFloatSpread(22),
      THREE.MathUtils.randFloatSpread(16) - 4
    );
    mesh.userData = {
      baseX: mesh.position.x,
      baseY: mesh.position.y,
      speed: THREE.MathUtils.randFloat(0.14, 0.36),   // gentle drift ("light animation")
      amplitude: THREE.MathUtils.randFloat(0.5, 1.4),
      rotSpeed: THREE.MathUtils.randFloat(0.04, 0.14),
      offset: Math.random() * Math.PI * 2,
    };
    group.add(mesh);
    pearls.push(mesh);
  }

  /* ---------- Resize ---------- */
  function onResize() {
    state.width = window.innerWidth;
    state.height = window.innerHeight;
    camera.aspect = state.width / state.height;
    camera.updateProjectionMatrix();
    renderer.setSize(state.width, state.height);
  }
  window.addEventListener('resize', onResize);

  /* ---------- Mouse reactivity ---------- */
  window.addEventListener('pointermove', (e) => {
    const nx = (e.clientX / state.width) * 2 - 1;
    const ny = (e.clientY / state.height) * 2 - 1;
    state.targetRotY = nx * 0.22;
    state.targetRotX = ny * 0.12;
  }, { passive: true });

  /* ---------- Scroll reactivity (progress supplied by scroll.js) ---------- */
  window.addEventListener('rk:scroll', (e) => {
    state.scrollProgress = e.detail && typeof e.detail.progress === 'number' ? e.detail.progress : 0;
  });

  /* ---------- Animation loop ---------- */
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // smooth (lerp) toward the mouse target rotation — kept subtle on purpose
    group.rotation.y += (state.targetRotY - group.rotation.y) * 0.025;
    group.rotation.x += (state.targetRotX - group.rotation.x) * 0.025;
    group.rotation.z = state.scrollProgress * 0.3;
    group.position.y = -state.scrollProgress * 2.2;

    pearls.forEach((p) => {
      const u = p.userData;
      p.position.y = u.baseY + Math.sin(t * u.speed + u.offset) * u.amplitude;
      p.position.x = u.baseX + Math.cos(t * u.speed * 0.6 + u.offset) * (u.amplitude * 0.4);
      p.rotation.x += u.rotSpeed * 0.008;
      p.rotation.y += u.rotSpeed * 0.012;
    });

    renderer.render(scene, camera);
  }

  if (!prefersReducedMotion) {
    animate();
  } else {
    // render a single static, gently-lit frame and skip the RAF loop entirely
    renderer.render(scene, camera);
  }
})();
