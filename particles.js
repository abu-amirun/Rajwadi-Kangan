/* ==========================================================================
   RAJWADI KANGAN — particles.js
   Three.js floating "moti" (pearl) background: white pearls, gold pearls
   and glass pearls, all mouse-reactive, scroll-reactive and slowly
   drifting/rotating for a cinematic, jewellery-store feel.

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

  /* ---------- Cinematic lighting ---------- */
  scene.add(new THREE.AmbientLight(0xffffff, 0.55));

  const keyLight = new THREE.PointLight(0xffffff, 1.1, 60);
  keyLight.position.set(10, 12, 18);
  scene.add(keyLight);

  const goldRim = new THREE.PointLight(0xd4af37, 1.5, 60);
  goldRim.position.set(-14, -8, 10);
  scene.add(goldRim);

  const purpleFill = new THREE.PointLight(0xb16aa2, 0.6, 60);
  purpleFill.position.set(0, -14, -6);
  scene.add(purpleFill);

  /* ---------- Pearl group ---------- */
  const group = new THREE.Group();
  scene.add(group);

  const PEARL_TYPES = [
    { color: 0xf8f7f3, metalness: 0.08, roughness: 0.4, opacity: 1, count: isSmallScreen ? 8 : 16 },  // white moti
    { color: 0xd4af37, metalness: 0.85, roughness: 0.22, opacity: 1, count: isSmallScreen ? 6 : 12 }, // golden moti
    { color: 0xb16aa2, metalness: 0.2, roughness: 0.08, opacity: 0.5, count: isSmallScreen ? 5 : 10 }, // glass moti
  ];

  const geometry = new THREE.SphereGeometry(1, 20, 20);
  const pearls = [];

  PEARL_TYPES.forEach((type) => {
    const material = new THREE.MeshStandardMaterial({
      color: type.color,
      metalness: type.metalness,
      roughness: type.roughness,
      transparent: type.opacity < 1,
      opacity: type.opacity,
    });

    for (let i = 0; i < type.count; i++) {
      const mesh = new THREE.Mesh(geometry, material);
      const scale = THREE.MathUtils.randFloat(0.32, 1.05);
      mesh.scale.setScalar(scale);
      mesh.position.set(
        THREE.MathUtils.randFloatSpread(36),
        THREE.MathUtils.randFloatSpread(22),
        THREE.MathUtils.randFloatSpread(16) - 4
      );
      mesh.userData = {
        baseX: mesh.position.x,
        baseY: mesh.position.y,
        speed: THREE.MathUtils.randFloat(0.18, 0.5),
        amplitude: THREE.MathUtils.randFloat(0.6, 1.9),
        rotSpeed: THREE.MathUtils.randFloat(0.05, 0.22),
        offset: Math.random() * Math.PI * 2,
      };
      group.add(mesh);
      pearls.push(mesh);
    }
  });

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
    state.targetRotY = nx * 0.28;
    state.targetRotX = ny * 0.16;
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

    // smooth (lerp) toward the mouse target rotation
    group.rotation.y += (state.targetRotY - group.rotation.y) * 0.03;
    group.rotation.x += (state.targetRotX - group.rotation.x) * 0.03;
    group.rotation.z = state.scrollProgress * 0.4;
    group.position.y = -state.scrollProgress * 2.4;

    pearls.forEach((p) => {
      const u = p.userData;
      p.position.y = u.baseY + Math.sin(t * u.speed + u.offset) * u.amplitude;
      p.position.x = u.baseX + Math.cos(t * u.speed * 0.6 + u.offset) * (u.amplitude * 0.4);
      p.rotation.x += u.rotSpeed * 0.01;
      p.rotation.y += u.rotSpeed * 0.015;
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
