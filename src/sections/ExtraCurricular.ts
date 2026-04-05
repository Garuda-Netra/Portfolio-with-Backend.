import SectionContainer from '../components/SectionContainer';

export default function ExtraCurricular(): string {
  const content = `
    <div class="beyond-wrap section-divider-top">
      <div class="text-center mb-16 reveal" data-reveal="fade-up">
        <h2 class="section-title" style="color: var(--text-primary);" data-split="chars">Beyond Security</h2>
        <p class="section-subtitle">Activities and interests that complement my technical journey.</p>
      </div>

      <div class="bento-grid">
        <article class="glass-card bento-card bento-large reveal" data-reveal="fade-right" data-delay="0" data-magnetic>
          <div class="bento-icon" aria-hidden="true">&#128736;</div>
          <h3>Open Source Contribution</h3>
          <p>Contributing to security-related open source projects and sharing tools with the cybersecurity community. Believing in collaborative development and knowledge sharing.</p>
        </article>

        <article class="glass-card bento-card reveal" data-reveal="fade-up" data-delay="80" data-magnetic>
          <div class="bento-icon" aria-hidden="true">&#128227;</div>
          <h3>Security Awareness Advocacy</h3>
          <p>Promoting cybersecurity awareness and safe digital practices. Creating tools and resources that help people understand real-world security threats.</p>
        </article>

        <article class="glass-card bento-card reveal" data-reveal="fade-down" data-delay="130" data-magnetic>
          <div class="bento-icon" aria-hidden="true">&#128218;</div>
          <h3>Continuous Self-Learning</h3>
          <p>Dedicated to lifelong learning through online platforms, research papers, security blogs, and hands-on experimentation with new tools and techniques.</p>
        </article>

        <article class="glass-card bento-card bento-small reveal" data-reveal="fade-left" data-delay="180" data-magnetic>
          <div class="bento-icon" aria-hidden="true">&#128221;</div>
          <h3>Technical Writing</h3>
          <p>Documenting security research, tool usage guides, and CTF writeups to share knowledge with the community.</p>
        </article>

        <article class="glass-card bento-card bento-small reveal" data-reveal="fade-right" data-delay="220" data-magnetic>
          <div class="bento-icon" aria-hidden="true">&#128101;</div>
          <h3>Community Engagement</h3>
          <p>Actively participating in cybersecurity forums, Discord communities, and online discussions to learn from and contribute to the global security community.</p>
        </article>

        <article class="glass-card bento-card reveal" data-reveal="fade-up" data-delay="260" data-magnetic>
          <div class="bento-icon" aria-hidden="true">&#129504;</div>
          <h3>AI & Prompt Engineering Exploration</h3>
          <p>Exploring the intersection of artificial intelligence and cybersecurity. Practicing prompt engineering to leverage AI tools effectively for security research and productivity.</p>
        </article>
      </div>
    </div>
  `;

  return SectionContainer('activities', content);
}
