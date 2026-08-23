// ============================================================================
// MAIN — 2D Portfolio Entry Point with Landing Page
// ============================================================================

import './styles/base.css';
import './styles/void.css';
import './styles/lab.css';

import { router } from './router';
import { state } from './state';
import { renderHome } from './routes/home';
import { renderWork, initWorkInteractions } from './routes/work';
import { renderLab, initLabInteractions, cleanupLab } from './routes/lab';
import { renderContact } from './routes/contact';
import { initLandingSplat } from './full/landing-splat';

// ============================================================================
// ROUTE DEFINITIONS
// ============================================================================

let currentCleanup: (() => void) | null = null;

router.addRoute('/', async () => {
  if (currentCleanup) { currentCleanup(); currentCleanup = null; }
  return renderHome();
});

router.addRoute('/work', async () => {
  if (currentCleanup) { currentCleanup(); currentCleanup = null; }
  const html = renderWork();
  setTimeout(() => initWorkInteractions(), 50);
  return html;
});

router.addRoute('/lab', async () => {
  if (currentCleanup) { currentCleanup(); currentCleanup = null; }
  const html = renderLab();
  setTimeout(() => {
    const cleanup = initLabInteractions();
    currentCleanup = () => {
      cleanupLab();
      if (typeof cleanup === 'function') cleanup();
    };
  }, 50);
  return html;
});

router.addRoute('/contact', async () => {
  if (currentCleanup) { currentCleanup(); currentCleanup = null; }
  return renderContact();
});

// ============================================================================
// LANDING PAGE — p.h.r.o. animation + Gaussian splat
// ============================================================================

let landingDismissed = false;

function showLanding(): void {
  const landing = document.getElementById('landing');
  if (!landing) return;
  landing.style.display = '';
  landing.classList.remove('dismissed');

  // Hide app + nav
  const app = document.getElementById('app');
  if (app) { app.style.display = 'none'; app.classList.add('hidden'); }
  document.getElementById('site-nav')?.classList.add('hidden');

  // Start letter animation
  animateLetters();

  // Load Gaussian splat
  const container = document.getElementById('landing-splat-container');
  if (container) {
    initLandingSplat(container);
  }
}

function animateLetters(): void {
  const chars = document.querySelectorAll<HTMLElement>('.landing-letter, .landing-dot');
  const content = document.getElementById('landing-content');
  const intro = document.getElementById('landing-intro');

  const stagger = 250;
  const initialDelay = 250;

  chars.forEach((char, i) => {
    char.style.transitionDelay = `${initialDelay + i * stagger}ms`;
  });

  requestAnimationFrame(() => {
    chars.forEach((char) => char.classList.add('visible'));
  });

  const totalDelay = initialDelay + chars.length * stagger + 350;

  setTimeout(() => {
    if (intro) intro.classList.add('fade-out');

    setTimeout(() => {
      if (intro) intro.style.display = 'none';
      document.getElementById('landing-splat-container')?.classList.add('visible');
      if (content) content.classList.add('visible');

      // Double click anywhere on the landing splat to reveal socials
      document.getElementById('landing')?.addEventListener('dblclick', handleLandingDoubleClick);
      document.getElementById('landing-social-close')?.addEventListener('click', closeSocialOverlay);
    }, 400);
  }, totalDelay);
}

function handleLandingDoubleClick(e: MouseEvent): void {
  const target = e.target as HTMLElement;
  if (target.closest('a, button')) return;

  openSocialOverlay();
}

function openSocialOverlay(): void {
  document.getElementById('landing-social-overlay')?.classList.add('open');
  document.getElementById('landing-social-overlay')?.setAttribute('aria-hidden', 'false');
}

function closeSocialOverlay(): void {
  document.getElementById('landing-social-overlay')?.classList.remove('open');
  document.getElementById('landing-social-overlay')?.setAttribute('aria-hidden', 'true');
}

// ============================================================================
// KEYBOARD SHORTCUTS
// ============================================================================

function initKeyboardShortcuts(): void {
  document.addEventListener('keydown', (e) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

    if (landingDismissed) {
      switch (e.key) {
        case '1': router.navigate('/'); break;
        case '2': router.navigate('/work'); break;
        case '3': router.navigate('/lab'); break;
        case '4': router.navigate('/contact'); break;
      }
    }

    if (e.key === 'Escape') {
      const overlay = document.getElementById('overlay-panel');
      if (overlay?.classList.contains('open')) {
        overlay.classList.remove('open');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }
    }
  });
}

// ============================================================================
// ROUTE HANDLING ON PAGE LOAD
// ============================================================================

function handleInitialRoute(): void {
  const path = window.location.pathname;

  if (path === '/' || path === '') {
    // Show landing
    showLanding();
  } else {
    // Deep link — skip landing, go straight to route
    landingDismissed = true;
    const landing = document.getElementById('landing');
    if (landing) landing.style.display = 'none';

    const app = document.getElementById('app');
    if (app) {
      app.style.display = '';
      app.classList.remove('hidden');
    }
    document.getElementById('site-nav')?.classList.remove('hidden');

    router.init(app!, (path) => {
      state.setState({ currentRoute: path });
    });
  }
}

// ============================================================================
// INIT
// ============================================================================

function init(): void {
  initKeyboardShortcuts();
  handleInitialRoute();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
