// ============================================================================
// CONTACT ROUTE — Simple contact page (no terminal)
// ============================================================================

import content from '../content/content.json';

const { contact } = content;

export function renderContact(): string {
  const instagramLink = contact.links.find(l => l.label === 'Instagram');

  return `
    <div class="contact-page">
      <div class="contact-simple">
        <span class="kicker">Contact</span>
        <h1 class="contact-heading">Get in Touch</h1>

        <div class="contact-items">
          <a href="mailto:${contact.email}" class="contact-item contact-email-link">
            <span class="contact-item-label">Email</span>
            <span class="contact-item-value">${contact.email}</span>
          </a>

          ${instagramLink ? `
          <a href="${instagramLink.href}" target="_blank" rel="noopener" class="contact-item contact-ig-link">
            <svg class="contact-ig-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5"/>
              <circle cx="12" cy="12" r="5"/>
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
            </svg>
            <span class="contact-item-label">Instagram</span>
          </a>
          ` : ''}

          <a href="${contact.resumeUrl}" target="_blank" rel="noopener" class="contact-item contact-resume-link">
            <span class="contact-item-label">Resume</span>
            <span class="contact-item-value">Download PDF</span>
          </a>
        </div>
      </div>
    </div>
  `;
}

export function initContactInteractions(): (() => void) | void {
  // No terminal interactions needed — page is static links
}
