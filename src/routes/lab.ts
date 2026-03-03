// ============================================================================
// LAB ROUTE — Experiments grid with overlay panel
// ============================================================================

import content from '../content/content.json';
import { state } from '../state';

const { experiments, lab } = content;

export function renderLab(): string {
  return `
    <div class="lab-page">
      <div class="grid-container">
        <header class="lab-header">
          <span class="kicker">Experiments</span>
          <h1 class="h1">${lab.heading}</h1>
          <p class="lab-subtitle">${lab.subheading}</p>
        </header>

        <div class="specimen-grid">
          ${experiments.map(exp => `
            <article class="specimen-card" data-experiment="${exp.id}" tabindex="0" role="button" aria-label="View ${exp.title}">
              <div class="specimen-media">
                <span class="specimen-id">${exp.id.toUpperCase()}</span>
              </div>
              <div class="specimen-body">
                <span class="specimen-label">${exp.label}</span>
                <h2 class="specimen-title">${exp.title}</h2>
                <p class="specimen-summary">${exp.summary.substring(0, 100)}${exp.summary.length > 100 ? '...' : ''}</p>
                ${exp.constraints.length ? `
                  <div class="specimen-constraints">
                    ${exp.constraints.map(c => `<span class="constraint-tag">${c}</span>`).join('')}
                  </div>
                ` : ''}
              </div>
            </article>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderExperimentPanel(experimentId: string): string {
  const experiment = experiments.find(e => e.id === experimentId);
  if (!experiment) return '';

  return `
    <div class="experiment-detail">
      <div class="experiment-media">
        <span class="experiment-id">${experiment.id.toUpperCase()}</span>
      </div>

      <span class="experiment-label">${experiment.label}</span>
      <h2 class="h2" style="margin-bottom: var(--sp-2);">${experiment.title}</h2>
      <p class="experiment-summary">${experiment.summary}</p>

      ${experiment.constraints.length ? `
        <div class="experiment-constraints">
          <h3 class="experiment-constraints-title">Constraints</h3>
          <div class="experiment-constraints-list">
            ${experiment.constraints.map(c => `
              <span class="constraint-tag">${c}</span>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${experiment.notes ? `
        <p class="experiment-notes">${experiment.notes}</p>
      ` : ''}
    </div>
  `;
}

export function initLabInteractions(): (() => void) | void {
  const grid = document.querySelector('.specimen-grid');
  const overlay = document.getElementById('overlay-panel');
  const overlayInner = document.getElementById('overlay-inner');
  const overlayBackdrop = overlay?.querySelector('.overlay-backdrop');
  const overlayClose = overlay?.querySelector('.overlay-close');

  if (!grid || !overlay || !overlayInner) return;

  const openExperiment = (experimentId: string) => {
    state.setActiveExperiment(experimentId);
    overlayInner.innerHTML = renderExperimentPanel(experimentId);
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    (overlayClose as HTMLElement)?.focus();
  };

  const closeExperiment = () => {
    state.setActiveExperiment(null);
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  grid.addEventListener('click', (e) => {
    const card = (e.target as HTMLElement).closest('[data-experiment]');
    if (!card) return;
    const experimentId = card.getAttribute('data-experiment');
    if (experimentId) openExperiment(experimentId);
  });

  grid.addEventListener('keydown', (e: Event) => {
    const ke = e as KeyboardEvent;
    if (ke.key === 'Enter' || ke.key === ' ') {
      const card = ke.target as HTMLElement;
      if (card.hasAttribute('data-experiment')) {
        ke.preventDefault();
        const experimentId = card.getAttribute('data-experiment');
        if (experimentId) openExperiment(experimentId);
      }
    }
  });

  overlayBackdrop?.addEventListener('click', closeExperiment);
  overlayClose?.addEventListener('click', closeExperiment);

  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) {
      closeExperiment();
    }
  };
  document.addEventListener('keydown', handleEscape);

  return () => {
    document.removeEventListener('keydown', handleEscape);
  };
}

export function cleanupLab(): void {
  const overlay = document.getElementById('overlay-panel');
  if (overlay?.classList.contains('open')) {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  state.setActiveExperiment(null);
}
