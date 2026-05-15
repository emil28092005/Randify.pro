import { vi } from 'vitest';

export const db = {
  insert: vi.fn(() => ({ values: vi.fn(() => Promise.resolve()) })),
  select: vi.fn(() => ({
    from: vi.fn(() => ({
      where: vi.fn(() => ({
        limit: vi.fn(() => Promise.resolve([])),
      })),
    })),
  })),
  delete: vi.fn(() => ({ where: vi.fn(() => Promise.resolve()) })),
};
