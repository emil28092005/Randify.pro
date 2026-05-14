import { getCached, setCached } from "./cache";

const API_BASE = "https://api.open5e.com/v2";

export interface Monster {
  name: string;
  key: string;
  challenge_rating_decimal: string;
  type: string;
  hit_points: number;
  armor_class: number;
}

export interface Spell {
  name: string;
  key: string;
  level: number;
  school: string;
}

interface SearchFilters {
  [key: string]: string;
}

async function apiFetch<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`${res.status}: ${res.statusText}`);
  }
  return res.json();
}

function buildUrl(endpoint: string, query?: string, filters?: SearchFilters): string {
  const url = new URL(endpoint, API_BASE);
  if (query) {
    url.searchParams.set("name__icontains", query);
  }
  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      url.searchParams.set(key, value);
    }
  }
  return url.toString();
}

export async function searchMonsters(
  query: string,
  filters?: SearchFilters
): Promise<Monster[]> {
  const cacheKey = `open5e:monsters:${query}`;
  const cached = getCached<Monster[]>(cacheKey);
  if (cached) return cached;

  const url = buildUrl("/creatures/", query, filters);
  const urlObj = new URL(url);
  urlObj.searchParams.set(
    "fields",
    "name,key,challenge_rating_decimal,type,hit_points,armor_class"
  );

  try {
    const data = await apiFetch<{ results: Monster[] }>(urlObj.toString());
    setCached(cacheKey, data.results);
    return data.results;
  } catch (err) {
    const stale = getCached<Monster[]>(cacheKey);
    if (stale) return stale;
    throw err;
  }
}

export async function getMonster(key: string): Promise<Monster> {
  const cacheKey = `open5e:monster:${key}`;
  const cached = getCached<Monster>(cacheKey);
  if (cached) return cached;

  const url = `${API_BASE}/creatures/${key}/`;

  try {
    const data = await apiFetch<Monster>(url);
    setCached(cacheKey, data);
    return data;
  } catch (err) {
    const stale = getCached<Monster>(cacheKey);
    if (stale) return stale;
    throw err;
  }
}

export async function searchSpells(
  query: string,
  filters?: SearchFilters
): Promise<Spell[]> {
  const cacheKey = `open5e:spells:${query}`;
  const cached = getCached<Spell[]>(cacheKey);
  if (cached) return cached;

  const url = buildUrl("/spells/", query, filters);
  const urlObj = new URL(url);
  urlObj.searchParams.set("fields", "name,key,level,school");

  try {
    const data = await apiFetch<{ results: Spell[] }>(urlObj.toString());
    setCached(cacheKey, data.results);
    return data.results;
  } catch (err) {
    const stale = getCached<Spell[]>(cacheKey);
    if (stale) return stale;
    throw err;
  }
}

export async function getSpell(key: string): Promise<Spell> {
  const cacheKey = `open5e:spell:${key}`;
  const cached = getCached<Spell>(cacheKey);
  if (cached) return cached;

  const url = `${API_BASE}/spells/${key}/`;

  try {
    const data = await apiFetch<Spell>(url);
    setCached(cacheKey, data);
    return data;
  } catch (err) {
    const stale = getCached<Spell>(cacheKey);
    if (stale) return stale;
    throw err;
  }
}
