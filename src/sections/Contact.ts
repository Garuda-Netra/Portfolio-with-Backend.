import SectionContainer from '../components/SectionContainer';

export default function Contact(): string {
  const content = `
    <div class="contact-wrap section-divider-top">
      <div class="text-center mb-16 reveal" data-reveal="fade-up">
        <h2 class="section-title" style="color: var(--text-primary);" data-split="chars">Get In Touch</h2>
        <p class="section-subtitle">Have a project, opportunity, or just want to connect? Let's talk.</p>
      </div>

      <div class="contact-grid">
        <div class="contact-left reveal" data-reveal="fade-right">
          <p class="contact-message">
            I am always open to discussing cybersecurity projects, research collaborations, internship opportunities, or just having a conversation about security. Whether you need a penetration tester, a forensics analyst, or someone passionate about making systems more secure - feel free to reach out.
          </p>

          <div id="contact-links-dynamic" class="contact-links">
            <a href="mailto:princekumaarr2005@gmail.com" class="contact-link-item" data-magnetic aria-label="Send email to Prince Kumar">
              <span class="contact-link-icon" aria-hidden="true">&#9993;</span>
              <span class="contact-link-text">princekumaarr2005@gmail.com</span>
              <span class="contact-link-arrow" aria-hidden="true">&rarr;</span>
            </a>
            <a href="https://www.linkedin.com/in/prince-kumar8/" target="_blank" rel="noopener noreferrer" class="contact-link-item" data-magnetic aria-label="Open LinkedIn profile">
              <span class="contact-link-icon" aria-hidden="true">in</span>
              <span class="contact-link-text">linkedin.com/in/prince-kumar8</span>
              <span class="contact-link-arrow" aria-hidden="true">&rarr;</span>
            </a>
            <a href="https://github.com/Garuda-Netra" target="_blank" rel="noopener noreferrer" class="contact-link-item" data-magnetic aria-label="Open GitHub profile">
              <span class="contact-link-icon" aria-hidden="true">&lt;/&gt;</span>
              <span class="contact-link-text">github.com/Garuda-Netra</span>
              <span class="contact-link-arrow" aria-hidden="true">&rarr;</span>
            </a>
          </div>

          <a
            href="#"
            id="contact-resume-download"
            class="contact-resume-card"
            data-resume-download
            data-resume-source="contact"
            data-resume-idle="Download My Resume"
            data-magnetic
            download="Raj_CV.pdf"
            aria-label="Download Prince Kumar resume"
          >
            <span class="contact-resume-doc" aria-hidden="true">📄</span>
            <span class="contact-resume-copy">
              <span class="contact-resume-title" data-resume-label>Download My Resume</span>
              <span class="contact-resume-subtitle">PDF format - Last updated 2026</span>
            </span>
            <span class="contact-resume-action" aria-hidden="true">
              <span class="resume-download-icon">⤓</span>
              <span class="resume-inline-loader"></span>
            </span>
          </a>

          <div class="contact-mini-terminal" aria-hidden="true">
            <p>echo "Let's collaborate!"</p>
            <p>Let's collaborate!</p>
            <p>contact --send --to prince</p>
            <p class="contact-mini-ok">Message sent successfully.</p>
          </div>
        </div>

        <div class="contact-right reveal" data-reveal="fade-left" data-delay="80">
          <form id="contact-form" class="contact-form glass-card" novalidate>
            <div class="contact-field">
              <input id="contact-name" name="name" type="text" placeholder=" " required />
              <label for="contact-name">Name</label>
              <small class="contact-error" data-error-for="name"></small>
            </div>

            <div class="contact-field">
              <input id="contact-email" name="email" type="email" placeholder=" " required />
              <label for="contact-email">Email</label>
              <small class="contact-error" data-error-for="email"></small>
            </div>

            <div class="contact-field">
              <input id="contact-subject" name="subject" type="text" placeholder=" " />
              <label for="contact-subject">Subject</label>
              <small class="contact-error" data-error-for="subject"></small>
            </div>

            <div class="contact-field">
              <textarea id="contact-message" name="message" rows="5" placeholder=" " required></textarea>
              <label for="contact-message">Message</label>
              <small class="contact-error" data-error-for="message"></small>
            </div>

            <button id="contact-submit" type="submit" class="contact-submit" data-magnetic>
              <span class="submit-label">Send Message</span>
              <span class="submit-loader" aria-hidden="true"></span>
            </button>

            <p id="contact-success" class="contact-success" role="status" aria-live="polite"></p>
          </form>
        </div>
      </div>
    </div>
  `;

  return SectionContainer('contact', content);
}
