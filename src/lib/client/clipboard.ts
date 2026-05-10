export class CopyFeedback {
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private copyIcon: HTMLElement,
    private checkIcon: HTMLElement,
    private duration = 1500
  ) {}

  showCopied() {
    this.copyIcon.classList.add('hidden');
    this.checkIcon.classList.remove('hidden');
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.revert(), this.duration);
  }

  revert() {
    this.checkIcon.classList.add('hidden');
    this.copyIcon.classList.remove('hidden');
  }

  cleanup() {
    if (this.timer) clearTimeout(this.timer);
  }
}
