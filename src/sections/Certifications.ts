import SectionContainer from '../components/SectionContainer';
import { API_BASE_URL } from '../config/api';

type Certification = {
  _id: string;
  name: string;
  organization: string;
  category: string;
  dateEarned?: string;
  credentialLink?: string;
  imageUrl?: string;
  accentColor: string;
  order: number;
  isVisible: boolean;
};

const colorMap: Record<string, string> = {
  '#00E5FF': 'cyan',
  '#3B82F6': 'blue',
  '#22C55E': 'green',
  '#EF4444': 'red',
  '#A855F7': 'purple',
  '#F97316': 'orange',
  '#14B8A6': 'teal',
  '#6366F1': 'indigo'
};

function getColorName(accentColor: string): string {
  return colorMap[accentColor] || 'cyan';
}

function getRandomRotation(): string {
  const rotations = ['-2.2deg', '-1.8deg', '-1.3deg', '1.2deg', '1.8deg', '2.1deg', '2.6deg'];
  return rotations[Math.floor(Math.random() * rotations.length)];
}

function getCredentialViewerUrl(rawLink?: string): string {
  if (!rawLink) return '';
  const trimmed = rawLink.trim();
  if (!trimmed) return '';

  try {
    const url = new URL(trimmed);
    const host = url.hostname.toLowerCase();

    if (host.includes('drive.google.com')) {
      const filePathMatch = url.pathname.match(/\/file\/d\/([^/]+)/);
      const openId = url.searchParams.get('id');
      const fileId = filePathMatch?.[1] ?? openId;

      if (fileId) {
        return `https://drive.google.com/file/d/${fileId}/preview`;
      }
    }

    return url.toString();
  } catch {
    return trimmed;
  }
}

export default function Certifications(): string {
  const content = `
    <div class="certifications-wrap section-divider-top">
      <div class="text-center mb-16 reveal" data-reveal="fade-up">
        <h2 class="section-title" style="color: var(--text-primary);" data-split="chars">Certifications (Certs)</h2>
        <p class="section-subtitle">Curated credentials that validate my cybersecurity expertise.</p>
      </div>

      <div id="cert-board" class="cert-board" data-stagger-group data-stagger-step="80">
        <div class="cert-loading" style="grid-column: 1 / -1; text-align: center; color: #8ea9c1; padding: 2rem;">Loading certifications...</div>
      </div>
      <div id="cert-view-all-wrap" class="cert-view-all-wrap hidden">
        <button id="cert-view-all-btn" class="cert-view-all-btn" type="button">More</button>
      </div>
    </div>
  `;

  const section = SectionContainer('certifications', content);

  // Fetch and render certifications after DOM is ready
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      const certBoard = document.getElementById('cert-board');
      const certViewAllWrap = document.getElementById('cert-view-all-wrap');
      const certViewAllBtn = document.getElementById('cert-view-all-btn') as HTMLButtonElement | null;
      if (!certBoard) return;

      let certificationsState: Certification[] = [];
      let isShowingAll = false;

      const renderCertifications = (): void => {
        if (certificationsState.length === 0) {
          certBoard.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: #8ea9c1; padding: 2rem;">No certifications yet.</p>';
          certViewAllWrap?.classList.add('hidden');
          return;
        }

        const ordered = certificationsState.slice().sort((a, b) => a.order - b.order);
        const visibleCerts = isShowingAll ? ordered : ordered.slice(0, 4);
        const hiddenCount = Math.max(ordered.length - 4, 0);

        const cards = visibleCerts.map((cert, index) => {
          const colorName = getColorName(cert.accentColor);
          const rotation = getRandomRotation();
          const viewerUrl = getCredentialViewerUrl(cert.credentialLink);
          const linkHtml = viewerUrl
            ? `<a href="${viewerUrl}" target="_blank" rel="noopener noreferrer" class="cert-view-btn" aria-label="Open credential PDF">Open Credential PDF</a>`
            : '';
          const imageHtml = cert.imageUrl
            ? `<img src="${cert.imageUrl}" alt="${cert.name} certificate" class="cert-inline-image" />`
            : '';
          return `
            <article class="cert-photo-card reveal" data-reveal="fade-up" data-delay="${index * 80}" style="--cert-rotation:${rotation};" data-magnetic>
              <span class="cert-paperclip" aria-hidden="true"></span>
              <div class="cert-check" aria-hidden="true">&#10003;</div>
              ${imageHtml}
              <h3>${cert.name}</h3>
              <p class="cert-org">${cert.organization}</p>
              ${cert.dateEarned ? `<p class="cert-date">${cert.dateEarned}</p>` : ''}
              <div class="cert-footer">
                <span class="cert-category cert-${colorName}">${cert.category}</span>
                ${linkHtml}
              </div>
            </article>
          `;
        }).join('');

        certBoard.innerHTML = cards;

        if (!certViewAllWrap || !certViewAllBtn) return;
        if (hiddenCount <= 0) {
          certViewAllWrap.classList.add('hidden');
          return;
        }

        certViewAllWrap.classList.remove('hidden');
        certViewAllBtn.textContent = isShowingAll
          ? 'Less'
          : `More (${hiddenCount})`;
      };

      certViewAllBtn?.addEventListener('click', () => {
        isShowingAll = !isShowingAll;
        renderCertifications();
      });

      fetch(`${API_BASE_URL}/api/certifications`)
        .then((res) => res.json())
        .then((data) => {
          certificationsState = Array.isArray(data.certifications) ? data.certifications : [];
          renderCertifications();
        })
        .catch(() => {
          certBoard.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: #ff6b6b; padding: 2rem;">Failed to load certifications.</p>';
          certViewAllWrap?.classList.add('hidden');
        });
    }, 100);
  }

  return section;
}
