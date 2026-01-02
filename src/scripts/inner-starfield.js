// src/scripts/inner-starfield.js

function xmur3(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function rngFromSeed(seedStr) {
  const seedFn = xmur3(String(seedStr));
  return mulberry32(seedFn());
}

function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}

export function mountInnerStarfield({
  canvasId = "sf-canvas",
  seed = "inner-1",
  density = 0.00008, // stars per CSS pixel (tune later)
} = {}) {
  const canvas = document.getElementById(canvasId);
  if (!(canvas instanceof HTMLCanvasElement)) return () => {};

  const prefersReduced =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
  if (!ctx) return () => {};

  let disposed = false;
  const rng = rngFromSeed(seed);

  let cssW = 1;
  let cssH = 1;
  let dpr = 1;

  /** @type {Array<{x:number,y:number,r:number,a:number,tw:number,ph:number}>} */
  let stars = [];

  function buildStars() {
    // Count based on visible area; deterministic because rng is seeded
    const count = Math.max(120, Math.floor(cssW * cssH * density));

    stars = new Array(count);
    for (let i = 0; i < count; i++) {
      const x = rng() * cssW;
      const y = rng() * cssH;

      // Size distribution: mostly tiny, some medium, few larger
      const p = rng();
      const r =
        p < 0.86 ? (0.55 + rng() * 0.65) :
        p < 0.97 ? (1.1 + rng() * 0.9) :
                   (2.0 + rng() * 1.6);

      // Base alpha: generally low; bigger stars can be slightly brighter
      const a = clamp01(0.06 + rng() * 0.16 + (r > 1.6 ? 0.08 : 0));

      // Twinkle amplitude + speed: subtle; larger stars twinkle a touch more
      const tw = (r > 1.6 ? 0.08 : 0.04) + rng() * 0.1; // amplitude
      const sp = 0.25 + rng() * 0.55; // speed multiplier
      const ph = rng() * Math.PI * 2;

      stars[i] = { x, y, r, a, tw: tw * sp, ph };
    }
  }

  function resize() {
    // CSS size
    const rect = canvas.getBoundingClientRect();
    cssW = Math.max(1, Math.round(rect.width));
    cssH = Math.max(1, Math.round(rect.height));

    // DPR clamp for stability
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.max(1, Math.floor(cssW * dpr));
    canvas.height = Math.max(1, Math.floor(cssH * dpr));

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Rebuild the field for the new size (still deterministic for that size)
    buildStars();
  }

  function clear() {
    ctx.clearRect(0, 0, cssW, cssH);

    // Very subtle vignette to keep center calm
    const g = ctx.createRadialGradient(
      cssW * 0.5, cssH * 0.5, Math.min(cssW, cssH) * 0.15,
      cssW * 0.5, cssH * 0.5, Math.min(cssW, cssH) * 0.75
    );
    g.addColorStop(0, "rgba(0,0,0,0.00)");
    g.addColorStop(1, "rgba(0,0,0,0.45)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, cssW, cssH);
  }

  function draw(tSec) {
    ctx.clearRect(0, 0, cssW, cssH);

    // Draw stars first
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];

     const alpha = s.a;

      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
    }

    ctx.globalAlpha = 1;

    // Vignette overlay
    const g = ctx.createRadialGradient(
      cssW * 0.5, cssH * 0.5, Math.min(cssW, cssH) * 0.18,
      cssW * 0.5, cssH * 0.5, Math.min(cssW, cssH) * 0.78
    );
    g.addColorStop(0, "rgba(0,0,0,0.00)");
    g.addColorStop(1, "rgba(0,0,0,0.55)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, cssW, cssH);
  }

  let raf = 0;

  function frame() {
    if (disposed) return;
    const tSec = performance.now() * 0.001;
    draw(tSec);
    raf = requestAnimationFrame(frame);
  }

  // Setup
  resize();

  // Keep it stable across resizes
  const onResize = () => resize();
  window.addEventListener("resize", onResize);
  if (window.visualViewport) window.visualViewport.addEventListener("resize", onResize);

  if (prefersReduced) {
    // One deterministic render, no animation
    draw(0);
  } else {
    raf = requestAnimationFrame(frame);
  }

  return () => {
    disposed = true;
    if (raf) cancelAnimationFrame(raf);
    window.removeEventListener("resize", onResize);
    if (window.visualViewport) window.visualViewport.removeEventListener("resize", onResize);
  };
}
