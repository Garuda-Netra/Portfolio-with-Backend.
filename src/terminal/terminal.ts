import {
  executeCommand,
  getCommandMatches,
  getCommandNames,
  type CommandContext,
  type TerminalLine,
} from './commands';
import { createParticles, delay, runFlicker, typeLine, typeLines } from './animations';

let terminalFontLoaded = false;

function ensureTerminalFontLoaded(): void {
  if (terminalFontLoaded) {
    return;
  }

  const existing = document.querySelector<HTMLLinkElement>('link[data-terminal-font="jetbrains-mono"]');
  if (existing) {
    terminalFontLoaded = true;
    return;
  }

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&display=swap';
  link.setAttribute('data-terminal-font', 'jetbrains-mono');
  document.head.appendChild(link);
  terminalFontLoaded = true;
}

interface TerminalElements {
  root: HTMLElement;
  overlay: HTMLDivElement;
  modal: HTMLDivElement;
  output: HTMLDivElement;
  input: HTMLInputElement;
  ghost: HTMLSpanElement;
  mirror: HTMLSpanElement;
  caret: HTMLSpanElement;
  closeButtons: NodeListOf<HTMLButtonElement>;
  maxButton: HTMLButtonElement;
}

interface TerminalState {
  isOpen: boolean;
  history: string[];
  historyIndex: number;
  commandChain: Promise<void>;
  executionToken: number;
  startupToken: number;
  cleanupParticles: (() => void) | null;
  previousBodyOverflow: string;
  elements: TerminalElements;
}

const PROMPT = 'prince@terminal:~ ₹';

function bootSequenceLines(): TerminalLine[] {
  return [
    { segments: [{ text: 'Initializing secure connection...', tone: 'secondary' }], speed: 16 },
    { segments: [{ text: 'Loading modules... [OK]', tone: 'secondary' }], speed: 16 },
    { segments: [{ text: 'Establishing encrypted tunnel... [OK]', tone: 'secondary' }], speed: 16 },
    { segments: [{ text: 'Verifying identity... [OK]', tone: 'secondary' }], speed: 16 },
    { segments: [{ text: 'Access granted.', tone: 'prompt' }], speed: 16 },
  ];
}

function bannerLines(): TerminalLine[] {
  return [
    {
      segments: [{ text: ' ____  ____  ___ _   _  ____ _____   _  ___   _ __  __    _    ____  ', tone: 'cyan' }],
      pre: true,
      speed: 8,
    },
    {
      segments: [{ text: '|  _ \\|  _ \\|_ _| \\ | |/ ___| ____| | |/ / | | |  \\/  |  / \\  |  _ \\ ', tone: 'cyan' }],
      pre: true,
      speed: 8,
    },
    {
      segments: [{ text: '| |_) | |_) || ||  \\| | |   |  _|   | \' /| | | | |\\/| | / _ \\ | |_) |', tone: 'cyan' }],
      pre: true,
      speed: 8,
    },
    {
      segments: [{ text: '|  __/|  _ < | || |\\  | |___| |___  | . \\| |_| | |  | |/ ___ \\|  _ < ', tone: 'cyan' }],
      pre: true,
      speed: 8,
    },
    {
      segments: [{ text: '|_|   |_| \\_\\___|_| \\_|\\____|_____| |_|\\_\\\\___/|_|  |_/_/   \\_\\_| \\_\\', tone: 'cyan' }],
      pre: true,
      speed: 8,
    },
    { segments: [{ text: '', tone: 'primary' }] },
    { segments: [{ text: "Welcome to Prince Kumar's Terminal Portfolio", tone: 'primary' }] },
    {
      segments: [
        {
          text: 'Cybersecurity Professional | Red Teamer | Blue Teamer | Digital Forensics Enthusiast',
          tone: 'secondary',
        },
      ],
    },
    { segments: [{ text: "Type 'help' to see available commands.", tone: 'purple' }] },
    { segments: [{ text: '', tone: 'primary' }] },
  ];
}

export function createTerminalMarkup(): string {
  return `
    <div id="term-overlay" class="term-overlay" aria-hidden="true">
      <div id="term-modal" class="term-modal" role="dialog" aria-modal="true" aria-label="Terminal">
        <div id="term-particles" class="term-particles" aria-hidden="true"></div>
        <div class="term-aurora" aria-hidden="true"></div>
        <div class="term-grid" aria-hidden="true"></div>
        <div class="term-vignette" aria-hidden="true"></div>

        <div class="term-titlebar">
          <div class="term-window-controls">
            <button type="button" class="term-dot term-dot-red" data-term-close aria-label="Close terminal"></button>
            <span class="term-dot term-dot-yellow" aria-hidden="true"></span>
            <span class="term-dot term-dot-green" aria-hidden="true"></span>
          </div>

          <div class="term-title">${PROMPT}</div>

          <div class="term-actions">
            <button type="button" class="term-action-btn" data-term-maximize aria-label="Toggle maximize">&#9723;</button>
            <button type="button" class="term-action-btn term-action-btn-close" data-term-close aria-label="Close terminal">&times;</button>
          </div>
        </div>

        <div id="term-body" class="term-body">
          <div id="term-output" class="term-output" aria-live="polite"></div>
        </div>

        <div class="term-input-bar">
          <div class="term-input-line">
            <span class="term-prompt">${PROMPT}</span>
            <div class="term-input-wrap">
              <span id="term-input-mirror" class="term-input-mirror" aria-hidden="true"></span>
              <input
                id="term-input"
                class="term-input"
                type="text"
                autocomplete="off"
                autocapitalize="off"
                autocorrect="off"
                spellcheck="false"
                aria-label="Terminal input"
              />
              <span id="term-ghost" class="term-ghost" aria-hidden="true"></span>
              <span id="term-caret" class="term-caret" aria-hidden="true"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function ensureTerminalMarkup(root: HTMLElement): TerminalElements {
  root.innerHTML = createTerminalMarkup();

  const overlay = root.querySelector<HTMLDivElement>('#term-overlay');
  const modal = root.querySelector<HTMLDivElement>('#term-modal');
  const output = root.querySelector<HTMLDivElement>('#term-output');
  const input = root.querySelector<HTMLInputElement>('#term-input');
  const ghost = root.querySelector<HTMLSpanElement>('#term-ghost');
  const mirror = root.querySelector<HTMLSpanElement>('#term-input-mirror');
  const caret = root.querySelector<HTMLSpanElement>('#term-caret');
  const maxButton = root.querySelector<HTMLButtonElement>('[data-term-maximize]');

  if (!overlay || !modal || !output || !input || !ghost || !mirror || !caret || !maxButton) {
    throw new Error('Terminal markup could not be initialized.');
  }

  const closeButtons = root.querySelectorAll<HTMLButtonElement>('[data-term-close]');

  return {
    root,
    overlay,
    modal,
    output,
    input,
    ghost,
    mirror,
    caret,
    closeButtons,
    maxButton,
  };
}

function getCommonPrefix(values: string[]): string {
  if (values.length === 0) {
    return '';
  }

  let prefix = values[0];
  for (let i = 1; i < values.length; i += 1) {
    while (!values[i].startsWith(prefix) && prefix.length > 0) {
      prefix = prefix.slice(0, -1);
    }
  }

  return prefix;
}

function getAutocompleteState(rawValue: string): {
  normalized: string;
  matches: string[];
  suggestion: string;
} {
  const normalized = rawValue.trim().toLowerCase();
  const matches = getCommandMatches(normalized);

  if (!normalized || matches.length === 0) {
    return { normalized, matches, suggestion: '' };
  }

  if (matches.length === 1 && matches[0] !== normalized) {
    return {
      normalized,
      matches,
      suggestion: matches[0].slice(normalized.length),
    };
  }

  const commonPrefix = getCommonPrefix(matches);
  if (commonPrefix.length > normalized.length) {
    return {
      normalized,
      matches,
      suggestion: commonPrefix.slice(normalized.length),
    };
  }

  return { normalized, matches, suggestion: '' };
}

function createOutputRow(command: string): TerminalLine {
  return {
    segments: [
      { text: `${PROMPT} `, tone: 'prompt' },
      { text: command, tone: 'accent' },
    ],
  };
}

function scrollToBottom(elements: TerminalElements): void {
  const body = elements.output.parentElement;
  if (body) {
    body.scrollTop = body.scrollHeight;
  }
}

function runCtfCelebrationBurst(state: TerminalState, mode: 'capture' | 'complete'): void {
  const body = state.elements.output.parentElement;
  if (!body) {
    return;
  }

  const layer = document.createElement('div');
  layer.className = 'term-ctf-burst';
  body.appendChild(layer);

  const colors = ['#00E676', '#00E5FF', '#A855F7'];
  const spread = mode === 'complete' ? 640 : 420;
  const verticalSpread = mode === 'complete' ? 360 : 260;
  const count = mode === 'complete' ? 90 : 42;

  for (let i = 0; i < count; i += 1) {
    const dot = document.createElement('span');
    dot.className = 'term-ctf-burst-dot';
    dot.style.setProperty('--dx', `${Math.round((Math.random() - 0.5) * spread)}px`);
    dot.style.setProperty('--dy', `${Math.round((Math.random() - 0.5) * verticalSpread)}px`);
    dot.style.setProperty('--burst-color', colors[Math.floor(Math.random() * colors.length)] ?? '#00E5FF');
    layer.appendChild(dot);
  }

  window.setTimeout(() => {
    layer.remove();
  }, mode === 'complete' ? 1250 : 820);
}

async function runMatrixEffect(state: TerminalState): Promise<void> {
  const body = state.elements.output.parentElement;
  if (!body) {
    return;
  }

  const canvas = document.createElement('canvas');
  canvas.className = 'term-matrix-canvas';
  body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    return;
  }

  const chars = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&*+-';
  const fontSize = 14;
  let columns = 0;
  let drops: number[] = [];

  const resize = (): void => {
    const rect = body.getBoundingClientRect();
    canvas.width = Math.max(320, Math.floor(rect.width));
    canvas.height = Math.max(220, Math.floor(rect.height));
    columns = Math.floor(canvas.width / fontSize);
    drops = Array.from({ length: columns }, () => Math.floor(Math.random() * -40));
  };

  resize();

  const start = performance.now();
  const tokenAtStart = state.executionToken;
  const isInterrupted = (): boolean => tokenAtStart !== state.executionToken || !state.isOpen;

  await new Promise<void>((resolve) => {
    const frame = (): void => {
      if (isInterrupted()) {
        resolve();
        return;
      }

      const elapsed = performance.now() - start;
      if (elapsed >= 5000) {
        resolve();
        return;
      }

      ctx.fillStyle = 'rgba(5, 10, 20, 0.16)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#00FF9C';
      ctx.font = `${fontSize}px JetBrains Mono, monospace`;

      for (let i = 0; i < drops.length; i += 1) {
        const text = chars[Math.floor(Math.random() * chars.length)] ?? '0';
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        ctx.fillText(text, x, y);

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i] += 1;
      }

      requestAnimationFrame(frame);
    };

    requestAnimationFrame(frame);
  });

  canvas.remove();

  if (isInterrupted()) {
    return;
  }

  await typeLines(state.elements.output, [
    { segments: [{ text: 'Reality is just a simulation. Welcome back.', tone: 'purple' }] },
  ], {
    speed: 12,
    lineDelay: 18,
    onProgress: () => scrollToBottom(state.elements),
    shouldStop: isInterrupted,
  });
}

function appendInterruptMarker(state: TerminalState): void {
  const row = document.createElement('div');
  row.className = 'term-line term-fade-in';

  const prompt = document.createElement('span');
  prompt.className = 'term-tone-prompt';
  prompt.textContent = `${PROMPT} `;

  const marker = document.createElement('span');
  marker.className = 'term-tone-warning';
  marker.textContent = '^C';

  row.append(prompt, marker);
  state.elements.output.appendChild(row);
  scrollToBottom(state.elements);
}

function interruptExecution(state: TerminalState): void {
  if (!state.isOpen) {
    return;
  }

  state.executionToken += 1;
  state.startupToken += 1;
  state.commandChain = Promise.resolve();
  state.elements.modal.classList.remove('term-processing', 'term-booting');
  appendInterruptMarker(state);
}

function updateGhostSuggestion(state: TerminalState): void {
  const { input, ghost, mirror, caret } = state.elements;
  const value = input.value;
  const selectionStart = input.selectionStart ?? value.length;
  const selectionEnd = input.selectionEnd ?? selectionStart;
  const isCaretAtEnd = selectionStart === selectionEnd && selectionEnd === value.length;
  const autocomplete = getAutocompleteState(value);

  mirror.textContent = value.slice(0, selectionStart);
  ghost.textContent = isCaretAtEnd ? autocomplete.suggestion : '';
  const left = mirror.offsetWidth;
  ghost.style.left = `${left}px`;
  caret.style.left = `${left}px`;
}

function enqueue(state: TerminalState, task: () => Promise<void>): void {
  state.commandChain = state.commandChain
    .then(task)
    .catch((error: unknown) => {
      const text = error instanceof Error ? error.message : 'Unknown terminal error';
      const lines: TerminalLine[] = [
        { segments: [{ text: `Terminal error: ${text}`, tone: 'error' }] },
      ];

      return typeLines(state.elements.output, lines, {
        speed: 8,
        lineDelay: 40,
        onProgress: () => scrollToBottom(state.elements),
      });
    });
}

async function runStartup(state: TerminalState, startupToken: number): Promise<void> {
  const { output, modal } = state.elements;
  output.innerHTML = '';
  modal.classList.add('term-booting');

  runFlicker(modal, 220);
  await delay(220);

  if (startupToken !== state.startupToken) {
    return;
  }

  for (const lineData of bootSequenceLines()) {
    if (startupToken !== state.startupToken) {
      return;
    }

    await typeLine(output, lineData, {
      speed: lineData.speed ?? 16,
      onProgress: () => scrollToBottom(state.elements),
    });

    await delay(90);
  }

  if (startupToken !== state.startupToken) {
    return;
  }

  await delay(120);

  await typeLines(output, bannerLines(), {
    speed: 10,
    lineDelay: 18,
    onProgress: () => scrollToBottom(state.elements),
  });

  modal.classList.remove('term-booting');
}

function openTerminal(state: TerminalState): void {
  if (state.isOpen) {
    state.elements.input.focus();
    return;
  }

  state.isOpen = true;
  state.startupToken += 1;
  ensureTerminalFontLoaded();

  state.previousBodyOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';

  state.elements.overlay.classList.add('term-open');
  state.elements.overlay.setAttribute('aria-hidden', 'false');
  state.elements.modal.classList.remove('term-minimized');
  window.dispatchEvent(new CustomEvent('terminal:opened'));

  state.cleanupParticles?.();
  const particleHost = state.elements.root.querySelector<HTMLElement>('#term-particles');
  if (particleHost) {
    particleHost.innerHTML = '';
    const particleCount = window.innerWidth < 768 ? 0 : 18;
    state.cleanupParticles = particleCount > 0 ? createParticles(particleHost, particleCount) : () => undefined;
  }

  state.elements.input.value = '';
  updateGhostSuggestion(state);

  window.setTimeout(() => {
    state.elements.input.focus();
  }, 320);

  enqueue(state, async () => {
    const token = state.executionToken;
    const shouldStop = (): boolean => token !== state.executionToken || !state.isOpen;

    await runStartup(state, state.startupToken);

    if (shouldStop()) {
      return;
    }
  });
}

function closeTerminal(state: TerminalState): void {
  if (!state.isOpen) {
    return;
  }

  state.isOpen = false;
  state.executionToken += 1;
  state.startupToken += 1;
  state.elements.overlay.classList.remove('term-open');
  state.elements.overlay.setAttribute('aria-hidden', 'true');
  state.cleanupParticles?.();
  state.cleanupParticles = null;
  document.body.style.overflow = state.previousBodyOverflow;
  window.dispatchEvent(new CustomEvent('terminal:closed'));
}

function handleAutocomplete(state: TerminalState): void {
  const { input } = state.elements;
  const autocomplete = getAutocompleteState(input.value);
  const { normalized, matches, suggestion } = autocomplete;

  if (suggestion) {
    input.value = `${normalized}${suggestion}`;
    updateGhostSuggestion(state);
    return;
  }

  if (matches.length > 1) {
    const suggestions: TerminalLine[] = [
      {
        segments: [
          { text: `Matches: ${matches.join('  ')}`, tone: 'cyan' },
        ],
      },
    ];

    enqueue(state, async () => {
      await typeLines(state.elements.output, suggestions, {
        speed: 8,
        lineDelay: 24,
        onProgress: () => scrollToBottom(state.elements),
      });
    });
  }
}

function handleHistory(state: TerminalState, direction: 'up' | 'down'): void {
  const { history } = state;
  const { input } = state.elements;

  if (direction === 'up') {
    if (history.length === 0) {
      return;
    }

    if (state.historyIndex < history.length - 1) {
      state.historyIndex += 1;
    }

    input.value = history[state.historyIndex] ?? '';
    updateGhostSuggestion(state);
    return;
  }

  if (state.historyIndex > 0) {
    state.historyIndex -= 1;
    input.value = history[state.historyIndex] ?? '';
  } else {
    state.historyIndex = -1;
    input.value = '';
  }

  updateGhostSuggestion(state);
}

function executeInput(state: TerminalState, rawInput: string): void {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return;
  }

  state.history.unshift(trimmed);
  state.historyIndex = -1;

  const context: CommandContext = {
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
  };

  const result = executeCommand(trimmed, context);

  enqueue(state, async () => {
    const token = state.executionToken;
    const shouldStop = (): boolean => token !== state.executionToken || !state.isOpen;

    state.elements.modal.classList.add('term-processing');

    try {
      await typeLine(state.elements.output, createOutputRow(trimmed), {
        speed: 6,
        onProgress: () => scrollToBottom(state.elements),
        shouldStop,
      });

      if (shouldStop()) {
        return;
      }

      const latestRow = state.elements.output.lastElementChild;
      if (latestRow instanceof HTMLElement) {
        latestRow.classList.add('term-command-echo');
      }

      if (result.clear) {
        state.elements.output.innerHTML = '';
        scrollToBottom(state.elements);
        return;
      }

      if (result.lines && result.lines.length > 0) {
        await typeLines(state.elements.output, result.lines, {
          speed: 14,
          lineDelay: 28,
          onProgress: () => scrollToBottom(state.elements),
          shouldStop,
        });
      }

      if (shouldStop()) {
        return;
      }

      if (result.ctfCelebration) {
        runCtfCelebrationBurst(state, result.ctfCelebration);
      }

      if (result.matrix) {
        await runMatrixEffect(state);
      }
    } finally {
      state.elements.modal.classList.remove('term-processing');
    }
  });
}

function attachEvents(state: TerminalState): void {
  const openTrigger = document.getElementById('open-terminal-btn');

  openTrigger?.addEventListener('click', (event) => {
    event.preventDefault();
    openTerminal(state);
  });

  state.elements.closeButtons.forEach((button) => {
    button.addEventListener('click', () => closeTerminal(state));
  });

  state.elements.maxButton.addEventListener('click', () => {
    state.elements.modal.classList.toggle('term-maximized');
  });

  state.elements.overlay.addEventListener('click', (event) => {
    if (event.target === state.elements.overlay) {
      closeTerminal(state);
    }
  });

  document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === '`' && !state.isOpen) {
      event.preventDefault();
      openTerminal(state);
      return;
    }

    if (event.key === 'Escape' && state.isOpen) {
      closeTerminal(state);
    }
  });

  window.addEventListener('terminal:close-request', () => {
    if (state.isOpen) {
      closeTerminal(state);
    }
  });

  state.elements.modal.addEventListener('click', () => {
    state.elements.input.focus();
  });

  state.elements.input.addEventListener('input', () => {
    updateGhostSuggestion(state);
  });

  state.elements.input.addEventListener('keyup', () => {
    updateGhostSuggestion(state);
  });

  state.elements.input.addEventListener('click', () => {
    updateGhostSuggestion(state);
  });

  state.elements.input.addEventListener('select', () => {
    updateGhostSuggestion(state);
  });

  state.elements.input.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c') {
      event.preventDefault();
      interruptExecution(state);
      state.elements.input.value = '';
      updateGhostSuggestion(state);
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      const command = state.elements.input.value;
      state.elements.input.value = '';
      updateGhostSuggestion(state);
      executeInput(state, command);
      return;
    }

    if (event.key === 'Tab') {
      event.preventDefault();
      handleAutocomplete(state);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      handleHistory(state, 'up');
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      handleHistory(state, 'down');
      return;
    }

    if (event.key === 'ArrowRight') {
      const selectionEnd = state.elements.input.selectionEnd ?? state.elements.input.value.length;
      const atEnd = selectionEnd === state.elements.input.value.length;

      if (atEnd) {
        const autocomplete = getAutocompleteState(state.elements.input.value);
        if (autocomplete.suggestion) {
          event.preventDefault();
          state.elements.input.value = `${autocomplete.normalized}${autocomplete.suggestion}`;
          updateGhostSuggestion(state);
        }
      }
    }
  });

  // Initialize a baseline ghost suggestion and cursor position.
  updateGhostSuggestion(state);

  // Keep hinting helpful in fresh sessions.
  const allCommands = getCommandNames().join(', ');
  state.elements.input.setAttribute('placeholder', `Try: ${allCommands}`);
}

export function initTerminal(): void {
  const existingRoot = document.getElementById('terminal-root');
  const root = existingRoot ?? document.body.appendChild(document.createElement('div'));

  if (!existingRoot) {
    root.id = 'terminal-root';
  }

  const elements = ensureTerminalMarkup(root);

  const state: TerminalState = {
    isOpen: false,
    history: [],
    historyIndex: -1,
    commandChain: Promise.resolve(),
    executionToken: 0,
    startupToken: 0,
    cleanupParticles: null,
    previousBodyOverflow: '',
    elements,
  };

  attachEvents(state);
}
