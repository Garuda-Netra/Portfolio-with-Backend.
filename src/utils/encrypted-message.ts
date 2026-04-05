import SectionContainer from '../components/SectionContainer';
import type { TerminalLine } from '../terminal/commands';

const decodedMessage = 'Passion drives my code. Curiosity fuels my hunt. Security is my mission.';

const payloads: Record<string, string> = {
  hex: '50 61 73 73 69 6F 6E 20 64 72 69 76 65 73 20 6D 79 20 63 6F 64 65 2E 20 43 75 72 69 6F 73 69 74 79 20 66 75 65 6C 73 20 6D 79 20 68 75 6E 74 2E 20 53 65 63 75 72 69 74 79 20 69 73 20 6D 79 20 6D 69 73 73 69 6F 6E 2E',
  base64: 'UGFzc2lvbiBkcml2ZXMgbXkgY29kZS4gQ3VyaW9zaXR5IGZ1ZWxzIG15IGh1bnQuIFNlY3VyaXR5IGlzIG15IG1pc3Npb24u',
  binary: '01010000 01100001 01110011 01110011 01101001 01101111 01101110 00100000\n01100100 01110010 01101001 01110110 01100101 01110011 ...',
};

export function renderEncryptedMessageSection(): string {
  const content = `
    <div class="encrypted-message-wrap">
      <div class="text-center mb-10 animate-on-scroll">
        <h2 class="section-title" style="color: var(--text-primary);">Encryption Lab</h2>
        <p class="section-subtitle">A mini cyber challenge where you inspect encoded payloads and decrypt an intercepted transmission.</p>
      </div>

      <article class="glass-card encrypted-message-card animate-on-scroll" id="encrypted-message-card">
        <header class="encrypted-message-header">
          <h3 class="encrypted-message-title">📡 Intercepted Transmission</h3>
          <p class="encrypted-message-subtitle">An encrypted message was intercepted. Can you decode it?</p>
          <p class="encrypted-message-subtitle">This interactive block demonstrates how security analysts inspect message formats like Hex, Base64, and Binary before recovering plaintext intelligence.</p>
        </header>

        <div class="encrypted-tabs" role="tablist" aria-label="Encrypted formats">
          <button class="encrypted-tab active" data-enc-tab="hex" aria-selected="true">Hexadecimal</button>
          <button class="encrypted-tab" data-enc-tab="base64" aria-selected="false">Base64</button>
          <button class="encrypted-tab" data-enc-tab="binary" aria-selected="false">Binary</button>
        </div>

        <pre id="encrypted-payload" class="encrypted-payload">${payloads.hex}</pre>
        <p id="encrypted-truncated" class="encrypted-truncated" hidden>Truncated for visual impact.</p>

        <button id="decrypt-message-btn" class="decrypt-message-btn" type="button" aria-label="Decrypt message">
          🔒 Decrypt Message
        </button>

        <div id="decrypted-output" class="decrypted-output" aria-live="polite"></div>
      </article>
    </div>
  `;

  return SectionContainer('intercepted-message', content);
}

function scrambleText(node: HTMLElement, target: string, duration = 650): Promise<void> {
  const pool = '0123456789ABCDEF+/=#@$%';
  const chars = Array.from(target);
  const start = performance.now();

  return new Promise((resolve) => {
    const tick = (): void => {
      const progress = Math.min(1, (performance.now() - start) / duration);
      const reveal = Math.floor(chars.length * progress);
      const built = chars.map((char, index) => {
        if (index < reveal || char === '\n' || char === ' ') {
          return char;
        }
        return pool[Math.floor(Math.random() * pool.length)] ?? '0';
      });

      node.textContent = built.join('');

      if (progress >= 1) {
        node.textContent = target;
        resolve();
        return;
      }

      window.requestAnimationFrame(tick);
    };

    window.requestAnimationFrame(tick);
  });
}

export function initEncryptedMessage(): void {
  const card = document.getElementById('encrypted-message-card');
  const payload = document.getElementById('encrypted-payload');
  const output = document.getElementById('decrypted-output');
  const decryptButton = document.getElementById('decrypt-message-btn') as HTMLButtonElement | null;
  const tabs = document.querySelectorAll<HTMLButtonElement>('.encrypted-tab[data-enc-tab]');
  const truncated = document.getElementById('encrypted-truncated');

  if (!card || !payload || !output || !decryptButton || tabs.length === 0 || !truncated) {
    return;
  }

  let activeTab: keyof typeof payloads = 'hex';
  let decrypted = false;
  let working = false;

  const setTab = async (tab: keyof typeof payloads): Promise<void> => {
    activeTab = tab;
    tabs.forEach((button) => {
      const active = button.dataset.encTab === tab;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    truncated.hidden = tab !== 'binary';
    await scrambleText(payload, payloads[tab], 420);

    if (decrypted) {
      output.textContent = '';
      await scrambleText(output, decodedMessage, 500);
      output.classList.add('decrypted');
      if (!output.querySelector('.decrypted-signature')) {
        output.insertAdjacentHTML('beforeend', '<p class="decrypted-signature">— Prince Kumar</p>');
      }
    }
  };

  tabs.forEach((button) => {
    button.addEventListener('click', () => {
      const tab = (button.dataset.encTab ?? 'hex') as keyof typeof payloads;
      void setTab(tab);
    });
  });

  decryptButton.addEventListener('click', async () => {
    if (working || decrypted) {
      return;
    }

    working = true;

    await scrambleText(payload, payloads[activeTab], 500);
    await scrambleText(output, decodedMessage, window.innerWidth < 768 ? 900 : 1500);

    output.classList.add('decrypted');
    output.insertAdjacentHTML('beforeend', '<p class="decrypted-signature">— Prince Kumar</p>');

    decryptButton.textContent = 'Message Decrypted ✓';
    decryptButton.classList.add('done');
    decryptButton.disabled = true;

    decrypted = true;
    working = false;
  });
}

function line(text: string, tone: TerminalLine['segments'][number]['tone'] = 'primary'): TerminalLine {
  return { segments: [{ text, tone }] };
}

export function getDecryptTerminalLines(): TerminalLine[] {
  return [
    line('₹ decrypt intercepted_message.enc', 'prompt'),
    line('', 'primary'),
    line('[*] Analyzing encryption format... Hexadecimal detected', 'secondary'),
    line('[*] Applying decryption key...', 'secondary'),
    line('[*] Decrypting...', 'secondary'),
    line('', 'primary'),
    line('Decrypted message:', 'cyan'),
    line(`"${decodedMessage}"`, 'success'),
    line('', 'primary'),
    line('— Prince Kumar', 'purple'),
  ];
}
