import SectionContainer from '../components/SectionContainer';

export default function Education(): string {
  const content = `
    <div class="education-section-wrap section-divider-top">
      <div class="text-center mb-16 reveal" data-reveal="fade-up">
        <h2 class="section-title" style="color: var(--text-primary);" data-split="chars">Education</h2>
        <p class="section-subtitle">A structured academic journey with strong fundamentals and consistent growth.</p>
      </div>

      <article class="glass-card edu-spotlight-card reveal" data-reveal="scale-up" data-tilt>
        <div class="edu-spotlight-grid">
          <div class="edu-spotlight-visual" data-parallax="0.08" aria-hidden="true">
            <div class="edu-orb"></div>
            <div class="edu-cap">&#127891;</div>
          </div>

          <div class="edu-spotlight-content">
            <p id="education-status" class="edu-pill">Currently Pursuing</p>
            <h3 id="education-degree" class="edu-degree">Bachelor of Technology</h3>
            <p id="education-institution" class="edu-institution">Lovely Professional University</p>
            <p id="education-focus" class="edu-focus"><strong>Computer Science and Engineering</strong></p>

            <div class="edu-pill-row">
              <span class="edu-info-pill">CGPA: 7.02</span>
              <span class="edu-info-pill">Program Level: Undergraduate</span>
            </div>

            <div class="edu-progress-wrap">
              <div class="edu-progress-label">
                <span>Program Progress</span>
                <span>78%</span>
              </div>
              <div class="edu-progress-track">
                <span class="edu-progress-fill" data-fill="78"></span>
              </div>
            </div>
          </div>
        </div>
      </article>

      <div class="edu-timeline reveal" data-reveal="fade-up" data-delay="140">
        <article class="glass-card edu-timeline-card" data-magnetic>
          <p class="edu-level">Intermediate</p>
          <h4 class="edu-school">Inter School Ramganj</h4>
          <p class="edu-stream">PCM</p>
          <p class="edu-score">Percentage: 70%</p>
        </article>

        <article class="glass-card edu-timeline-card" data-magnetic>
          <p class="edu-level">Matriculation</p>
          <h4 class="edu-school">Don Bosco Acad School</h4>
          <p class="edu-stream">General Curriculum</p>
          <p class="edu-score">Percentage: 70%</p>
        </article>
      </div>
    </div>
  `;

  return SectionContainer('education', content);
}
