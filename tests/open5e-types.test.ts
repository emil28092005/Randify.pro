import { describe, it, expect } from "vitest";
import type { Monster, Spell } from "../src/lib/open5e/client";

// Type-level assertions: verify interfaces contain all required fields.
// If a listed key is missing from the interface, TypeScript will error at compile time.
type AssertKeys<T, K extends keyof T> = K;

type _MonsterHasAllFields = AssertKeys<
  Monster,
  | "name"
  | "key"
  | "challenge_rating_decimal"
  | "type"
  | "hit_points"
  | "armor_class"
  | "speed"
  | "actions"
  | "special_abilities"
  | "legendary_actions"
  | "senses"
  | "languages"
  | "strength"
  | "dexterity"
  | "constitution"
  | "intelligence"
  | "wisdom"
  | "charisma"
  | "size"
  | "subtype"
  | "alignment"
  | "damage_immunities"
  | "damage_resistances"
  | "damage_vulnerabilities"
  | "condition_immunities"
>;

type _SpellHasAllFields = AssertKeys<
  Spell,
  | "name"
  | "key"
  | "level"
  | "school"
  | "casting_time"
  | "range"
  | "components"
  | "duration"
  | "desc"
  | "higher_level"
  | "ritual"
  | "concentration"
  | "classes"
>;

// Runtime dummy test so Vitest recognizes this file.
describe("Open5e type assertions", () => {
  it("Monster interface contains all required keys at compile time", () => {
    expect(true).toBe(true);
  });

  it("Spell interface contains all required keys at compile time", () => {
    expect(true).toBe(true);
  });
});
