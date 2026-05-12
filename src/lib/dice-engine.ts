// Dice notation engine for Randify.pro
// Supports: XdY±Z, kh/kl/dh/dl, ! exploding, r reroll, advantage/disadvantage
// Caps: explode chain ≤100, reroll recursion ≤1000

type KeepDrop = { type: "kh" | "kl" | "dh" | "dl"; count: number } | null;

type Explode = {
  active: boolean;
  threshold: number | null; // null = max value
  penetrating: boolean;
};

type Reroll = {
  active: boolean;
  values: Set<number>;
  once: boolean; // "ro" = once only; "r" = recursive
  operator: "eq" | "lt" | "gt";
};

export interface Parsed {
  count: number;
  sides: number;
  modifier: number;
  keepDrop: KeepDrop;
  explode: Explode;
  reroll: Reroll;
  advantage: boolean;
  disadvantage: boolean;
}

export interface DieResult {
  value: number;
  original: number;
  exploded: boolean;
  explosions: number[]; // chained explosion rolls
  rerolledFrom: number | null;
  dropped: boolean;
}

export interface RollResult {
  dice: DieResult[];
  kept: DieResult[];
  dropped: DieResult[];
  modifier: number;
  total: number;
  notation: string;
  advantageRolls: [number, number] | null; // for adv/disadv display
}

const EXPLODE_CAP = 100;
const REROLL_CAP = 1000;

/** Remove all whitespace and lowercase for parsing */
function normalize(raw: string): string {
  return raw.replace(/\s+/g, "").toLowerCase();
}

/**
 * Parse dice notation string into structured object.
 * Returns null if syntax is invalid.
 */
export function parseDiceNotation(raw: string): Parsed | null {
  const s = normalize(raw);
  if (!s) return null;

  // Main pattern: count d sides [modifiers+operators]
  const main = s.match(/^(\d*)d(\d+)(.*)$/);
  if (!main) return null;

  const count = main[1] === "" ? 1 : parseInt(main[1], 10);
  const sides = parseInt(main[2], 10);
  const rest = main[3];

  if (count < 1 || count > 20 || sides < 1 || sides > 9999) return null;

  let remaining = rest;

  // Keep/Drop: khN, klN, dhN, dlN
  let keepDrop: KeepDrop = null;
  const kdMatch = remaining.match(/^(kh|kl|dh|dl)(\d+)/);
  if (kdMatch) {
    const countKD = parseInt(kdMatch[2], 10);
    if (countKD < 1 || countKD >= count) return null;
    keepDrop = {
      type: kdMatch[1] as "kh" | "kl" | "dh" | "dl",
      count: countKD,
    };
    remaining = remaining.slice(kdMatch[0].length);
  }

  // Exploding: ! or !>N or !p or !p>N
  const explode: Explode = {
    active: false,
    threshold: null,
    penetrating: false,
  };
  const expMatch = remaining.match(/^(!p|!)(>?)(\d*)/);
  if (expMatch) {
    explode.active = true;
    explode.penetrating = expMatch[1] === "!p";
    if (expMatch[2] === ">" && expMatch[3]) {
      explode.threshold = parseInt(expMatch[3], 10);
      if (explode.threshold < 2 || explode.threshold > sides) return null;
    } else {
      explode.threshold = sides; // default: explode on max
    }
    remaining = remaining.slice(expMatch[0].length);
  }

  // Reroll: rN, roN, r<N, ro<N
  const reroll: Reroll = {
    active: false,
    values: new Set(),
    once: false,
    operator: "eq",
  };
  const rrMatch = remaining.match(/^(ro|r)([<>]?)(\d+)/);
  if (rrMatch) {
    reroll.active = true;
    reroll.once = rrMatch[1] === "ro";
    const op = rrMatch[2] as "" | "<" | ">";
    const val = parseInt(rrMatch[3], 10);
    if (op === "<") {
      reroll.operator = "lt";
      for (let i = 1; i < val && i < sides; i++) reroll.values.add(i);
    } else if (op === ">") {
      reroll.operator = "gt";
      for (let i = val + 1; i <= sides; i++) reroll.values.add(i);
    } else {
      reroll.operator = "eq";
      reroll.values.add(val);
    }
    remaining = remaining.slice(rrMatch[0].length);
  }

  // Flat modifier at the end: +N or -N
  let modifier = 0;
  const modMatch = remaining.match(/^([+-]\d+)$/);
  if (modMatch) {
    modifier = parseInt(modMatch[1], 10);
    if (Math.abs(modifier) > 999) return null;
    remaining = remaining.slice(modMatch[0].length);
  }

  // If anything remains unparsed, it's invalid
  if (remaining.length > 0) return null;

  return {
    count,
    sides,
    modifier,
    keepDrop,
    explode,
    reroll,
    advantage: false,
    disadvantage: false,
  };
}

/** Roll a single die with optional reroll and explode logic */
function rollDie(sides: number, explode: Explode, reroll: Reroll): DieResult {
  let value = Math.floor(Math.random() * sides) + 1;
  const original = value;
  let rerolledFrom: number | null = null;
  const explosions: number[] = [];
  let exploded = false;

  // Handle reroll
  if (reroll.active && reroll.values.has(value)) {
    rerolledFrom = value;
    let rerollCount = 0;
    while (reroll.values.has(value) && rerollCount < REROLL_CAP) {
      value = Math.floor(Math.random() * sides) + 1;
      rerollCount++;
      if (reroll.once) break;
    }
  }

  // Handle exploding
  if (explode.active && value >= (explode.threshold ?? sides)) {
    exploded = true;
    let chain = 0;
    while (chain < EXPLODE_CAP) {
      let next = Math.floor(Math.random() * sides) + 1;
      if (explode.penetrating) {
        next = Math.max(1, next - 1); // penetrating subtracts 1
      }
      explosions.push(next);
      if (next < (explode.threshold ?? sides)) break;
      chain++;
    }
  }

  return {
    value,
    original,
    exploded,
    explosions,
    rerolledFrom,
    dropped: false,
  };
}

/** Execute a roll from parsed notation */
export function rollDice(parsed: Parsed): RollResult {
  const dice: DieResult[] = [];

  for (let i = 0; i < parsed.count; i++) {
    dice.push(rollDie(parsed.sides, parsed.explode, parsed.reroll));
  }

  // Apply keep/drop
  let kept = [...dice];
  let dropped: DieResult[] = [];

  if (parsed.keepDrop) {
    const sorted = [...dice].map((d, i) => ({ die: d, idx: i }));
    if (parsed.keepDrop.type === "kh") {
      sorted.sort((a, b) => b.die.value - a.die.value);
      const keepIndices = new Set(
        sorted.slice(0, parsed.keepDrop.count).map((x) => x.idx),
      );
      kept = dice.filter((_, i) => keepIndices.has(i));
      dropped = dice.filter((_, i) => !keepIndices.has(i));
    } else if (parsed.keepDrop.type === "kl") {
      sorted.sort((a, b) => a.die.value - b.die.value);
      const keepIndices = new Set(
        sorted.slice(0, parsed.keepDrop.count).map((x) => x.idx),
      );
      kept = dice.filter((_, i) => keepIndices.has(i));
      dropped = dice.filter((_, i) => !keepIndices.has(i));
    } else if (parsed.keepDrop.type === "dh") {
      sorted.sort((a, b) => b.die.value - a.die.value);
      const dropIndices = new Set(
        sorted.slice(0, parsed.keepDrop.count).map((x) => x.idx),
      );
      kept = dice.filter((_, i) => !dropIndices.has(i));
      dropped = dice.filter((_, i) => dropIndices.has(i));
    } else if (parsed.keepDrop.type === "dl") {
      sorted.sort((a, b) => a.die.value - b.die.value);
      const dropIndices = new Set(
        sorted.slice(0, parsed.keepDrop.count).map((x) => x.idx),
      );
      kept = dice.filter((_, i) => !dropIndices.has(i));
      dropped = dice.filter((_, i) => dropIndices.has(i));
    }
  }

  dropped.forEach((d) => {
    d.dropped = true;
  });

  // Calculate total
  let total = kept.reduce((sum, d) => sum + d.value, 0);
  total += kept.reduce(
    (sum, d) => sum + d.explosions.reduce((s, v) => s + v, 0),
    0,
  );
  total += parsed.modifier;

  return {
    dice,
    kept,
    dropped,
    modifier: parsed.modifier,
    total,
    notation: "", // filled by caller
    advantageRolls: null,
  };
}

/** Roll with advantage or disadvantage (2dX keep highest/lowest) */
export function rollAdvantage(
  sides: number,
  modifier: number,
  advantage: boolean,
): RollResult {
  const r1 = Math.floor(Math.random() * sides) + 1;
  const r2 = Math.floor(Math.random() * sides) + 1;
  const keptVal = advantage ? Math.max(r1, r2) : Math.min(r1, r2);

  return {
    dice: [
      {
        value: keptVal,
        original: keptVal,
        exploded: false,
        explosions: [],
        rerolledFrom: null,
        dropped: false,
      },
    ],
    kept: [
      {
        value: keptVal,
        original: keptVal,
        exploded: false,
        explosions: [],
        rerolledFrom: null,
        dropped: false,
      },
    ],
    dropped: [],
    modifier,
    total: keptVal + modifier,
    notation: "",
    advantageRolls: [r1, r2],
  };
}

/** Build notation string from parsed object (basic only, for simple sync) */
export function buildNotation(
  count: number,
  sides: number,
  modifier: number,
): string {
  let s = `${count}d${sides}`;
  if (modifier > 0) s += `+${modifier}`;
  else if (modifier < 0) s += modifier;
  return s;
}

/** Check if notation contains advanced features beyond basic XdY±Z */
export function isAdvancedNotation(raw: string): boolean {
  const s = normalize(raw);
  return /(kh|kl|dh|dl|!|ro?[<>]?\d)/.test(s);
}
