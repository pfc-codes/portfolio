// ============================================================================
// CONTACT ROUTE — Clean, professional contact page
// ============================================================================

import content from '../content/content.json';

const { contact } = content;

export function renderContact(): string {
  return `
    <div class="contact-page">
      <div class="grid-container">
        <div class="contact-layout">
          <header class="contact-header">
            <span class="kicker">Contact</span>
            <h1 class="h1">Get in Touch</h1>
          </header>

          <div class="contact-links">
            <a href="mailto:${contact.email}" class="contact-row">
              <span class="contact-row-label">Email</span>
              <span class="contact-row-value">${contact.email}</span>
            </a>

            ${contact.links.map(link => `
              <a href="${link.href}" target="_blank" rel="noopener" class="contact-row">
                <span class="contact-row-label">${link.label}</span>
                <span class="contact-row-value">&nearr;</span>
              </a>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}
