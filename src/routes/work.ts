// ============================================================================
// WORK ROUTE — Client projects with selector + panel layout
// ============================================================================

import content from '../content/content.json';
import { state } from '../state';

const { projects } = content;

export function renderWork(): string {
  const currentState = state.getState();
  const activeId = new URLSearchParams(window.location.search).get('project') || currentState.activeProjectId;
  
  return `
    <div class="work-page">
      <div class="work-layout">
        <!-- Project Selector (Left) -->
        <nav class="project-selector" aria-label="Project list">
          ${projects.map(project => `
            <button 
              class="project-item ${project.id === activeId ? 'active' : ''}" 
              data-project-select="${project.id}"
              aria-pressed="${project.id === activeId}"
            >
              <div class="project-item-title">${project.title}</div>
              <div class="project-item-meta">${project.roleLine} • ${project.year}</div>
            </button>
          `).join('')}
        </nav>

        <!-- Project Panel (Right) -->
        <div class="project-panel" id="project-panel">
          ${renderProjectPanel(activeId)}
        </div>
      </div>
    </div>
  `;
}

function renderProjectPanel(projectId: string): string {
  const project = projects.find(p => p.id === projectId) || projects[0];
  
  return `
    <article class="project-detail" data-project-id="${project.id}">
      <div class="project-media">
        <div class="specimen-media-placeholder">Media Placeholder</div>
      </div>
      
      <header class="project-header">
        <h1 class="project-title">${project.title}</h1>
        <p class="project-role">${project.roleLine} • ${project.year}</p>
      </header>
      
      <p class="project-summary">${project.summary}</p>
      
      ${project.bullets.length ? `
        <ul class="project-bullets">
          ${project.bullets.map(b => `<li>${b}</li>`).join('')}
        </ul>
      ` : ''}
      
      ${project.tools.length ? `
        <div class="project-tools">
          ${project.tools.map(t => `<span class="project-tool">${t}</span>`).join('')}
        </div>
      ` : ''}
      
      ${project.links.length ? `
        <div class="project-links">
          ${project.links.map(link => `
            <a href="${link.href}" class="btn btn-ghost" target="_blank" rel="noopener">
              ${link.label} ↗
            </a>
          `).join('')}
        </div>
      ` : ''}
    </article>
  `;
}

export function initWorkInteractions(): void {
  const selector = document.querySelector('.project-selector');
  const panel = document.getElementById('project-panel');

  if (!selector || !panel) return;

  selector.addEventListener('click', (e) => {
    const button = (e.target as HTMLElement).closest('[data-project-select]');
    if (!button) return;

    const projectId = button.getAttribute('data-project-select');
    if (!projectId) return;

    // Update active state
    state.setActiveProject(projectId);

    // Update URL without navigation
    const url = new URL(window.location.href);
    url.searchParams.set('project', projectId);
    history.replaceState(null, '', url.toString());

    // Update button states
    selector.querySelectorAll('.project-item').forEach(item => {
      const isActive = item.getAttribute('data-project-select') === projectId;
      item.classList.toggle('active', isActive);
      item.setAttribute('aria-pressed', String(isActive));
    });

    // Fade out panel
    panel.style.opacity = '0';
    
    setTimeout(() => {
      // Update panel content
      panel.innerHTML = renderProjectPanel(projectId);
      
      // Fade in
      panel.style.opacity = '1';
    }, 180);
  });

  // Add transition style
  panel.style.transition = 'opacity 180ms ease';
}
