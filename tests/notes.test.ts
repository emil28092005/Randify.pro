import { describe, it, expect, beforeEach } from 'vitest';
import { saveNotes, loadNotes, clearNotes } from '../src/lib/client/notes';

describe('Notes', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves notes to localStorage', () => {
    saveNotes('Test note');
    expect(loadNotes()).toBe('Test note');
  });

  it('loads empty string when no notes saved', () => {
    expect(loadNotes()).toBe('');
  });

  it('clears notes', () => {
    saveNotes('Test');
    clearNotes();
    expect(loadNotes()).toBe('');
  });

  it('overwrites existing notes', () => {
    saveNotes('First');
    saveNotes('Second');
    expect(loadNotes()).toBe('Second');
  });
});
