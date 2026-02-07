// ============================================================================
// FULL MODE — Orchestrates the 3D scroll experience
// ============================================================================

import { initScene, startRenderLoop, stopRenderLoop, disposeScene } from './scene';
import {
  initScrollChapters,
  initNavDots,
  onChapterChange,
  disposeChapters,
} from './chapters';
import {
  showChapterOverlay,
  initOverlayKeyboard,
  disposeOverlays,
} from './overlays';
import {
  initInteractions,
  disposeInteractions,
} from './interactions';
import { createPlaceholderScene } from './placeholder';

let isActive = false;
let cleanupKeyboard: (() => void) | null = null;
let cleanupChapterSub: (() => void) | null = null;

function getFullElements(): Record<string, HTMLElement | null> {
  return {
    canvas: document.getElementById('webgl'),
    spacer: document.getElementById('scroll-spacer'),
    overlays: document.getElementById('full-overlays'),
    navDots: document.getElementById('full-nav-dots'),
  };
}

function setFullElementsVisible(visible: boolean): void {
  const els = getFullElements();
  const display = visible ? '' : 'none';

  for (const el of Object.values(els)) {
    if (el) el.style.display = display;
  }

  if (els.canvas && visible) {
    els.canvas.style.display = 'block';
  }
}

// ─── Init Full Mode ─────────────────────────────────────────────────────────

export async function initFullMode(): Promise<void> {
  if (isActive) return;
  isActive = true;

  // Hide lite mode elements
  const app = document.getElementById('app');
  if (app) app.style.display = 'none';

  // Show full mode elements
  setFullElementsVisible(true);

  // Initialize Three.js scene
  const { scene, camera, renderer } = initScene();
  const canvas = renderer.domElement;

  // Add placeholder geometry (no GLB)
  createPlaceholderScene(scene);

  // Show canvas immediately (no loading screen)
  canvas.classList.add('visible');

  // Initialize scroll-driven chapters
  initScrollChapters(camera);

  // Initialize nav dots
  initNavDots();
  const navDots = document.getElementById('full-nav-dots');
  if (navDots) navDots.classList.add('visible');

  // Subscribe to chapter changes → show overlays
  cleanupChapterSub = onChapterChange((index) => {
    showChapterOverlay(index);
  });

  // Show initial overlay (Intro)
  showChapterOverlay(0);

  // Initialize raycasting interactions
  initInteractions(camera, canvas);

  // Initialize keyboard handler for overlays
  cleanupKeyboard = initOverlayKeyboard();

  // Start render loop
  startRenderLoop();

  // Scroll to top
  window.scrollTo(0, 0);
}

// ─── Destroy Full Mode ──────────────────────────────────────────────────────

export function destroyFullMode(): void {
  if (!isActive) return;
  isActive = false;

  stopRenderLoop();

  cleanupKeyboard?.();
  cleanupKeyboard = null;
  cleanupChapterSub?.();
  cleanupChapterSub = null;

  disposeInteractions();
  disposeOverlays();
  disposeChapters();
  disposeScene();

  setFullElementsVisible(false);

  // Reset body scroll
  document.body.style.overflow = '';
  document.body.style.height = '';
  window.scrollTo(0, 0);

  // Show lite mode elements
  const app = document.getElementById('app');
  if (app) app.style.display = '';
}

export function isFullModeActive(): boolean {
  return isActive;
}
