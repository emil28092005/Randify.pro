// BUGFIX: Original code used leading slashes in endpoint paths which caused
// new URL() to drop the /v2 base path. Fixed by adding trailing slash to
// API_BASE and using relative paths.
import { getCached, setCached } from "./cache";

const API_BASE = "https://api.open5e.com/v2/";

export interface MonsterAction {
  name: string;
  desc?: string;
}

export interface Monster {
  name: string;
  key: string;
  challenge_rating_decimal: string;
  type: string;
  hit_points: number;
  armor_class: number;
  speed?: Record<string, string | number | null>;
  actions?: MonsterAction[];
  special_abilities?: MonsterAction[];
  legendary_actions?: MonsterAction[];
  senses?: Record<string, string | number | null>;
  languages?: string;
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
  size?: string;
  subtype?: string;
  alignment?: string;
  damage_immunities?: string[];
  damage_resistances?: string[];
  damage_vulnerabilities?: string[];
  condition_immunities?: string[];
}

export interface SpellClass {
  name: string;
  slug?: string;
}

export interface Spell {
  name: string;
  key: string;
  level: number;
  school: string;
  casting_time?: string;
  range?: string;
  components?: string;
  duration?: string;
  desc?: string[];
  higher_level?: string[];
  ritual?: boolean;
  concentration?: boolean;
  classes?: SpellClass[];
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
  const cacheKey = `open5e:v2:monsters:${query}`;
  const cached = getCached<Monster[]>(cacheKey);
  if (cached) return cached;

  const url = buildUrl("creatures/", query, filters);
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
  const cacheKey = `open5e:v2:monster:${key}`;
  const cached = getCached<Monster>(cacheKey);
  if (cached) return cached;

  const url = `${API_BASE}creatures/${key}/`;

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
  const cacheKey = `open5e:v2:spells:${query}`;
  const cached = getCached<Spell[]>(cacheKey);
  if (cached) return cached;

  const url = buildUrl("spells/", query, filters);
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
  const cacheKey = `open5e:v2:spell:${key}`;
  const cached = getCached<Spell>(cacheKey);
  if (cached) return cached;

  const url = `${API_BASE}spells/${key}/`;

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
