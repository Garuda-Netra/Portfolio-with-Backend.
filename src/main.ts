import './styles/globals.css';
import './styles/background-enhancement.css';
import './styles/background-deep.css';
import './terminal/terminal.css';
import './styles/terminal-theme-update.css';
import './styles/animations.css';
import './styles/premium-sections.css';

import { initTheme } from './utils/theme';
import { initScrollAnimations, initNavScrollSpy } from './utils/scrollAnimations';
import { initPremiumSections } from './utils/premiumSections';

import Navbar, { initNavbar } from './components/Navbar';
import Footer from './components/Footer';
import PageChrome from './components/PageChrome';
import { initThemeToggle } from './components/ThemeToggle';
import { initTerminal } from './components/Terminal';
import {
  initConsoleSignature,
  initKonamiCode,
  initLoadingScreen,
  initScrollProgressAndDots,
  initTitleOnTabBlur,
} from './utils/siteEnhancements';
import { initResumeDownload } from './utils/resume-download';
import { initVulnerabilityScanner } from './utils/vulnerability-scanner';
import { initCtfChallenge } from './utils/ctf-challenge';
import { initEncryptedMessage, renderEncryptedMessageSection } from './utils/encrypted-message';
import { initDynamicProfileAndSocial } from './utils/dynamicProfileSocial';
import { initAnalyticsTracker } from './utils/analyticsTracker';
import { getDefaultPortfolioSettings, hideFeatureButtons, loadPortfolioSettings } from './utils/portfolioSettings';
import { initMarqueeStrips } from './utils/marquee';
import { initSmoothScroll } from './utils/smooth-scroll';
import { applyCustomTheme } from './utils/theme-customizer';
import { initCursorTrail } from './utils/cursorTrail';

import Hero from './sections/Hero';
import About from './sections/About';
import Skills from './sections/Skills';
import Internship from './sections/Internship';
import Projects from './sections/Projects';
import Training from './sections/Training';
import Certifications from './sections/Certifications';
import Achievements from './sections/Achievements';
import Blog from './sections/Blog';
import ExtraCurricular from './sections/ExtraCurricular';
import Education from './sections/Education';
import Contact from './sections/Contact';
import { initBlogSection } from './utils/blog-section';

// Get the app container
const app = document.querySelector<HTMLDivElement>('#app')!;

// Initialize theme before rendering
initTheme();

// Render all components
app.innerHTML = `
  ${PageChrome()}
  ${Navbar()}

  <main id="main-content" style="min-height: 100vh;">
    ${Hero()}
    ${About()}
    ${renderEncryptedMessageSection()}
    ${Skills()}
    ${Internship()}
    ${Projects()}
    <!--
      Well done, investigator. You found the first breadcrumb.
      The next step requires the terminal.
      Try: ctf --hint
      Remember: Every hacker knows the CLI is where secrets live.
    -->
    ${Training()}
    ${Certifications()}
    ${Achievements()}
    ${Blog()}
    ${ExtraCurricular()}
    ${Education()}
    ${Contact()}
  </main>

  ${Footer()}
`;

// Initialize all interactive components after rendering
void (async () => {
  console.log(
    '%c🔒 Admin Panel Available',
    'color: #00E5FF; font-size: 14px; font-weight: bold;'
  );
  console.log(
    '%cAccess at: /admin/index.html',
    'color: #00CC6A; font-size: 12px;'
  );

  // Initialize cursor trail early
  initCursorTrail();

  await applyCustomTheme();
  const settings = await loadPortfolioSettings().catch(() => getDefaultPortfolioSettings());

  hideFeatureButtons(settings);

  initNavbar();
  initThemeToggle();
  if (settings.terminalFeature) {
    initTerminal();
  }
  initResumeDownload();
  initScrollAnimations();
  initNavScrollSpy();
  initPremiumSections();
  initEncryptedMessage();
  if (settings.scannerFeature) {
    initVulnerabilityScanner();
  }
  initCtfChallenge();
  if (settings.loadingScreen) {
    initLoadingScreen();
  } else {
    const loader = document.getElementById('site-loader');
    loader?.remove();
    document.body.classList.add('hero-enter');
  }
  initScrollProgressAndDots();
  initKonamiCode();
  initTitleOnTabBlur();
  initConsoleSignature();

  if (settings.marqueeStrips) {
    initMarqueeStrips();
  }
  if (settings.smoothScroll) {
    initSmoothScroll();
  }

  initAnalyticsTracker();
  void initDynamicProfileAndSocial();
  void initBlogSection();
})();
