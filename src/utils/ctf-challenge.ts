import type { CommandExecutionResult, TerminalLine } from '../terminal/commands';

const CTF_STORAGE_KEY = 'princeCTFProgress';
const LEGACY_COMPLETED_KEY = 'princeCTFCompleted';

const CTF_LEVELS = [1, 2, 3, 4] as const;
const CTF_TOTAL_LEVELS = CTF_LEVELS.length;

type Difficulty = 'Easy' | 'Medium';

type CtfLevel = (typeof CTF_LEVELS)[number];

export interface CtfChallenge {
  level: CtfLevel;
  name: string;
  difficulty: Difficulty;
  flag: string;
  hintText: string;
  successMessage: string;
  achievementText: string;
}

interface CtfProgress {
  capturedFlags: string[];
}

export const CTF_CHALLENGES: Record<CtfLevel, CtfChallenge> = {
  1: {
    level: 1,
    name: 'The Source',
    difficulty: 'Easy',
    flag: 'FLAG{prince_security_breach_2026}',
    hintText: 'Open page source and search for FLAG{. Developers often leave clues in comments and static markup.',
    successMessage: 'Level 1 complete. You inspected the source like a real investigator.',
    achievementText: 'Achievement unlocked: Source Inspector',
  },
  2: {
    level: 2,
    name: 'The Console',
    difficulty: 'Easy',
    flag: 'FLAG{console_hacker_2026}',
    hintText: 'Open DevTools Console (F12) and inspect startup logs. One log line contains your clue.',
    successMessage: 'Level 2 complete. Console-first debugging pays off.',
    achievementText: 'Achievement unlocked: Console Hacker',
  },
  3: {
    level: 3,
    name: 'The Observer',
    difficulty: 'Medium',
    flag: 'FLAG{hidden_in_the_shadows_2026}',
    hintText: 'Inspect the DOM tree carefully. Look for hidden attributes, comments, and nodes that are not obvious on screen.',
    successMessage: 'Level 3 complete. You found what most users never notice.',
    achievementText: 'Achievement unlocked: Shadow Observer',
  },
  4: {
    level: 4,
    name: 'The Decoder',
    difficulty: 'Medium',
    flag: 'FLAG{base64_master_2026}',
    hintText: 'Find an encoded clue and decode it with Base64 (for example, using atob in Console).',
    successMessage: 'Level 4 complete. You decoded the final clue successfully.',
    achievementText: 'Achievement unlocked: Code Breaker',
  },
};

const line = (
  text: string,
  tone: TerminalLine['segments'][number]['tone'] = 'primary',
  pre = false
): TerminalLine => ({
  segments: [{ text, tone }],
  pre,
});

const challengeList = (): CtfChallenge[] => CTF_LEVELS.map((level) => CTF_CHALLENGES[level]);

function createDefaultProgress(): CtfProgress {
  return { capturedFlags: [] };
}

function normalizeProgress(input: unknown): CtfProgress {
  if (!input || typeof input !== 'object') {
    return createDefaultProgress();
  }

  const maybeFlags = (input as { capturedFlags?: unknown }).capturedFlags;
  if (!Array.isArray(maybeFlags)) {
    return createDefaultProgress();
  }

  const validFlags = challengeList().map((challenge) => challenge.flag);
  const capturedFlags = maybeFlags
    .filter((value): value is string => typeof value === 'string')
    .filter((flag, index, all) => all.indexOf(flag) === index)
    .filter((flag) => validFlags.includes(flag));

  return { capturedFlags };
}

function loadProgress(): CtfProgress {
  const raw = localStorage.getItem(CTF_STORAGE_KEY);

  if (!raw) {
    const progress = createDefaultProgress();

    if (localStorage.getItem(LEGACY_COMPLETED_KEY) === '1') {
      progress.capturedFlags.push(CTF_CHALLENGES[1].flag);
      saveProgress(progress);
    }

    return progress;
  }

  try {
    return normalizeProgress(JSON.parse(raw));
  } catch {
    return createDefaultProgress();
  }
}

function saveProgress(progress: CtfProgress): void {
  localStorage.setItem(CTF_STORAGE_KEY, JSON.stringify(progress));
}

function isCaptured(progress: CtfProgress, challenge: CtfChallenge): boolean {
  return progress.capturedFlags.includes(challenge.flag);
}

function findLevelByFlag(submittedFlag: string): CtfChallenge | undefined {
  return challengeList().find((challenge) => challenge.flag === submittedFlag);
}

function capturedCount(progress: CtfProgress): number {
  return challengeList().reduce((count, challenge) => (isCaptured(progress, challenge) ? count + 1 : count), 0);
}

function statusLines(progress: CtfProgress): TerminalLine[] {
  const found = capturedCount(progress);

  const totalBlocks = 10;
  const filled = Math.max(0, Math.min(totalBlocks, Math.round((found / CTF_TOTAL_LEVELS) * totalBlocks)));
  const bar = `${'█'.repeat(filled)}${'░'.repeat(totalBlocks - filled)}`;

  const lines: TerminalLine[] = [line('🏆 CTF Progress:', 'success'), line('')];

  const labelWidth = challengeList().reduce((max, challenge) => {
    return Math.max(max, `Level ${challenge.level}: ${challenge.name}`.length);
  }, 0);

  challengeList().forEach((challenge) => {
    const captured = isCaptured(progress, challenge);
    const levelLabel = `Level ${challenge.level}: ${challenge.name}`.padEnd(labelWidth + 4, ' ');
    const difficultyLabel = `[${challenge.difficulty}]`.padEnd(10, ' ');
    const icon = captured ? '✓' : '✗';
    const iconTone = captured ? 'ctfOk' : 'ctfFail';

    lines.push({
      segments: [
        { text: levelLabel, tone: 'cyan' },
        { text: difficultyLabel, tone: challenge.difficulty === 'Easy' ? 'success' : 'warning' },
        { text: icon, tone: iconTone },
      ],
      pre: true,
    });
  });

  lines.push(line(''));
  lines.push(line(`Flags Found: ${found}/${CTF_TOTAL_LEVELS}`, 'success'));
  lines.push({
    segments: [
      { text: 'Status: ', tone: 'cyan' },
      { text: bar, tone: 'primary' },
    ],
    pre: true,
  });

  return lines;
}

function menuLines(): TerminalLine[] {
  return [
    line('╔══════════════════════════════════════════════════╗', 'ctfBorder', true),
    line('║           🚩 CTF CHALLENGE SYSTEM 🚩             ║', 'ctfText', true),
    line('╠══════════════════════════════════════════════════╣', 'ctfBorder', true),
    line('║                                                  ║', 'ctfBorder', true),
    line('║   4 Flags are hidden across this portfolio.      ║', 'ctfText', true),
    line('║   Can you find them all?                         ║', 'ctfText', true),
    line('║                                                  ║', 'ctfBorder', true),
    line('║   Difficulty: Easy → Medium                      ║', 'ctfText', true),
    line('║                                                  ║', 'ctfBorder', true),
    line('║   Commands:                                      ║', 'ctfCommand', true),
    line('║   ctf --status     View your progress            ║', 'ctfCommand', true),
    line('║   ctf --hint <1-4> Get hint for a challenge      ║', 'ctfCommand', true),
    line('║   ctf --flag <flag> Submit a flag                ║', 'ctfCommand', true),
    line('║   ctf --rules      View challenge rules          ║', 'ctfCommand', true),
    line('║                                                  ║', 'ctfBorder', true),
    line('║   Start with: ctf --hint 1                       ║', 'ctfText', true),
    line('║                                                  ║', 'ctfBorder', true),
    line('╚══════════════════════════════════════════════════╝', 'ctfBorder', true),
  ];
}

function rulesLines(): TerminalLine[] {
  const levelNameWidth = challengeList().reduce((max, challenge) => {
    return Math.max(max, `Level ${challenge.level}: ${challenge.name}`.length);
  }, 0);

  return [
    line('📋 CTF Rules:', 'success'),
    line(''),
    line('1. All flags follow the format: FLAG{some_text_here}', 'secondary'),
    line('2. Flags are case-sensitive', 'secondary'),
    line('3. Each flag is hidden somewhere in the portfolio', 'secondary'),
    line('4. You may need to use the terminal, inspect the page,', 'secondary'),
    line('   or interact with elements to find them', 'secondary', true),
    line('5. Hints are available for each challenge', 'secondary'),
    line('6. No external tools needed — everything is in this site', 'secondary'),
    line('7. Have fun and think like a hacker!', 'secondary'),
    line(''),
    line('Challenges:', 'cyan'),
    ...challengeList().map((challenge) => ({
      segments: [
        { text: `${`Level ${challenge.level}: ${challenge.name}`.padEnd(levelNameWidth + 3, ' ')}`, tone: 'cyan' },
        { text: `[${challenge.difficulty}]`, tone: challenge.difficulty === 'Easy' ? 'success' : 'warning' },
      ],
      pre: true,
    } satisfies TerminalLine)),
  ];
}

function hintLines(level: CtfLevel): TerminalLine[] {
  const challenge = CTF_CHALLENGES[level];
  return [
    {
      segments: [
        { text: `Level ${challenge.level}: ${challenge.name} `, tone: 'cyan' },
        {
          text: `[${challenge.difficulty}]`,
          tone: challenge.difficulty === 'Easy' ? 'success' : 'warning',
        },
      ],
    },
    line(''),
    line(challenge.hintText, 'primary'),
  ];
}

function completeLines(progress: CtfProgress): TerminalLine[] {
  const found = capturedCount(progress);
  if (found !== CTF_TOTAL_LEVELS) {
    return [];
  }

  return [
    line(''),
    line('All 4 flags captured. CTF complete.', 'success'),
    line('You cleared all beginner levels from Easy to Medium.', 'primary'),
  ];
}

function usageLines(): TerminalLine[] {
  return [line('Usage: ctf [--status | --hint <1-4> | --flag <flag> | --rules]', 'secondary')];
}

function parseHintLevel(value?: string): CtfLevel | null {
  if (!value) {
    return null;
  }

  const numeric = Number.parseInt(value, 10);
  if (!Number.isInteger(numeric) || numeric < 1 || numeric > 4) {
    return null;
  }

  return numeric as CtfLevel;
}

export function initCtfChallenge(): void {
  const encodedFinalFlag = btoa(CTF_CHALLENGES[4].flag);

  console.log('%c[CTF] Level 2 warmup active. Check logs carefully.', 'color:#00E5FF;font-size:12px;');
  console.log('%c[CTF] Encoded clue: %s', 'color:#A855F7;font-size:12px;', encodedFinalFlag);
}

export function handleCtfCommand(args: string[]): CommandExecutionResult {
  const progress = loadProgress();
  const option = (args[0] ?? '').toLowerCase();

  if (args.length === 0) {
    return { lines: menuLines() };
  }

  if (option === '--status') {
    return { lines: statusLines(progress) };
  }

  if (option === '--rules') {
    return { lines: rulesLines() };
  }

  if (option === '--hint') {
    const level = parseHintLevel(args[1]);
    if (!level) {
      return {
        lines: [
          line('Please provide a valid level: ctf --hint <1-4>', 'warning'),
        ],
      };
    }

    return { lines: hintLines(level) };
  }

  if (option === '--flag') {
    const submittedFlag = args.slice(1).join(' ').trim();
    if (!submittedFlag) {
      return { lines: [line('Please submit a flag: ctf --flag FLAG{...}', 'warning')] };
    }

    const challenge = findLevelByFlag(submittedFlag);
    if (!challenge) {
      return {
        lines: [
          line('Incorrect flag. Try again or use hints.', 'error'),
          line('Hint command: ctf --hint <1-4>', 'secondary'),
        ],
      };
    }

    if (isCaptured(progress, challenge)) {
      return {
        lines: [
          line(`Level ${challenge.level} already captured.`, 'warning'),
          line('Use ctf --status to review progress.', 'secondary'),
        ],
      };
    }

    progress.capturedFlags.push(challenge.flag);
    saveProgress(progress);
    window.dispatchEvent(new CustomEvent('analytics:ctf_flag', { detail: { level: challenge.level } }));

    const allCaptured = capturedCount(progress) === CTF_TOTAL_LEVELS;

    return {
      ctfCelebration: allCaptured ? 'complete' : 'capture',
      lines: [
        line(`✓ ${challenge.successMessage}`, 'success'),
        line(challenge.achievementText, 'cyan'),
        line(`Current progress: ${capturedCount(progress)}/${CTF_TOTAL_LEVELS}`, 'primary'),
        ...completeLines(progress),
      ],
    };
  }

  return { lines: usageLines() };
}
