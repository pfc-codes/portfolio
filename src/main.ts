import './styles/atlas.css';
import { setupMedia } from './media/tiles';

async function init() {
  if (import.meta.env.DEV) {
    const { render } = await import('./render');
    const page = render(location.pathname);
    document.querySelector('#app')!.innerHTML = page.body;
    document.title = page.title;
  }
  const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const nav = document.querySelector<HTMLElement>('#site-nav');
  if (toggle && nav) {
    const mobile = matchMedia('(max-width:700px)');
    const close = () => { nav.dataset.open = 'false'; toggle.setAttribute('aria-expanded', 'false'); toggle.textContent = 'Menu +'; };
    const sync = () => { toggle.hidden = !mobile.matches; close(); };
    nav.dataset.enhanced = 'true'; sync(); mobile.addEventListener('change', sync);
    toggle.addEventListener('click', () => {
      const open = nav.dataset.open !== 'true'; nav.dataset.open = String(open);
      toggle.setAttribute('aria-expanded', String(open)); toggle.textContent = open ? 'Close −' : 'Menu +';
    });
    nav.addEventListener('click', close);
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && nav.dataset.open === 'true') { close(); toggle.focus(); } });
  }
  const copy = document.querySelector<HTMLButtonElement>('[data-copy-email]');
  if (copy && navigator.clipboard?.writeText) {
    copy.hidden = false;
    copy.addEventListener('click', async () => {
      const status = document.querySelector<HTMLElement>('[data-copy-status]')!;
      try { await navigator.clipboard.writeText(copy.dataset.copyEmail!); status.textContent = 'Email address copied.'; }
      catch { status.textContent = 'Select the email address to copy it or open your email app.'; }
    });
  }
  document.querySelectorAll<HTMLVideoElement>('[data-project-video]').forEach(video => {
    video.addEventListener('error', () => { const message = video.closest('figure')?.querySelector<HTMLElement>('[data-video-error]'); if (message) message.hidden = false; });
  });
  document.querySelectorAll<HTMLElement>('[data-youtube]').forEach(facade => {
    const button = facade.querySelector<HTMLButtonElement>('[data-youtube-load]')!;
    button.hidden = false;
    button.addEventListener('click', () => {
      const id = facade.dataset.youtube!;
      if (!/^[a-zA-Z0-9_-]{11}$/.test(id)) return;
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
      iframe.title = facade.dataset.videoTitle!;
      iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      iframe.allowFullscreen = true; iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      facade.replaceChildren(iframe); iframe.focus();
    });
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) document.querySelectorAll('video').forEach(v => v.pause()); });
  addEventListener('pagehide', () => document.querySelectorAll('video').forEach(v => v.pause()));
  setupMedia();
  if (document.querySelector('[data-splat-load]')) {
    const { setupSpatialStudy } = await import('./features/spatial-study');
    setupSpatialStudy();
  }
}
void init();
