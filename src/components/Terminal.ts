import { createTerminalMarkup, initTerminal as initializeTerminal } from '../terminal/terminal';

export default function Terminal(): string {
  return createTerminalMarkup();
}

export function initTerminal(): void {
  initializeTerminal();
}