const NOTES_KEY = "dm-notes";
const INITIATIVE_KEY = "dm-initiative";
const LEGACY_INITIATIVE_KEY = "it-combatants";
const ASKED_FLAG = "dm-import-asked";

export interface LocalCombatant {
  id: string;
  name: string;
  initiative?: number;
  modifier?: number;
  hp?: number;
}

export function getLocalNotes(): string {
  try {
    return localStorage.getItem(NOTES_KEY) ?? "";
  } catch {
    return "";
  }
}

export function getLocalInitiative(): LocalCombatant[] {
  try {
    const raw =
      sessionStorage.getItem(INITIATIVE_KEY) ??
      sessionStorage.getItem(LEGACY_INITIATIVE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Array<Partial<LocalCombatant>>;
    return parsed
      .filter((c) => typeof c.name === "string" && c.name.length > 0)
      .map((c, i) => ({
        id: typeof c.id === "string" ? c.id : `legacy-${i}`,
        name: c.name as string,
        initiative: typeof c.initiative === "number" ? c.initiative : undefined,
        modifier: typeof c.modifier === "number" ? c.modifier : undefined,
        hp: typeof c.hp === "number" ? c.hp : undefined,
      }));
  } catch {
    return [];
  }
}

export function hasLocalData(): boolean {
  return getLocalNotes().trim().length > 0 || getLocalInitiative().length > 0;
}

export function wasAsked(): boolean {
  try {
    return localStorage.getItem(ASKED_FLAG) === "1";
  } catch {
    return true;
  }
}

export function markAsked(): void {
  try {
    localStorage.setItem(ASKED_FLAG, "1");
  } catch {
    /* ignore */
  }
}

export function shouldShowImport(tier: string, userId: number | undefined): boolean {
  if (tier !== "pro" || !userId) return false;
  if (wasAsked()) return false;
  return hasLocalData();
}
