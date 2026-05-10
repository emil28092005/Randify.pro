export function createErrorDisplay(errorEl: HTMLElement) {
  return {
    show(msg: string) {
      errorEl.textContent = msg;
      errorEl.classList.remove('hidden');
    },
    clear() {
      errorEl.textContent = '';
      errorEl.classList.add('hidden');
    },
  };
}

export function isInteger(val: string): boolean {
  return /^-?\d+$/.test(val.trim());
}
