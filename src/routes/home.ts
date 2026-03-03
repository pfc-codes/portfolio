// ============================================================================
// HOME ROUTE — Hero + selected work + about + CTAs
// ============================================================================

import content from '../content/content.json';

export function renderHome(): string {
  const { homeHero, projects } = content;

  return `
    <div class="home-page">
      <!-- Hero -->
      <section class="home-hero">
        <div class="grid-container">
          <div class="home-hero-inner">
            <h1 class="display">${homeHero.title}</h1>
            <p class="home-hero-subtitle">${homeHero.subtitle}</p>
            <div class="home-hero-ctas">
              <a href="/work" class="btn btn-primary" data-link>View Work</a>
              <a href="/lab" class="btn btn-ghost" data-link>Enter Lab</a>
              <a href="/contact" class="btn btn-ghost" data-link>Contact</a>
            </div>
          </div>
        </div>
      </section>

      <!-- Selected Work -->
      <section class="home-work">
        <div class="grid-container">
          <span class="kicker">Work</span>
          <h2 class="h2" style="margin-bottom: var(--sp-5);">Selected Projects</h2>
          <div class="home-work-grid">
            ${projects.map(project => `
              <a href="/work?project=${project.id}" class="home-project-card" data-link>
                <div class="home-project-image">
                  <span class="home-project-id">${project.id.toUpperCase()}</span>
                </div>
                <div class="home-project-info">
                  <h3 class="home-project-title">${project.title}</h3>
                  <span class="home-project-meta">${project.roleLine}</span>
                </div>
              </a>
            `).join('')}
          </div>
          <div style="margin-top: var(--sp-5);">
            <a href="/work" class="btn btn-ghost" data-link>All Work &rarr;</a>
          </div>
        </div>
      </section>

      <!-- About Statement -->
      <section class="home-about">
        <div class="grid-container">
          <div class="home-about-inner">
            <span class="kicker">About</span>
            <p class="home-about-text">
              Creative technologist working at the intersection of design, code, and spatial media.
              I build systems that translate complex ideas into clear, navigable experiences.
            </p>
            <a href="/contact" class="btn btn-ghost" data-link>Get in Touch &rarr;</a>
          </div>
        </div>
      </section>
    </div>
  `;
}
