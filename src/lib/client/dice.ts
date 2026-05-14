import { randomInt } from "./random";

export interface DiceNotation {
  count: number;
  sides: number;
  modifier: number;
}

export interface DiceRollResult {
  rolls: number[];
  total: number;
  modifier: number;
}

export function parseDiceNotation(notation: string): DiceNotation {
  const trimmed = notation.trim().toLowerCase();
  if (!trimmed) {
    throw new Error("Empty dice notation");
  }

  const match = trimmed.match(/^(\d*)\s*d\s*(\d+)\s*([+-]\s*\d+)?$/);
  if (!match) {
    throw new Error(`Invalid dice notation: ${notation}`);
  }

  const count = match[1] === "" ? 1 : parseInt(match[1], 10);
  const sides = parseInt(match[2], 10);
  const modifier = match[3] ? parseInt(match[3].replace(/\s/g, ""), 10) : 0;

  if (count < 1 || sides < 1) {
    throw new Error("Dice count and sides must be at least 1");
  }

  return { count, sides, modifier };
}

export function rollDice(
  count: number,
  sides: number,
  modifier: number,
): DiceRollResult {
  if (count < 1 || sides < 1) {
    throw new Error("Dice count and sides must be at least 1");
  }

  const rolls: number[] = [];
  for (let i = 0; i < count; i++) {
    rolls.push(randomInt(1, sides));
  }

  const total = rolls.reduce((sum, roll) => sum + roll, 0) + modifier;

  return { rolls, total, modifier };
}
