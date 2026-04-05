export function $(selector: string): HTMLElement | null {
  return document.querySelector(selector);
}

export function $$(selector: string): NodeListOf<HTMLElement> {
  return document.querySelectorAll(selector);
}

export function debounce(
  fn: (...args: any[]) => void,
  delay: number
): (...args: any[]) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export function createElement(
  tag: string,
  className?: string,
  innerHTML?: string
): HTMLElement {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (innerHTML) el.innerHTML = innerHTML;
  return el;
}