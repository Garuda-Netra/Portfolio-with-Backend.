import SectionContainer from '../components/SectionContainer';

export default function Training(): string {
  const content = `
    <div class="training-section-wrap section-divider-top">
      <div class="text-center mb-16 reveal" data-reveal="fade-up">
        <h2 class="section-title" style="color: var(--text-primary);" data-split="chars">Training & Learning</h2>
        <p class="section-subtitle">Platforms and resources where I sharpen my skills.</p>
      </div>

      <div class="training-grid max-w-6xl mx-auto">
        <article class="glass-card training-card reveal" data-reveal="fade-up" data-delay="0" data-magnetic>
          <div class="training-icon" aria-hidden="true">&#128295;</div>
          <h3>TryHackMe</h3>
          <p>Hands-on cybersecurity training through guided rooms and challenges covering penetration testing, web security, privilege escalation, and forensics.</p>
          <span class="training-status status-active">Active Learner</span>
        </article>

        <article class="glass-card training-card reveal" data-reveal="fade-up" data-delay="90" data-magnetic>
          <div class="training-icon" aria-hidden="true">&#128376;</div>
          <h3>Hack The Box</h3>
          <p>Advanced penetration testing labs with realistic vulnerable machines. Practicing enumeration, exploitation, and post-exploitation techniques.</p>
          <span class="training-status status-active">Active Learner</span>
        </article>

        <article class="glass-card training-card reveal" data-reveal="fade-up" data-delay="180" data-magnetic>
          <div class="training-icon" aria-hidden="true">&#127760;</div>
          <h3>PortSwigger Web Security Academy</h3>
          <p>Comprehensive web application security training covering SQL injection, XSS, CSRF, authentication vulnerabilities, and advanced exploitation techniques.</p>
          <span class="training-status status-active">Active Learner</span>
        </article>

        <article class="glass-card training-card reveal" data-reveal="fade-up" data-delay="270" data-magnetic>
          <div class="training-icon" aria-hidden="true">&#128269;</div>
          <h3>Self-Directed Research</h3>
          <p>Independent security research including vulnerability analysis, tool development, exploit studying, and staying current with the latest cybersecurity trends and threat landscapes.</p>
          <span class="training-status status-ongoing">Ongoing</span>
        </article>

        <article class="glass-card training-card reveal" data-reveal="fade-up" data-delay="360" data-magnetic>
          <div class="training-icon" aria-hidden="true">&#127942;</div>
          <h3>CTF Competitions</h3>
          <p>Regular participation in Capture The Flag competitions to test and improve problem-solving skills across categories like web exploitation, cryptography, reverse engineering, and forensics.</p>
          <span class="training-status status-active">Active Participant</span>
        </article>

        <article class="glass-card training-card reveal" data-reveal="fade-up" data-delay="450" data-magnetic>
          <div class="training-icon" aria-hidden="true">&#129504;</div>
          <h3>Prompt Engineering</h3>
          <p>Learning and practicing prompt engineering techniques to effectively leverage AI-driven tools and large language models for security research and productivity enhancement.</p>
          <span class="training-status status-practicing">Practicing</span>
        </article>
      </div>
    </div>
  `;

  return SectionContainer('training', content);
}
