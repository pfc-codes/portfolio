import * as THREE from "three";
import { EffectComposer, RenderPass, EffectPass, BloomEffect } from "postprocessing";

async function loadBinPoints(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  const buf = await res.arrayBuffer();
  const positions = new Float32Array(buf);
  if (positions.length % 3 !== 0) throw new Error(`Invalid buffer length: ${positions.length}`);
  return positions;
}

function setTarget(geom, target) {
  geom.getAttribute("aTarget").array.set(target);
  geom.getAttribute("aTarget").needsUpdate = true;
}

function getWrapRect(wrapEl) {
  const r = wrapEl.getBoundingClientRect();
  // Guard against 0-size measurements during initial layout
  const w = Math.max(1, r.width);
  const h = Math.max(1, r.height);
  return { width: w, height: h, aspect: w / h };
}

/**
 * Fits an OrthographicCamera to contain the geometry with a margin.
 * Uses the *actual rendered* wrap rect (post-zoom, post-layout).
 */
function fitOrthoToGeometry(camera, geometry, wrapEl, margin = 1.2) {
  geometry.computeBoundingBox();
  const bbox = geometry.boundingBox;
  if (!bbox) return;

  const size = new THREE.Vector3();
  bbox.getSize(size);

  const { aspect } = getWrapRect(wrapEl);

  const neededHeight = size.y * margin;
  const neededWidth = size.x * margin;

  const frustumHeight = Math.max(neededHeight, neededWidth / aspect);

  camera.left = (-frustumHeight * aspect) / 2;
  camera.right = (frustumHeight * aspect) / 2;
  camera.top = frustumHeight / 2;
  camera.bottom = -frustumHeight / 2;

  camera.near = 0.01;
  camera.far = 100;
  camera.position.set(0, 0, 10);
  camera.lookAt(0, 0, 0);
  camera.updateProjectionMatrix();
}

function makeGridTarget(N, width = 3.2, height = 1.4) {
  const out = new Float32Array(N * 3);
  const cols = Math.floor(Math.sqrt(N * (width / height)));
  const rows = Math.floor(N / cols);

  let i = 0;
  for (let r = 0; r < rows && i < N; r++) {
    for (let c = 0; c < cols && i < N; c++) {
      const x = (c / (cols - 1) - 0.5) * width;
      const y = (0.5 - r / (rows - 1)) * height;
      out[i * 3 + 0] = x;
      out[i * 3 + 1] = y;
      out[i * 3 + 2] = 0;
      i++;
    }
  }

  for (; i < N; i++) {
    out[i * 3 + 0] = (Math.random() - 0.5) * 0.05;
    out[i * 3 + 1] = (Math.random() - 0.5) * 0.05;
    out[i * 3 + 2] = 0;
  }
  return out;
}

function xmur3(str) {
  // string -> 32-bit seed
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
  // 32-bit seed -> rng() in [0,1)
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createRngFromSeed(seedStr) {
  const seedFn = xmur3(String(seedStr));
  return mulberry32(seedFn());
}


function randn(rng = Math.random) {
  // Box–Muller transform (mean 0, stddev 1)
  let u = 0, v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}


/**
 * Procedural "nebula" target (a soft, clustered 3D cloud) intentionally offset
 * away from the screen center so it doesn't compete with the HTML nav.
 */
function makeNebulaTarget(
  N,
  {
    size,
    center = new THREE.Vector3(0, 0, 0),
    radius = Math.min(size.x, size.y) * 0.7,
    depth = Math.min(size.x, size.y) * 0,
    lobes = 6,
    rng = Math.random, // add this
  }
) {

  const out = new Float32Array(N * 3);

  // Lobe centers clustered around "center"
  const lobeCenters = [];
  const sigmas = [];
  for (let l = 0; l < lobes; l++) {
    const a = rng() * Math.PI * 2;
    const r = radius * 0.35 * Math.sqrt(rng());
    lobeCenters.push(
      new THREE.Vector3(
        center.x + Math.cos(a) * r,
        center.y + Math.sin(a) * r,
        center.z + (rng() - 0.5) * depth * 0.15
      )
    );
    sigmas.push(radius * (0.12 + rng() * 0.10)); // ~0.12–0.22 * radius
  }

  // Sample a mixture of Gaussians, reject extreme outliers to keep a soft “blob”
  for (let i = 0; i < N; i++) {
    const l = (rng() * lobes) | 0;
    const c = lobeCenters[l];
    const s = sigmas[l];

    let x, y, z;
    // reject a few times to avoid very long tails
    for (let k = 0; k < 6; k++) {
      x = randn() * s;
      y = randn() * s;
      z = randn() * (depth * 0.35);
      if (x * x + y * y <= (radius * radius) * 1.2) break;
    }

    out[i * 3] = c.x + x;
    out[i * 3 + 1] = c.y + y;
    out[i * 3 + 2] = c.z + z;
  }

  return out;
}


async function svgToTargetPoints(svgUrl, N) {
  const res = await fetch(svgUrl, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch ${svgUrl}: ${res.status} ${res.statusText}`);
  const svgText = await res.text();

  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, "image/svg+xml");
  const svg = doc.querySelector("svg");
  if (!svg) throw new Error("SVG missing <svg> root");

  const vb = (svg.getAttribute("viewBox") || "").trim().split(/\s+/).map(Number);
  if (vb.length !== 4 || vb.some((n) => Number.isNaN(n))) {
    throw new Error("SVG must have a valid viewBox, e.g. viewBox='0 0 1200 400'");
  }
  const [vbX, vbY, vbW, vbH] = vb;

  const paths = Array.from(doc.querySelectorAll("path"));
  const lines = Array.from(doc.querySelectorAll("line"));
  const rects = Array.from(doc.querySelectorAll("rect"));
  const circles = Array.from(doc.querySelectorAll("circle, ellipse"));
  const polys = Array.from(doc.querySelectorAll("polygon, polyline"));

  // Hidden SVG for getTotalLength/getPointAtLength
  const hidden = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  hidden.setAttribute("width", "0");
  hidden.setAttribute("height", "0");
  hidden.style.position = "absolute";
  hidden.style.left = "-9999px";
  hidden.style.top = "-9999px";
  document.body.appendChild(hidden);

  const addPathD = (d) => {
    const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
    p.setAttribute("d", d);
    hidden.appendChild(p);
    return p;
  };

  const samplePaths = [];
  for (const p of paths) {
    const d = p.getAttribute("d");
    if (!d) continue;
    samplePaths.push(addPathD(d));
  }

  for (const l of lines) {
    const x1 = l.getAttribute("x1"), y1 = l.getAttribute("y1");
    const x2 = l.getAttribute("x2"), y2 = l.getAttribute("y2");
    if ([x1, y1, x2, y2].some((v) => v == null)) continue;
    samplePaths.push(addPathD(`M ${x1} ${y1} L ${x2} ${y2}`));
  }

  for (const r of rects) {
    const x = +r.getAttribute("x") || 0;
    const y = +r.getAttribute("y") || 0;
    const w = +r.getAttribute("width") || 0;
    const h = +r.getAttribute("height") || 0;
    if (!w || !h) continue;
    samplePaths.push(addPathD(`M ${x} ${y} H ${x + w} V ${y + h} H ${x} Z`));
  }

  for (const p of polys) {
    const pts = (p.getAttribute("points") || "").trim();
    if (!pts) continue;
    const parts = pts.split(/[\s,]+/).map(Number);
    if (parts.length < 4) continue;
    let d = `M ${parts[0]} ${parts[1]}`;
    for (let i = 2; i < parts.length; i += 2) d += ` L ${parts[i]} ${parts[i + 1]}`;
    if (p.tagName.toLowerCase() === "polygon") d += " Z";
    samplePaths.push(addPathD(d));
  }

  for (const c of circles) {
    const tag = c.tagName.toLowerCase();
    const cx = +c.getAttribute("cx") || 0;
    const cy = +c.getAttribute("cy") || 0;
    const rx = tag === "circle" ? (+c.getAttribute("r") || 0) : (+c.getAttribute("rx") || 0);
    const ry = tag === "circle" ? (+c.getAttribute("r") || 0) : (+c.getAttribute("ry") || 0);
    if (!rx || !ry) continue;
    const d = `
      M ${cx + rx} ${cy}
      A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy}
      A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy}
    `;
    samplePaths.push(addPathD(d));
  }

  if (samplePaths.length === 0) {
    hidden.remove();
    throw new Error("SVG contains no sampleable shapes (need path/line/rect/etc.)");
  }

  const lengths = samplePaths.map((p) => {
    try { return p.getTotalLength(); } catch { return 0; }
  });
  const totalLen = lengths.reduce((a, b) => a + b, 0);
  if (totalLen <= 0) {
    hidden.remove();
    throw new Error("SVG paths have zero total length");
  }

  const out = new Float32Array(N * 3);
  let written = 0;

  for (let i = 0; i < samplePaths.length; i++) {
    const p = samplePaths[i];
    const L = lengths[i];
    if (L <= 0) continue;

    const count = Math.max(1, Math.floor((L / totalLen) * N));
    for (let j = 0; j < count && written < N; j++) {
      const t = (j / Math.max(1, count - 1)) * L;
      const pt = p.getPointAtLength(t);

      const nx = (pt.x - vbX) / vbW - 0.5;
      const ny = (pt.y - vbY) / vbH - 0.5;

      out[written * 3 + 0] = nx;
      out[written * 3 + 1] = -ny;
      out[written * 3 + 2] = 0;
      written++;
    }
  }

  while (written < N) {
    const k = Math.floor(Math.random() * Math.max(1, written));
    out[written * 3 + 0] = out[k * 3 + 0] + (Math.random() - 0.5) * 0.002;
    out[written * 3 + 1] = out[k * 3 + 1] + (Math.random() - 0.5) * 0.002;
    out[written * 3 + 2] = 0;
    written++;
  }

  hidden.remove();
  return out;
}

function clamp01(x) { return Math.max(0, Math.min(1, x)); }

function expandBits(v) {
  v = (v | (v << 8)) & 0x00FF00FF;
  v = (v | (v << 4)) & 0x0F0F0F0F;
  v = (v | (v << 2)) & 0x33333333;
  v = (v | (v << 1)) & 0x55555555;
  return v >>> 0;
}

function morton3D(x, y, z) {
  const xx = expandBits(x);
  const yy = expandBits(y) << 1;
  const zz = expandBits(z) << 2;
  return (xx | yy | zz) >>> 0;
}

function bboxOfPositions(pos) {
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  for (let i = 0; i < pos.length; i += 3) {
    const x = pos[i], y = pos[i + 1], z = pos[i + 2];
    if (x < minX) minX = x; if (y < minY) minY = y; if (z < minZ) minZ = z;
    if (x > maxX) maxX = x; if (y > maxY) maxY = y; if (z > maxZ) maxZ = z;
  }
  return { minX, minY, minZ, maxX, maxY, maxZ };
}

function mortonSortPositions(pos) {
  const N = pos.length / 3;
  const bb = bboxOfPositions(pos);
  const dx = (bb.maxX - bb.minX) || 1;
  const dy = (bb.maxY - bb.minY) || 1;
  const dz = (bb.maxZ - bb.minZ) || 1;

  const keys = new Uint32Array(N);
  for (let i = 0; i < N; i++) {
    const x = (pos[i * 3] - bb.minX) / dx;
    const y = (pos[i * 3 + 1] - bb.minY) / dy;
    const z = (pos[i * 3 + 2] - bb.minZ) / dz;
    const xi = Math.floor(clamp01(x) * 1023);
    const yi = Math.floor(clamp01(y) * 1023);
    const zi = Math.floor(clamp01(z) * 1023);
    keys[i] = morton3D(xi, yi, zi);
  }

  const idx = Array.from({ length: N }, (_, i) => i);
  idx.sort((a, b) => keys[a] - keys[b]);

  const out = new Float32Array(pos.length);
  for (let rank = 0; rank < N; rank++) {
    const src = idx[rank];
    out[rank * 3] = pos[src * 3];
    out[rank * 3 + 1] = pos[src * 3 + 1];
    out[rank * 3 + 2] = pos[src * 3 + 2];
  }
  return out;
}

export async function mountPointCloudHero({
  canvasId = "pc-canvas",
  wrapId = "pc-wrap",
  autoStartDelayMs = 1000,}  = {}) 
  
  {
  const canvas = document.getElementById(canvasId);
  const wrap = document.getElementById(wrapId);

  if (!(canvas instanceof HTMLCanvasElement)) throw new Error("Canvas not found");
  if (!(wrap instanceof HTMLElement)) throw new Error("Wrap not found");

  if (wrap.__pchMounted) return;
  wrap.__pchMounted = true;

    const prefersReduced =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const state = {
    disposed: false,
    hasTarget: false,
    morphStarted: false,
    uiReady: false,
    uiEventQueued: false,

    // used for auto-start gating
    characterReady: false,
    characterReadyAt: 0,
  };
const params = new URLSearchParams(window.location.search);
const seedParam = params.get("seed");

// Priority: URL seed (if provided) -> localStorage -> default constant
const stored = window.localStorage.getItem("phroNebulaSeed");
const nebulaSeed = seedParam ?? stored ?? "1";


// If URL seed is provided, persist it so you can remove the query param later
if (seedParam) window.localStorage.setItem("phroNebulaSeed", seedParam);

const nebulaRng = createRngFromSeed(nebulaSeed);
console.log("[PCH] nebula seed:", nebulaSeed);


  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setClearColor(0x000000, 1);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 100);
  camera.position.set(0, 0, 10);
  camera.lookAt(0, 0, 0);

  const geom = new THREE.BufferGeometry();
  const placeholder = new Float32Array([0, 0, 0]);
  geom.setAttribute("position", new THREE.BufferAttribute(placeholder, 3));
  geom.setAttribute("aTarget", new THREE.BufferAttribute(new Float32Array(placeholder), 3));

  const BASE_POINT_SIZE = 1.0;

  const uniforms = {
    uProgress: { value: 0.0 },
    uPointSize: { value: BASE_POINT_SIZE },
    uTime: { value: 0.0 },
    uWobbleAmp: { value: 0.0 },
  };

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthTest: true,
    depthWrite: false,
    uniforms,
    vertexShader: `
      attribute vec3 aTarget;
      uniform float uProgress;
      uniform float uPointSize;
      uniform float uTime;
      uniform float uWobbleAmp;

      // Very lightweight pseudo-noise (no textures, no heavy noise functions)
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      void main() {
        vec3 p = mix(position, aTarget, uProgress);

        // Subtle “alive” motion only after the morph settles
        float alive = smoothstep(0.88, 1.0, uProgress);
        float t = uTime * 0.35;

        float n1 = sin(t + dot(p.xy, vec2(1.7, 9.2)));
        float n2 = cos(t * 1.2 + dot(p.yz, vec2(8.3, 2.8)));
        float n3 = sin(t * 0.9 + dot(p.zx, vec2(4.1, 6.5)));

        vec3 wobble = vec3(n1, n2, n3) * (uWobbleAmp * alive);

        // Gentle breathing modulation
        float breathe = 1.0 + (0.012 * alive) * sin(uTime * 0.45);

        p = p * breathe + wobble;

        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = uPointSize;
      }
    `,
    fragmentShader: `
      void main() {
        vec2 uv = gl_PointCoord.xy - 0.5;
        float d = dot(uv, uv);
        float a = smoothstep(0.25, 0.0, d);
        gl_FragColor = vec4(vec3(1.0), a);
      }
    `,
  });

  const points = new THREE.Points(geom, material);
  scene.add(points);

  let composer = null;
  try {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new BloomEffect({ intensity: 1 });
    composer.addPass(new EffectPass(camera, bloom));
  } catch (e) {
    console.warn("Postprocessing disabled (composer init failed):", e);
    composer = null;
  }

  const onResize = () => {
    const rect = wrap.getBoundingClientRect();
  
    const cssW = Math.max(1, rect.width);
    const cssH = Math.max(1, rect.height);
  
    // GPU caps
    const maxTex = renderer.capabilities.maxTextureSize || 8192;
    const maxRb = renderer.capabilities.maxRenderbufferSize || maxTex;
    const max = Math.min(maxTex, maxRb);
  
    // Desired DPR (your preference)
    const desiredDpr = Math.min(window.devicePixelRatio || 1, 2);
  
    // Clamp DPR so drawing buffer fits GPU limits
    let dpr = desiredDpr;
    let pixelW = Math.round(cssW * dpr);
    let pixelH = Math.round(cssH * dpr);
  
    if (pixelW > max || pixelH > max) {
      const scale = Math.min(max / pixelW, max / pixelH);
      dpr = Math.max(0.5, dpr * scale); // allow < 1 to avoid GPU errors
      pixelW = Math.round(cssW * dpr);
      pixelH = Math.round(cssH * dpr);
    }
  
    renderer.setPixelRatio(dpr);
  
    // Keep points visually stable across DPR changes
    uniforms.uPointSize.value = BASE_POINT_SIZE * dpr;
  
    renderer.setSize(cssW, cssH, false);
    if (composer) composer.setSize(cssW, cssH);
  
    fitOrthoToGeometry(camera, geom, wrap, 1.25);
  };
  

  // Respond to *any* size change of the wrapper (devtools docking, layout shifts, zoom quirks)
  const ro = typeof ResizeObserver !== "undefined"
    ? new ResizeObserver(() => onResize())
    : null;
  ro?.observe(wrap);

  window.addEventListener("resize", onResize);
  if (window.visualViewport) window.visualViewport.addEventListener("resize", onResize);

  // Initial + settle
  onResize();
  requestAnimationFrame(() => requestAnimationFrame(onResize));

  let startT = 0;
  const DURATION = 3;
  let uiDelayTimer = 0;
  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }



  function renderFrame() {

    // NEW: auto-start once both source + target are ready, after a hold
    if (!state.uiReady && !state.morphStarted && state.characterReady && state.hasTarget) {
      const elapsed = performance.now() - state.characterReadyAt;

      if (prefersReduced) {
        uniforms.uProgress.value = 1;
        state.uiReady = true;
        state.uiEventQueued = true;
        window.dispatchEvent(new CustomEvent("ui-ready"));
      } else if (elapsed >= autoStartDelayMs) {
        state.morphStarted = true;
        startT = performance.now();
      }
    }


    if (state.disposed) return;

    uniforms.uTime.value = performance.now() * 0.001;

    if (state.morphStarted && !state.uiReady) {
      const t = (performance.now() - startT) / (DURATION * 1000);
      const p = easeInOutCubic(clamp01(t));
      uniforms.uProgress.value = p;

      if (t >= 1) {
        state.uiReady = true;

        // Fire ui-ready 2s after the morph completes (reduced-motion shows immediately)
        if (!state.uiEventQueued) {
          state.uiEventQueued = true;
          if (prefersReduced) {
            window.dispatchEvent(new CustomEvent("ui-ready"));
          } else {
            uiDelayTimer = window.setTimeout(() => {
              if (!state.disposed) window.dispatchEvent(new CustomEvent("ui-ready"));
            }, 250);
          }
        }
      }
    }

    if (composer) composer.render();
    else renderer.render(scene, camera);

    requestAnimationFrame(renderFrame);
  }
  requestAnimationFrame(renderFrame);

  (async () => {
    try {
      const positions = await loadBinPoints("/pointcloud/character.points.bin");
      if (state.disposed) return;

    uniforms.uTime.value = performance.now() * 0.001;

      const N = positions.length / 3;

      // Center the character
      const tmpGeom = new THREE.BufferGeometry();
      tmpGeom.setAttribute("position", new THREE.BufferAttribute(new Float32Array(positions), 3));
      tmpGeom.computeBoundingBox();
      const center = new THREE.Vector3();
      tmpGeom.boundingBox.getCenter(center);

      for (let i = 0; i < positions.length; i += 3) {
        positions[i] -= center.x;
        positions[i + 1] -= center.y;
        positions[i + 2] -= center.z;
      }

      const sortedSource = mortonSortPositions(positions);

      geom.setAttribute("position", new THREE.BufferAttribute(sortedSource, 3));
      geom.setAttribute("aTarget", new THREE.BufferAttribute(new Float32Array(sortedSource), 3));
      geom.computeBoundingBox();

      // Refit once geometry exists
      onResize();

      state.characterReady = true;
      state.characterReadyAt = performance.now();
      console.log("[PCH] character ready at", state.characterReadyAt);



      try {
        const size = new THREE.Vector3();
        geom.boundingBox.getSize(size);

        // Procedural nebula target (intentionally offset so the center stays clean for HTML nav)
        const nebula = makeNebulaTarget(N, { size, rng: nebulaRng });


        // Wobble amplitude scales with the character size (keeps motion subtle at any scale)
        uniforms.uWobbleAmp.value = Math.min(size.x, size.y) * 0.012;

        const nebulaSorted = mortonSortPositions(nebula);
        setTarget(geom, nebulaSorted);
        state.hasTarget = true;

        console.log(
          "[PCH] target (nebula) ready at",
          performance.now(),
          "since character:",
          performance.now() - state.characterReadyAt
        );
      } catch (e) {
        console.warn("Nebula target failed; falling back to grid target:", e);

        const size = new THREE.Vector3();
        geom.boundingBox.getSize(size);

        const grid = makeGridTarget(N, size.x * 0.9, size.y * 0.55);
        const gridSorted = mortonSortPositions(grid);
        setTarget(geom, gridSorted);
        state.hasTarget = true;
      }
    } catch (e) {
      console.error("BIN load failed; keeping placeholder point:", e);
    }
  })();

  return () => {
    state.disposed = true;

    if (uiDelayTimer) window.clearTimeout(uiDelayTimer);

    ro?.disconnect();
    window.removeEventListener("resize", onResize);
    if (window.visualViewport) window.visualViewport.removeEventListener("resize", onResize);

    scene.remove(points);
    geom.dispose();
    material.dispose();
    if (composer) composer.dispose();
    renderer.dispose();

    wrap.__pchMounted = false;
  };
}
