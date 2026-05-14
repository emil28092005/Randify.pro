import { randomInt } from "./random";

export interface Combatant {
  id: string;
  name: string;
  initiative: number;
}

export function sortByInitiative(combatants: Combatant[]): Combatant[] {
  return [...combatants].sort((a, b) => b.initiative - a.initiative);
}

export function getNextActiveIndex(currentIndex: number, total: number): number {
  if (total === 0) return 0;
  return (currentIndex + 1) % total;
}

export function rollInitiative(modifier: number = 0): number {
  return randomInt(1, 20) + modifier;
}
