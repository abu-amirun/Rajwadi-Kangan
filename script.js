import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.185.0/build/three.module.js";

const canvas = document.querySelector("#three-bg");

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  55,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);

camera.position.set(0, 0, 8);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const group = new THREE.Group();
scene.add(group);

// 3D Royal Bracelet Ring
const torusGeometry = new THREE.TorusGeometry(1.65, 0.12, 32, 160);
const torusMaterial = new THREE.MeshStandardMaterial({
  color: 0xb66cff,
  metalness: 0.72,
  roughness: 0.18,
  emissive: 0x2b004f,
  emissiveIntensity: 0.35
});

const torus = new THREE.Mesh(torusGeometry, torusMaterial);
torus.position.set(2.6, 0.2, 0);
torus.rotation.x = 1.2;
torus.rotation.y = 0.4;
group.add(torus);

// Inner luxury crystal
const crystalGeometry = new THREE.IcosahedronGeometry(0.72, 2);
const crystalMaterial = new THREE.MeshStandardMaterial({
  color: 0xff5bd8,
  metalness: 0.45,
  roughness: 0.12,
  transparent: true,
  opacity: 0.9
});

const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
crystal.position.set(2.6, 0.2, 0);
group.add(crystal);

// Small royal beads around ring
const beadGeometry = new THREE.SphereGeometry(0.055, 18, 18);
const beadMaterial = new THREE.MeshStandardMaterial({
  color: 0xf5c542,
  metalness: 0.8,
  roughness: 0.2
});

for (let i = 0; i < 34; i++) {
  const bead = new THREE.Mesh(beadGeometry, beadMaterial);
  const angle = (i / 34) * Math.PI * 2;

  bead.position.set(
    2.6 + Math.cos(angle) * 1.65,
    0.2 + Math.sin(angle) * 1.65,
    0
  );

  bead.rotation.x = 1.2;
  group.add(bead);
}

// Background particles
const particlesGeometry = new THREE.BufferGeometry();
const particleCount = 1200;
const positions = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount * 3; i++) {
  positions[i] = (Math.random() - 0.5) * 18;
}

particlesGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, 3)
);

const particlesMaterial = new THREE.PointsMaterial({
  size: 0.018,
  color: 0xffffff,
  transparent: true,
  opacity: 0.55
});

const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

// Purple light setup
const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
scene.add(ambientLight);

const pointLightOne = new THREE.PointLight(0xff4fd8, 3.5);
pointLightOne.position.set(4, 4, 5);
scene.add(pointLightOne);

const pointLightTwo = new THREE.PointLight(0x8b5cf6, 3);
pointLightTwo.position.set(-4, -3, 4);
scene.add(pointLightTwo);

const pointLightThree = new THREE.PointLight(0xf5c542, 1.8);
pointLightThree.position.set(2, -2, 3);
scene.add(pointLightThree);

// Mouse parallax
const mouse = {
  x: 0,
  y: 0
};

window.addEventListener("mousemove", (event) => {
  mouse.x = event.clientX / window.innerWidth - 0.5;
  mouse.y = event.clientY / window.innerHeight - 0.5;
});

// Smooth scroll reveal
const revealElements = document.querySelectorAll(
  ".collection-card, .feature, .contact-section"
);

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  },
  {
    threshold: 0.12
  }
);

revealElements.forEach((element) => {
  element.style.opacity = "0";
  element.style.transform = "translateY(30px)";
  element.style.transition = "0.7s ease";
  revealObserver.observe(element);
});

// Resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  torus.rotation.z += 0.006;
  torus.rotation.y += 0.003;

  crystal.rotation.x += 0.008;
  crystal.rotation.y += 0.01;

  particles.rotation.y += 0.0008;
  particles.rotation.x += 0.0002;

  group.position.x += (mouse.x * 0.8 - group.position.x) * 0.035;
  group.position.y += (-mouse.y * 0.5 - group.position.y) * 0.035;

  renderer.render(scene, camera);
}

animate();
