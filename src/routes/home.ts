// ============================================================================
// HOME ROUTE — Landing page with chapters
// ============================================================================

import content from '../content/content.json';

// SVG Sigil placeholders (geometric shapes)
const sigils = [
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="50" cy="50" r="15" fill="currentColor"/></svg>`,
  `<svg viewBox="0 0 100 100"><rect x="20" y="20" width="60" height="60" fill="none" stroke="currentColor" stroke-width="2" transform="rotate(45 50 50)"/></svg>`,
  `<svg viewBox="0 0 100 100"><polygon points="50,15 85,85 15,85" fill="none" stroke="currentColor" stroke-width="2"/></svg>`,
  `<svg viewBox="0 0 100 100"><path d="M50 10 L90 50 L50 90 L10 50 Z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="50" cy="50" r="12" fill="currentColor"/></svg>`,
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" stroke-width="2"/><line x1="15" y1="50" x2="85" y2="50" stroke="currentColor" stroke-width="2"/><line x1="50" y1="15" x2="50" y2="85" stroke="currentColor" stroke-width="2"/></svg>`,
];

export function renderHome(): string {
  const { homeHero, projects } = content;

  return `
    <!-- Chapter 1: Hero / Identity -->
    <section class="hero-section hero-centered section" data-chapter="0">
      <div class="hero-portrait">
        <div class="hero-portrait-placeholder"></div>
      </div>
      <div class="hero-content">
        <h1 class="hero-title">${homeHero.title}</h1>
        <p class="hero-subtitle">${homeHero.subtitle}</p>
        <div class="hero-ctas">
          <a href="/lite/work" class="btn btn-primary" data-link>${homeHero.ctaPrimary.label}</a>
          <a href="/lite/lab" class="btn btn-ghost" data-link>${homeHero.ctaSecondary.label}</a>
          <a href="/lite/contact" class="btn btn-ghost" data-link>${homeHero.ctaTertiary.label}</a>
        </div>
      </div>
    </section>

    <!-- Chapter 2: Work Preview / Sigil Rail -->
    <section class="sigil-section sigil-section--centered section" data-chapter="1">
      <div class="section-header" style="text-align: center;">
        <span class="kicker">Selected Work</span>
        <h2 class="h2">Client Projects</h2>
      </div>
      <div class="sigil-rail-wrapper">
        <div class="sigil-rail sigil-rail--centered">
          ${projects.map((project, i) => `
            <a href="/lite/work?project=${project.id}" class="sigil-card sigil-card--mono" data-link data-project="${project.id}">
              <div class="sigil-icon">
                ${sigils[i % sigils.length]}
              </div>
              <div class="sigil-label">${project.title}</div>
              <div class="sigil-role">${project.roleLine}</div>
            </a>
          `).join('')}
        </div>
      </div>
      <div class="sigil-cta" style="text-align: center;">
        <a href="/lite/work" class="btn btn-ghost" data-link>View All Work →</a>
      </div>
    </section>

    <!-- Chapter 3: Lab Portal -->
    <section class="portal-section section" data-chapter="2">
      <div class="section-inner">
        <div class="lab-portal">
          <span class="portal-kicker">Experiments</span>
          <h2 class="portal-title">Lab</h2>
          <p class="portal-text">
            A sterile environment for constraint-based experiments,
            specimens, and technical studies.
          </p>
          <a href="/lite/lab" class="btn portal-cta" data-link>Enter Lab</a>
        </div>
      </div>
    </section>

    <!-- Chapter 4: Contact (Simple) -->
    <section class="contact-home-section section" data-chapter="3">
      <div class="section-inner" style="text-align: center; display: flex; flex-direction: column; align-items: center;">
        <span class="kicker">Contact</span>
        <h2 class="h2" style="margin-bottom: 1.5rem;">Let's Build Something</h2>
        <p class="body-text" style="margin-bottom: 2rem;">Get in touch — I'm always open to new projects and collaborations.</p>
        <div class="hero-ctas" style="justify-content: center;">
          <a href="mailto:${content.contact.email}" class="btn btn-primary">Email Me</a>
          <a href="/lite/contact" class="btn btn-ghost" data-link>Contact →</a>
        </div>
      </div>
    </section>
  `;
}

// No-op observer (section dots removed)
export function initHomeChapterObserver(): void {
  // Side nav dots have been removed
}

export function cleanupHome(): void {
  // Nothing to clean up
}
