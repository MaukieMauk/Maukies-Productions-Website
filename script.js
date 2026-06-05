const header = document.querySelector("[data-header]");
const revealItems = document.querySelectorAll(".reveal");
const parallaxLayers = document.querySelectorAll(".parallax-layer");
const depthCards = document.querySelectorAll("[data-depth]");
const cursorGlow = document.querySelector(".cursor-glow");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.18,
    rootMargin: "0px 0px -8% 0px",
  }
);

revealItems.forEach((item) => revealObserver.observe(item));

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function updateHeader() {
  header.classList.toggle("is-scrolled", window.scrollY > 32);
}

function updateParallax() {
  if (reduceMotion) return;

  const viewportHeight = window.innerHeight;

  parallaxLayers.forEach((layer) => {
    const rect = layer.getBoundingClientRect();
    const speed = Number(layer.dataset.speed || 0);
    const scale = Number(layer.dataset.scale || 0);
    const progress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
    const easedProgress = clamp(progress, 0, 1);
    const movement = (easedProgress - 0.5) * viewportHeight * speed;
    const zoom = 1 + easedProgress * scale;

    layer.style.transform = `translate3d(0, ${movement}px, 0) scale(${zoom})`;
  });
}

function updateDepthCards() {
  if (reduceMotion) return;

  depthCards.forEach((card) => {
    const rect = card.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const distance = Math.abs(window.innerHeight / 2 - midpoint);
    const intensity = 1 - clamp(distance / window.innerHeight, 0, 1);
    card.style.setProperty("--lift", `${intensity * -18}px`);
    card.style.transform = `translateY(${intensity * -18}px)`;
  });
}

function animateFrame() {
  updateHeader();
  updateParallax();
  updateDepthCards();
}

let ticking = false;

function requestTick() {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      animateFrame();
      ticking = false;
    });
    ticking = true;
  }
}

window.addEventListener("scroll", requestTick, { passive: true });
window.addEventListener("resize", requestTick);

window.addEventListener("pointermove", (event) => {
  if (reduceMotion || !cursorGlow) return;

  cursorGlow.animate(
    {
      transform: `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`,
    },
    {
      duration: 750,
      fill: "forwards",
      easing: "cubic-bezier(.2,.8,.2,1)",
    }
  );
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));

    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  });
});

animateFrame();
