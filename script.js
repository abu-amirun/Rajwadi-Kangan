// Mobile menu
const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");

menuToggle?.addEventListener("click", () => {
  mobileMenu.classList.toggle("show");
});

document.querySelectorAll(".mobile-menu a").forEach((link) => {
  link.addEventListener("click", () => {
    mobileMenu.classList.remove("show");
  });
});

// Reveal on scroll
const revealItems = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
      }
    });
  },
  {
    threshold: 0.12,
  }
);

revealItems.forEach((item) => revealObserver.observe(item));

// Create pearls
const pearlField = document.getElementById("pearlField");

function createPearls() {
  const pearlCount = window.innerWidth < 768 ? 12 : 20;

  for (let i = 0; i < pearlCount; i++) {
    const pearl = document.createElement("span");
    pearl.className = `pearl ${i % 3 === 0 ? "gold" : "white"}`;

    const size = Math.random() * 42 + 20;
    const left = Math.random() * 100;
    const top = Math.random() * 100;
    const moveX = Math.random() * 26 - 13;
    const moveY = -(Math.random() * 36 + 10);
    const duration = Math.random() * 6 + 8;
    const delay = Math.random() * 6;

    pearl.style.width = `${size}px`;
    pearl.style.height = `${size}px`;
    pearl.style.left = `${left}%`;
    pearl.style.top = `${top}%`;
    pearl.style.setProperty("--moveX", `${moveX}px`);
    pearl.style.setProperty("--moveY", `${moveY}px`);
    pearl.style.setProperty("--duration", `${duration}s`);
    pearl.style.setProperty("--delay", `${delay}s`);
    pearl.style.opacity = `${Math.random() * 0.45 + 0.35}`;

    pearlField.appendChild(pearl);
  }
}

createPearls();

// Mouse parallax
const parallaxLayers = document.querySelectorAll(".parallax-layer");
const tiltCard = document.querySelector(".tilt-card");

let mouseX = 0;
let mouseY = 0;
let currentX = 0;
let currentY = 0;

window.addEventListener("mousemove", (e) => {
  mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
  mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
});

function animateParallax() {
  currentX += (mouseX - currentX) * 0.06;
  currentY += (mouseY - currentY) * 0.06;

  parallaxLayers.forEach((layer) => {
    const depth = Number(layer.dataset.depth || 10);
    const moveX = currentX * depth;
    const moveY = currentY * depth;

    layer.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
  });

  if (tiltCard && window.innerWidth > 900) {
    const rotateY = currentX * 5;
    const rotateX = currentY * -4;
    tiltCard.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  } else if (tiltCard) {
    tiltCard.style.transform = "none";
  }

  requestAnimationFrame(animateParallax);
}

animateParallax();

// Active header effect on scroll
const siteHeader = document.querySelector(".site-header");

window.addEventListener("scroll", () => {
  if (window.scrollY > 30) {
    siteHeader.style.background = "rgba(255,255,255,0.10)";
    siteHeader.style.borderColor = "rgba(255,255,255,0.18)";
  } else {
    siteHeader.style.background = "rgba(255,255,255,0.08)";
    siteHeader.style.borderColor = "rgba(255,255,255,0.16)";
  }
});
