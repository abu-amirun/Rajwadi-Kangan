/* ==========================================================================
   RAJWADI KANGAN — particles.js
   Three.js floating "moti" (pearl) background.

   Performance notes:
   - All pearls share one geometry + one material and are drawn as a single
     THREE.InstancedMesh — one draw call for the whole field instead of one
     per pearl. This is the main lever for "smoother, faster" 3D on
     mid-range phones.
   - Rendering pauses automatically when the tab isn't visible (Page
     Visibility API), so it never burns battery/CPU in a background tab.
   - Pixel ratio is capped and pearl count scales down on small screens.

   A single unified pearl style is used site-wide — soft grey-lavender
   nacre with a warm gold rim light — mouse-reactive, scroll-reactive,
   gently drifting.

   Listens for the "rk:scroll" event fired by scroll.js
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
    paused: false,
  };

  /* ---------- Scene / camera / renderer ---------- */
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, state.width / state.height, 0.1, 100);
  camera.position.z = 22;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
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

  /* ---------- Pearl field (single InstancedMesh) ---------- */
  const PEARL_COUNT = isSmallScreen ? 16 : 28;

  const geometry = new THREE.SphereGeometry(1, 20, 20);
  const material = new THREE.MeshStandardMaterial({
    color: 0xd9cfd6,      // soft lavender-grey nacre, matching the reference pearl
    metalness: 0.12,
    roughness: 0.28,
    emissive: 0x3a2e1a,   // faint warm undertone so the gold rim light reads through
    emissiveIntensity: 0.12,
  });

  const field = new THREE.InstancedMesh(geometry, material, PEARL_COUNT);
  field.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(field);

  const dummy = new THREE.Object3D();
  const pearlData = [];

  for (let i = 0; i < PEARL_COUNT; i++) {
    const data = {
      baseX: THREE.MathUtils.randFloatSpread(36),
      baseY: THREE.MathUtils.randFloatSpread(22),
      baseZ: THREE.MathUtils.randFloatSpread(16) - 4,
      scale: THREE.MathUtils.randFloat(0.34, 1.0),
      speed: THREE.MathUtils.randFloat(0.14, 0.36),   // gentle drift ("light animation")
      amplitude: THREE.MathUtils.randFloat(0.5, 1.4),
      rotSpeed: THREE.MathUtils.randFloat(0.04, 0.14),
      offset: Math.random() * Math.PI * 2,
      rotX: 0,
      rotY: 0,
    };
    pearlData.push(data);

    dummy.position.set(data.baseX, data.baseY, data.baseZ);
    dummy.scale.setScalar(data.scale);
    dummy.updateMatrix();
    field.setMatrixAt(i, dummy.matrix);
  }
  field.instanceMatrix.needsUpdate = true;

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

  /* ---------- Pause when the tab is hidden (battery/CPU friendly) ---------- */
  document.addEventListener('visibilitychange', () => {
    state.paused = document.hidden;
    if (!state.paused && !prefersReducedMotion) requestAnimationFrame(animate);
  });

  /* ---------- Animation loop ---------- */
  const clock = new THREE.Clock();
  let groupRotY = 0;
  let groupRotX = 0;

  function animate() {
    if (state.paused) return;
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // smooth (lerp) toward the mouse target rotation — kept subtle on purpose
    groupRotY += (state.targetRotY - groupRotY) * 0.025;
    groupRotX += (state.targetRotX - groupRotX) * 0.025;
    const groupRotZ = state.scrollProgress * 0.3;
    const groupOffsetY = -state.scrollProgress * 2.2;

    for (let i = 0; i < PEARL_COUNT; i++) {
      const d = pearlData[i];
      const localY = d.baseY + Math.sin(t * d.speed + d.offset) * d.amplitude;
      const localX = d.baseX + Math.cos(t * d.speed * 0.6 + d.offset) * (d.amplitude * 0.4);
      d.rotX += d.rotSpeed * 0.008;
      d.rotY += d.rotSpeed * 0.012;

      // apply the whole-field rotation (mouse/scroll) around the origin,
      // then translate — cheap enough per-instance and keeps the group feel
      const cosY = Math.cos(groupRotY), sinY = Math.sin(groupRotY);
      const cosX = Math.cos(groupRotX), sinX = Math.sin(groupRotX);

      // rotate around Y then X (matches the previous group.rotation order)
      let x = localX * cosY + d.baseZ * sinY;
      let z = -localX * sinY + d.baseZ * cosY;
      let y = localY * cosX - z * sinX;
      z = localY * sinX + z * cosX;

      dummy.position.set(x, y + groupOffsetY, z);
      dummy.rotation.set(d.rotX, d.rotY, groupRotZ);
      dummy.scale.setScalar(d.scale);
      dummy.updateMatrix();
      field.setMatrixAt(i, dummy.matrix);
    }
    field.instanceMatrix.needsUpdate = true;

    renderer.render(scene, camera);
  }

  if (!prefersReducedMotion) {
    animate();
  } else {
    // render a single static, gently-lit frame and skip the RAF loop entirely
    renderer.render(scene, camera);
  }
})();
