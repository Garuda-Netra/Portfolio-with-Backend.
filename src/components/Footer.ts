export default function Footer(): string {
  return `
    <footer id="footer" class="footer-wrap">
      <div class="footer-top-line"></div>
      <div class="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div class="footer-grid">
          <div>
            <h3 class="footer-name">Prince Kumar</h3>
            <p class="footer-tagline">Cybersecurity Professional | Red Teamer | Blue Teamer | Digital Forensics Enthusiast.</p>
            <p class="footer-copy">
              &copy; 2026 Prince Kumar. All rights reserved.
              <a
                href="/admin/index.html"
                class="admin-panel-link admin-panel-link-footer"
                aria-label="Admin Panel"
                title="Admin Panel"
              >
                <span aria-hidden="true">🔒</span>
              </a>
            </p>
          </div>

          <div>
            <h4 class="footer-title">Quick Links</h4>
            <div class="footer-links">
              <a href="#hero">Home</a>
              <a href="#about">About</a>
              <a href="#skills">Skills</a>
              <a href="#projects">Projects</a>
              <a href="#certifications">Certifications</a>
              <a href="#contact">Contact</a>
              <a
                href="#"
                id="footer-resume-link"
                class="footer-resume-link"
                data-resume-download
                data-resume-source="footer"
                data-resume-idle="Download Resume"
                data-resume-instant="true"
                data-magnetic
                download="Raj_CV.pdf"
              >
                <span class="resume-download-icon" aria-hidden="true">⤓</span>
                <span data-resume-label>Download Resume</span>
              </a>
            </div>
          </div>

          <div>
            <h4 class="footer-title">Connect</h4>
            <div id="footer-socials-dynamic" class="footer-socials">
              <a href="https://github.com/Garuda-Netra" target="_blank" rel="noopener noreferrer" aria-label="GitHub" data-magnetic>&lt;/&gt;</a>
              <a href="https://www.linkedin.com/in/prince-kumar8/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" data-magnetic>in</a>
              <a href="mailto:princekumaarr2005@gmail.com" aria-label="Email" data-magnetic>@</a>
            </div>
            <p class="ctf-clue" aria-hidden="true">Curious? Inspect deeper.</p>
          </div>
        </div>
      </div>

      <button id="back-to-top" class="back-to-top" aria-label="Back to top" data-magnetic>
        &uarr;
      </button>
    </footer>
  `;
}
