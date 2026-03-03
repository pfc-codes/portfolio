// ============================================================================
// WORK ROUTE — Project cards with overlay detail
// ============================================================================

import content from '../content/content.json';
import { state } from '../state';

const { projects } = content;

export function renderWork(): string {
  return `
    <div class="work-page">
      <div class="grid-container">
        <header class="work-header">
          <span class="kicker">Portfolio</span>
          <h1 class="h1">Work</h1>
        </header>

        <div class="work-grid">
          ${projects.map(project => `
            <article class="work-card" data-project="${project.id}" tabindex="0" role="button" aria-label="View ${project.title}">
              <div class="work-card-image">
                <span class="work-card-id">${project.id.toUpperCase()}</span>
              </div>
              <div class="work-card-body">
                <h2 class="work-card-title">${project.title}</h2>
                <span class="work-card-meta">${project.roleLine}</span>
              </div>
            </article>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderProjectOverlay(projectId: string): string {
  const project = projects.find(p => p.id === projectId);
  if (!project) return '';

  return `
    <article class="project-detail">
      <div class="project-detail-media">
        <span class="project-detail-id">${project.id.toUpperCase()}</span>
      </div>

      <header class="project-detail-header">
        <h2 class="h2">${project.title}</h2>
        <span class="project-detail-meta">${project.roleLine}</span>
      </header>

      <p class="project-detail-summary">${project.summary}</p>

      ${project.items && project.items.length ? `
        <div class="project-detail-items">
          ${project.items.map(item => `
            <a href="${item.href}" class="project-detail-item" target="_blank" rel="noopener">
              <span class="project-detail-item-title">${item.title}</span>
              <span class="project-detail-item-arrow">&nearr;</span>
            </a>
          `).join('')}
        </div>
      ` : ''}

      ${project.bullets.length ? `
        <ul class="project-detail-bullets">
          ${project.bullets.map(b => `<li>${b}</li>`).join('')}
        </ul>
      ` : ''}

      ${project.tools.length ? `
        <div class="project-detail-tools">
          ${project.tools.map(t => `<span class="tool-tag">${t}</span>`).join('')}
        </div>
      ` : ''}

      ${(project.links as Array<{label: string; href: string}>).length ? `
        <div class="project-detail-links">
          ${(project.links as Array<{label: string; href: string}>).map(link => `
            <a href="${link.href}" class="btn btn-ghost" target="_blank" rel="noopener">
              ${link.label} &nearr;
            </a>
          `).join('')}
        </div>
      ` : ''}
    </article>
  `;
}

export function initWorkInteractions(): void {
  const grid = document.querySelector('.work-grid');
  const overlay = document.getElementById('overlay-panel');
  const overlayInner = document.getElementById('overlay-inner');
  const overlayBackdrop = overlay?.querySelector('.overlay-backdrop');
  const overlayClose = overlay?.querySelector('.overlay-close');

  if (!grid || !overlay || !overlayInner) return;

  // Check for deep link
  const urlProject = new URLSearchParams(window.location.search).get('project');
  if (urlProject) {
    openProject(urlProject);
  }

  function openProject(projectId: string) {
    state.setActiveProject(projectId);
    overlayInner!.innerHTML = renderProjectOverlay(projectId);
    overlay!.classList.add('open');
    overlay!.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    (overlayClose as HTMLElement)?.focus();
  }

  function closeProject() {
    overlay!.classList.remove('open');
    overlay!.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  grid.addEventListener('click', (e) => {
    const card = (e.target as HTMLElement).closest('[data-project]');
    if (!card) return;
    const projectId = card.getAttribute('data-project');
    if (projectId) openProject(projectId);
  });

  grid.addEventListener('keydown', (e: Event) => {
    const ke = e as KeyboardEvent;
    if (ke.key === 'Enter' || ke.key === ' ') {
      const card = ke.target as HTMLElement;
      if (card.hasAttribute('data-project')) {
        ke.preventDefault();
        const projectId = card.getAttribute('data-project');
        if (projectId) openProject(projectId);
      }
    }
  });

  overlayBackdrop?.addEventListener('click', closeProject);
  overlayClose?.addEventListener('click', closeProject);
}
