const STORAGE_KEY = 'dm-notes';

export function saveNotes(content: string): void {
  localStorage.setItem(STORAGE_KEY, content);
}

export function loadNotes(): string {
  return localStorage.getItem(STORAGE_KEY) ?? '';
}

export function clearNotes(): void {
  localStorage.removeItem(STORAGE_KEY);
}
