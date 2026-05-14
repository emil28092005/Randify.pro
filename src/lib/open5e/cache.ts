const ONE_DAY_MS = 24 * 60 * 60 * 1000;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export function getCached<T>(key: string): T | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.timestamp > ONE_DAY_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

function safeStorageSet(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function setCached<T>(key: string, data: T): void {
  if (typeof localStorage === "undefined") return;
  const entry: CacheEntry<T> = { data, timestamp: Date.now() };
  safeStorageSet(key, JSON.stringify(entry));
}
