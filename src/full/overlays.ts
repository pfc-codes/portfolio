// ============================================================================
// OVERLAYS — HTML overlays that appear at each chapter in full 3D mode
// ============================================================================

import content from '../content/content.json';

const OVERLAY_IDS = ['overlay-intro', 'overlay-works', 'overlay-labs', 'overlay-contact'];

let terminalTypingTimeout: ReturnType<typeof setTimeout> | null = null;
let terminalHasPlayed = false;

// ─── Show/Hide by Chapter ───────────────────────────────────────────────────

export function showChapterOverlay(index: number): void {
  OVERLAY_IDS.forEach((id, i) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle('active', i === index);
  });

  // Trigger contact terminal auto-type when entering Contact chapter
  if (index === 3 && !terminalHasPlayed) {
    terminalHasPlayed = true;
    setTimeout(() => playTerminalSequence(), 400);
  }
}

export function hideAllOverlays(): void {
  OVERLAY_IDS.forEach(id => {
    document.getElementById(id)?.classList.remove('active');
  });
}

// ─── Works Detail Panel ─────────────────────────────────────────────────────

export function showWorksDetail(projectId: string): void {
  const project = content.projects.find(p => p.id === projectId);
  if (!project) return;

  const inner = document.getElementById('works-detail-inner');
  const panel = document.getElementById('works-detail-panel');
  if (!inner || !panel) return;

  inner.innerHTML = `
    <div class="project-detail-full">
      <h2 class="project-title">${project.title}</h2>
      <p class="project-role">${project.roleLine} — ${project.year}</p>
      <p class="project-summary">${project.summary}</p>
      <ul class="project-bullets">
        ${project.bullets.map(b => `<li>${b}</li>`).join('')}
      </ul>
      <div class="project-tools">
        ${project.tools.map(t => `<span class="tool-tag">${t}</span>`).join('')}
      </div>
      ${project.links.length > 0 ? `
        <div class="project-links">
          ${project.links.map(l => `<a href="${l.href}" target="_blank" rel="noopener">${l.label} &rarr;</a>`).join('')}
        </div>
      ` : ''}
    </div>
  `;

  panel.style.display = 'block';
  requestAnimationFrame(() => panel.classList.add('visible'));

  // Close button
  const closeBtn = panel.querySelector('.panel-close');
  closeBtn?.addEventListener('click', closeWorksDetail, { once: true });
}

export function closeWorksDetail(): void {
  const panel = document.getElementById('works-detail-panel');
  if (!panel) return;
  panel.classList.remove('visible');
  setTimeout(() => { panel.style.display = 'none'; }, 300);
}

// ─── Lab Overlay ────────────────────────────────────────────────────────────

export function showSpecimenDetail(experimentId: string): void {
  const experiment = content.experiments.find(e => e.id === experimentId);
  if (!experiment) return;

  const inner = document.getElementById('specimen-detail-inner');
  const panel = document.getElementById('specimen-detail-panel');
  if (!inner || !panel) return;

  inner.innerHTML = `
    <div class="specimen-detail-full">
      <p class="specimen-label">${experiment.label}</p>
      <h2 class="specimen-title">${experiment.title}</h2>
      <p class="specimen-summary">${experiment.summary}</p>
      <div class="specimen-constraints">
        ${experiment.constraints.map(c => `<span class="constraint-tag">${c}</span>`).join('')}
      </div>
      ${experiment.notes ? `<p class="specimen-notes"><em>${experiment.notes}</em></p>` : ''}
    </div>
  `;

  panel.style.display = 'block';
  requestAnimationFrame(() => panel.classList.add('visible'));

  const closeBtn = panel.querySelector('.panel-close');
  closeBtn?.addEventListener('click', closeSpecimenDetail, { once: true });
}

export function closeSpecimenDetail(): void {
  const panel = document.getElementById('specimen-detail-panel');
  if (!panel) return;
  panel.classList.remove('visible');
  setTimeout(() => { panel.style.display = 'none'; }, 300);
}

// ─── Contact Terminal ───────────────────────────────────────────────────────

function playTerminalSequence(): void {
  const output = document.getElementById('terminal-output');
  if (!output) return;

  output.innerHTML = '';

  const lines = [
    { text: '> whoami', delay: 0, cls: 'cmd' },
    { text: 'Pietro Francis — Creative Developer', delay: 600, cls: 'response' },
    { text: '', delay: 1000, cls: '' },
    { text: '> email', delay: 1200, cls: 'cmd' },
    {
      text: `<a href="mailto:${content.contact.email}" class="terminal-link">${content.contact.email}</a>`,
      delay: 1800,
      cls: 'response',
    },
    { text: '', delay: 2200, cls: '' },
    { text: '> links', delay: 2400, cls: 'cmd' },
    ...content.contact.links.map((link, i) => ({
      text: `<a href="${link.href}" target="_blank" rel="noopener" class="terminal-link">${link.label}</a>`,
      delay: 3000 + i * 400,
      cls: 'response',
    })),
    { text: '', delay: 3000 + content.contact.links.length * 400 + 200, cls: '' },
    { text: '> resume', delay: 3000 + content.contact.links.length * 400 + 400, cls: 'cmd' },
    {
      text: `<a href="${content.contact.resumeUrl}" target="_blank" rel="noopener" class="terminal-link">Download PDF &darr;</a>`,
      delay: 3000 + content.contact.links.length * 400 + 800,
      cls: 'response',
    },
  ];

  for (const line of lines) {
    terminalTypingTimeout = setTimeout(() => {
      const div = document.createElement('div');
      div.className = `terminal-line-item ${line.cls}`;
      div.innerHTML = line.text;
      output.appendChild(div);
      output.scrollTop = output.scrollHeight;
    }, line.delay);
  }
}

// ─── Escape Key Close ───────────────────────────────────────────────────────

export function initOverlayKeyboard(): () => void {
  function onKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      closeWorksDetail();
      closeSpecimenDetail();
    }
  }
  document.addEventListener('keydown', onKeyDown);
  return () => document.removeEventListener('keydown', onKeyDown);
}

// ─── Cleanup ────────────────────────────────────────────────────────────────

export function disposeOverlays(): void {
  hideAllOverlays();
  if (terminalTypingTimeout !== null) {
    clearTimeout(terminalTypingTimeout);
    terminalTypingTimeout = null;
  }
  terminalHasPlayed = false;

  // Clear panel contents
  const worksInner = document.getElementById('works-detail-inner');
  if (worksInner) worksInner.innerHTML = '';
  const specimenInner = document.getElementById('specimen-detail-inner');
  if (specimenInner) specimenInner.innerHTML = '';
  const terminalOutput = document.getElementById('terminal-output');
  if (terminalOutput) terminalOutput.innerHTML = '';
}
