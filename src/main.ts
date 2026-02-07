// ============================================================================
// MAIN — Dual-mode Entry Point with Landing Page
// ============================================================================

import './styles/base.css';
import './styles/void.css';
import './styles/lab.css';
import './style.css';

import { router } from './router';
import { state } from './state';
import { renderHome, initHomeChapterObserver, cleanupHome } from './routes/home';
import { renderWork, initWorkInteractions } from './routes/work';
import { renderLab, initLabInteractions, cleanupLab } from './routes/lab';
import { renderContact, initContactInteractions } from './routes/contact';
import { initFullMode, destroyFullMode, isFullModeActive } from './full/index';
import { initLandingSplat, disposeLandingSplat, animateSplatDown } from './full/landing-splat';

// ============================================================================
// LITE ROUTE DEFINITIONS
// ============================================================================

let currentCleanup: (() => void) | null = null;
let liteInitialized = false;

router.addRoute('/lite', async () => {
  if (currentCleanup) { currentCleanup(); currentCleanup = null; }
  const html = renderHome();
  setTimeout(() => {
    initHomeChapterObserver();
    currentCleanup = cleanupHome;
  }, 50);
  return html;
}, 'void');

router.addRoute('/lite/work', async () => {
  if (currentCleanup) { currentCleanup(); currentCleanup = null; }
  const html = renderWork();
  setTimeout(() => initWorkInteractions(), 50);
  return html;
}, 'void');

router.addRoute('/lite/lab', async () => {
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
}, 'lab');

router.addRoute('/lite/contact', async () => {
  if (currentCleanup) { currentCleanup(); currentCleanup = null; }
  const html = renderContact();
  setTimeout(() => {
    const cleanup = initContactInteractions();
    if (typeof cleanup === 'function') currentCleanup = cleanup;
  }, 50);
  return html;
}, 'void');

// ============================================================================
// THEME SWITCHING
// ============================================================================

function setTheme(theme: 'void' | 'lab'): void {
  document.body.classList.remove('theme-void', 'theme-lab');
  document.body.classList.add(`theme-${theme}`);
}

// ============================================================================
// LANDING PAGE — p.h.r.o. animation + Gaussian splat
// ============================================================================

function showLanding(): void {
  const landing = document.getElementById('landing');
  if (!landing) return;
  landing.style.display = '';
  landing.classList.remove('dismissed');

  // Hide everything else
  hideAll();

  // Start letter animation
  animateLetters();

  // Start loading Gaussian splat in background
  const container = document.getElementById('landing-splat-container');
  if (container) {
    initLandingSplat(container);
  }
}

function animateLetters(): void {
  const chars = document.querySelectorAll<HTMLElement>('.landing-letter, .landing-dot');
  const content = document.getElementById('landing-content');
  const intro = document.getElementById('landing-intro');

  const stagger = 250;  // ms between each character
  const initialDelay = 250; // ms before first character

  // Set transition-delay on each character, then trigger all at once
  chars.forEach((char, i) => {
    char.style.transitionDelay = `${initialDelay + i * stagger}ms`;
  });

  // Add visible to all in one frame — CSS transition-delay handles the stagger
  requestAnimationFrame(() => {
    chars.forEach((char) => char.classList.add('visible'));
  });

  // Total: initial(250) + 8 chars(2000) + pause(350) = 2600ms
  const totalDelay = initialDelay + chars.length * stagger + 350;

  setTimeout(() => {
    if (intro) intro.classList.add('fade-out');

    // 2600 + 400 = 3000ms to content reveal
    setTimeout(() => {
      if (intro) intro.style.display = 'none';
      document.getElementById('landing-splat-container')?.classList.add('visible');
      if (content) content.classList.add('visible');
    }, 400);
  }, totalDelay);
}

function dismissLanding(): void {
  const landing = document.getElementById('landing');
  if (landing) {
    landing.classList.add('dismissed');
    setTimeout(() => { landing.style.display = 'none'; }, 600);
  }
  disposeLandingSplat();
}

// ============================================================================
// NAVIGATION HELPERS
// ============================================================================

function hideAll(): void {
  // Hide lite
  const app = document.getElementById('app');
  if (app) { app.style.display = 'none'; app.classList.add('hidden'); }
  document.getElementById('lite-nav')?.classList.add('hidden');

  // Hide full
  document.getElementById('full-nav')?.classList.add('hidden');
  const webgl = document.getElementById('webgl');
  if (webgl) webgl.style.display = 'none';
  const spacer = document.getElementById('scroll-spacer');
  if (spacer) spacer.style.display = 'none';
  const overlays = document.getElementById('full-overlays');
  if (overlays) overlays.style.display = 'none';
  const navDots = document.getElementById('full-nav-dots');
  if (navDots) navDots.style.display = 'none';
}

function showLiteMode(): void {
  dismissLanding();
  if (isFullModeActive()) destroyFullMode();

  const app = document.getElementById('app');
  if (app) {
    app.style.display = '';
    app.classList.remove('hidden');
  }

  document.getElementById('lite-nav')?.classList.remove('hidden');
  document.getElementById('full-nav')?.classList.add('hidden');

  if (!liteInitialized) {
    router.init(app!, (path, theme) => {
      setTheme(theme);
      state.setState({ currentRoute: path });
    });
    liteInitialized = true;
  } else {
    // Navigate to the current path or home
    const path = window.location.pathname;
    if (path.startsWith('/lite')) {
      router.navigate(path);
    } else {
      history.replaceState(null, '', '/lite');
      router.navigate('/lite');
    }
  }

  state.setState({ mode: 'lite' });
}

async function showFullMode(): Promise<void> {
  dismissLanding();

  // Hide lite
  const app = document.getElementById('app');
  if (app) { app.style.display = 'none'; app.classList.add('hidden'); }
  document.getElementById('lite-nav')?.classList.add('hidden');

  // Show 3D nav
  document.getElementById('full-nav')?.classList.remove('hidden');

  history.replaceState(null, '', '/3D');
  state.setState({ mode: 'full' });

  await initFullMode();
}

async function enterFullMode(): Promise<void> {
  const control = document.getElementById('segment-control');
  if (control) control.style.pointerEvents = 'none';

  // Fade out the landing content while camera animates
  const content = document.getElementById('landing-content');
  if (content) {
    content.style.transition = 'opacity 500ms ease';
    content.style.opacity = '0';
  }

  // Animate the splat camera downward into black
  await animateSplatDown(700);

  // Now dismiss landing and show 3D
  await showFullMode();
}

// ============================================================================
// MODE TOGGLE BUTTONS
// ============================================================================

function initModeToggles(): void {
  // Lite → Full
  const litToggle = document.getElementById('mode-toggle-lite');
  litToggle?.addEventListener('click', () => {
    showFullMode();
  });

  // Full → Lite
  const fullToggle = document.getElementById('mode-toggle-full');
  fullToggle?.addEventListener('click', () => {
    destroyFullMode();
    document.getElementById('full-nav')?.classList.add('hidden');
    history.pushState(null, '', '/lite');
    showLiteMode();
  });
}

// ============================================================================
// LANDING BUTTON HANDLERS
// ============================================================================

function initSegmentControl(): void {
  const btnFull = document.getElementById('btn-full');
  const btnStandard = document.getElementById('btn-standard');
  const indicator = document.querySelector<HTMLElement>('.segment-indicator');

  function setActive(mode: 'full' | 'standard') {
    btnFull?.classList.toggle('active', mode === 'full');
    btnStandard?.classList.toggle('active', mode === 'standard');
    indicator?.classList.toggle('right', mode === 'standard');
  }

  btnFull?.addEventListener('click', () => {
    setActive('full');
    enterFullMode();
  });

  btnStandard?.addEventListener('click', () => {
    setActive('standard');
    history.pushState(null, '', '/lite');
    showLiteMode();
  });
}

// ============================================================================
// KEYBOARD SHORTCUTS
// ============================================================================

function initKeyboardShortcuts(): void {
  document.addEventListener('keydown', (e) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

    // Lite mode number shortcuts
    if (!isFullModeActive() && state.getState().mode === 'lite') {
      switch (e.key) {
        case '1': router.navigate('/lite'); break;
        case '2': router.navigate('/lite/work'); break;
        case '3': router.navigate('/lite/lab'); break;
        case '4': router.navigate('/lite/contact'); break;
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

  if (path === '/3D') {
    showFullMode();
  } else if (path.startsWith('/lite')) {
    showLiteMode();
  } else {
    // Root or unknown → show landing
    showLanding();
  }
}

// ============================================================================
// INIT
// ============================================================================

function init(): void {
  initSegmentControl();
  initModeToggles();
  initKeyboardShortcuts();

  // Handle popstate (browser back/forward)
  window.addEventListener('popstate', () => {
    const path = window.location.pathname;
    if (path === '/3D') {
      showFullMode();
    } else if (path.startsWith('/lite')) {
      if (isFullModeActive()) {
        destroyFullMode();
        document.getElementById('full-nav')?.classList.add('hidden');
      }
      showLiteMode();
    } else {
      if (isFullModeActive()) {
        destroyFullMode();
        document.getElementById('full-nav')?.classList.add('hidden');
      }
      showLanding();
    }
  });

  handleInitialRoute();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
