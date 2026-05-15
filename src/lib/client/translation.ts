export interface TranslationEntry {
  slug: string;
  type: "creature" | "spell";
  data: Record<string, unknown>;
  timestamp: number;
}

const CACHE = new Map<string, TranslationEntry>();

const CHANNEL =
  typeof BroadcastChannel !== "undefined"
    ? new BroadcastChannel("dm-translations")
    : null;

if (CHANNEL) {
  CHANNEL.addEventListener("message", (e) => {
    const entry = e.data as TranslationEntry;
    CACHE.set(`${entry.type}:${entry.slug}`, entry);
  });
}

export function getCachedTranslation(
  slug: string,
  type: "creature" | "spell",
): Record<string, unknown> | null {
  return CACHE.get(`${type}:${slug}`)?.data ?? null;
}

export function setCachedTranslation(
  slug: string,
  type: "creature" | "spell",
  data: Record<string, unknown>,
): void {
  const entry: TranslationEntry = {
    slug,
    type,
    data,
    timestamp: Date.now(),
  };
  CACHE.set(`${type}:${slug}`, entry);
  CHANNEL?.postMessage(entry);
}

export async function fetchTranslation(
  slug: string,
  type: "creature" | "spell",
): Promise<Record<string, unknown> | null> {
  const cached = getCachedTranslation(slug, type);
  if (cached) return cached;

  const res = await fetch(
    `/api/dm/translate?slug=${encodeURIComponent(slug)}&type=${type}`,
  );
  const data = (await res.json().catch(() => ({}))) as {
    error?: string;
    translated?: Record<string, unknown>;
  };

  if (!res.ok || data.error) {
    throw new Error(data.error || "Translation failed");
  }

  const translated = data.translated ?? null;
  if (translated) {
    setCachedTranslation(slug, type, translated);
  }
  return translated;
}

export function clearTranslationCache(): void {
  CACHE.clear();
}

export function getTranslationCacheSize(): number {
  return CACHE.size;
}
