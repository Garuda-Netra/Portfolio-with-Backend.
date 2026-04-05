export default function PageChrome(): string {
  return `
    <a href="#main-content" class="skip-link">Skip to content</a>

    <div class="spline-background" aria-hidden="true">
      <iframe
        src="https://my.spline.design/orb-aZ1NdL2VzrfBr9r8brBuVL2w/"
        frameborder="0"
        width="100%"
        height="100%"
        loading="lazy"
        title="3D Orb Background"
      ></iframe>
    </div>

    <div id="site-loader" class="site-loader" aria-hidden="true">
      <div class="site-loader-bg-blur"></div>
      <div class="site-loader-panel site-loader-panel-top"></div>
      <div class="site-loader-panel site-loader-panel-bottom"></div>
      <div class="site-loader-content">
        <div class="site-loader-glow" aria-hidden="true"></div>
        <div class="site-loader-particles" aria-hidden="true">
          <div class="particle"></div>
          <div class="particle"></div>
          <div class="particle"></div>
          <div class="particle"></div>
          <div class="particle"></div>
        </div>
        <h1 id="site-loader-title" class="site-loader-title-shimmer">Prince Kumar</h1>
        <p id="site-loader-subtitle" class="site-loader-subtitle-dynamic">Securing the digital frontier.</p>
        <p id="site-loader-tagline" class="site-loader-tagline">Turning vulnerabilities into strength.</p>
        <div class="site-loader-bar-wrap">
          <div id="site-loader-bar" class="site-loader-bar"></div>
          <div class="site-loader-bar-glow"></div>
        </div>
        <span id="site-loader-percent" class="site-loader-percent">0%</span>
      </div>
    </div>

    <div id="scroll-progress" class="scroll-progress" aria-hidden="true"></div>

    <aside id="section-dots" class="section-dots" aria-label="Section navigation">
      <button class="section-dot" data-target="#hero" data-label="Hero" aria-label="Go to Hero"></button>
      <button class="section-dot" data-target="#about" data-label="About" aria-label="Go to About"></button>
      <button class="section-dot" data-target="#skills" data-label="Skills" aria-label="Go to Skills"></button>
      <button class="section-dot" data-target="#internship" data-label="Experience" aria-label="Go to Experience"></button>
      <button class="section-dot" data-target="#projects" data-label="Projects" aria-label="Go to Projects"></button>
      <button class="section-dot" data-target="#training" data-label="Training" aria-label="Go to Training"></button>
      <button class="section-dot" data-target="#education" data-label="Education" aria-label="Go to Education"></button>
      <button class="section-dot" data-target="#certifications" data-label="Certifications" aria-label="Go to Certifications"></button>
      <button class="section-dot" data-target="#achievements" data-label="Achievements" aria-label="Go to Achievements"></button>
      <button class="section-dot" data-target="#activities" data-label="Activities" aria-label="Go to Activities"></button>
      <button class="section-dot" data-target="#contact" data-label="Contact" aria-label="Go to Contact"></button>
    </aside>

    <div id="konami-overlay" class="konami-overlay" aria-hidden="true">
      <canvas id="konami-canvas" class="konami-canvas"></canvas>
      <p class="konami-text">You found the cheat code! Prince Kumar approves. [Game On]</p>
    </div>
  `;
}
