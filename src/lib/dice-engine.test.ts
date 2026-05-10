import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  parseDiceNotation,
  rollDice,
  rollAdvantage,
  buildNotation,
  isAdvancedNotation,
} from "./dice-engine";

describe("parseDiceNotation", () => {
  it('parses basic notation "d6"', () => {
    const parsed = parseDiceNotation("d6");
    expect(parsed).not.toBeNull();
    expect(parsed!.count).toBe(1);
    expect(parsed!.sides).toBe(6);
    expect(parsed!.modifier).toBe(0);
    expect(parsed!.keepDrop).toBeNull();
    expect(parsed!.explode.active).toBe(false);
    expect(parsed!.reroll.active).toBe(false);
  });

  it('parses "2d20+3"', () => {
    const parsed = parseDiceNotation("2d20+3");
    expect(parsed).not.toBeNull();
    expect(parsed!.count).toBe(2);
    expect(parsed!.sides).toBe(20);
    expect(parsed!.modifier).toBe(3);
  });

  it('parses "3d8-1"', () => {
    const parsed = parseDiceNotation("3d8-1");
    expect(parsed!.count).toBe(3);
    expect(parsed!.sides).toBe(8);
    expect(parsed!.modifier).toBe(-1);
  });

  it('parses "4d6kh3"', () => {
    const parsed = parseDiceNotation("4d6kh3");
    expect(parsed!.keepDrop).toEqual({ type: "kh", count: 3 });
  });

  it('parses "5d6dl2"', () => {
    const parsed = parseDiceNotation("5d6dl2");
    expect(parsed!.keepDrop).toEqual({ type: "dl", count: 2 });
  });

  it('parses exploding "3d6!"', () => {
    const parsed = parseDiceNotation("3d6!");
    expect(parsed!.explode.active).toBe(true);
    expect(parsed!.explode.penetrating).toBe(false);
    expect(parsed!.explode.threshold).toBe(6);
  });

  it('parses penetrating explode "2d10!p"', () => {
    const parsed = parseDiceNotation("2d10!p");
    expect(parsed!.explode.active).toBe(true);
    expect(parsed!.explode.penetrating).toBe(true);
  });

  it('parses explode with custom threshold "2d6!>4"', () => {
    const parsed = parseDiceNotation("2d6!>4");
    expect(parsed!.explode.active).toBe(true);
    expect(parsed!.explode.threshold).toBe(4);
  });

  it('parses reroll "2d6r1"', () => {
    const parsed = parseDiceNotation("2d6r1");
    expect(parsed!.reroll.active).toBe(true);
    expect(parsed!.reroll.once).toBe(false);
    expect(parsed!.reroll.values).toContain(1);
  });

  it('parses reroll once "2d6ro1"', () => {
    const parsed = parseDiceNotation("2d6ro1");
    expect(parsed!.reroll.active).toBe(true);
    expect(parsed!.reroll.once).toBe(true);
  });

  it('parses reroll less-than "2d6r<3"', () => {
    const parsed = parseDiceNotation("2d6r<3");
    expect(parsed!.reroll.active).toBe(true);
    expect(parsed!.reroll.values).toContain(1);
    expect(parsed!.reroll.values).toContain(2);
    expect(parsed!.reroll.values).not.toContain(3);
  });

  it("ignores whitespace", () => {
    const parsed = parseDiceNotation("  2 d 20 + 5  ");
    expect(parsed!.count).toBe(2);
    expect(parsed!.sides).toBe(20);
    expect(parsed!.modifier).toBe(5);
  });

  it("returns null for invalid notation", () => {
    expect(parseDiceNotation("")).toBeNull();
    expect(parseDiceNotation("abc")).toBeNull();
    expect(parseDiceNotation("2d6+1+2")).toBeNull();
    expect(parseDiceNotation("0d6")).toBeNull();
    expect(parseDiceNotation("21d6")).toBeNull();
    expect(parseDiceNotation("2d0")).toBeNull();
    expect(parseDiceNotation("2d6kh0")).toBeNull();
    expect(parseDiceNotation("2d6kh2")).toBeNull();
  });
});

describe("rollDice", () => {
  let mathRandomSpy: ReturnType<typeof vi.spyOn>;

  afterEach(() => {
    mathRandomSpy?.mockRestore();
  });

  it("rolls basic dice", () => {
    mathRandomSpy = vi.spyOn(Math, "random").mockReturnValue(0.5);
    const parsed = parseDiceNotation("3d6")!;
    const result = rollDice(parsed);

    expect(result.dice).toHaveLength(3);
    expect(result.kept).toHaveLength(3);
    expect(result.dropped).toHaveLength(0);
    expect(result.total).toBe(12); // each die: floor(0.5*6)+1 = 4, 3*4 = 12
  });

  it("applies modifier", () => {
    mathRandomSpy = vi.spyOn(Math, "random").mockReturnValue(0.5);
    const parsed = parseDiceNotation("1d20+5")!;
    const result = rollDice(parsed);

    expect(result.total).toBe(16); // 11 + 5
  });

  it("keeps highest rolls (kh)", () => {
    mathRandomSpy = vi
      .spyOn(Math, "random")
      .mockReturnValueOnce(0.1) // 1
      .mockReturnValueOnce(0.9) // 6
      .mockReturnValueOnce(0.5); // 4

    const parsed = parseDiceNotation("3d6kh2")!;
    const result = rollDice(parsed);

    expect(result.kept).toHaveLength(2);
    expect(result.dropped).toHaveLength(1);
    expect(result.dropped[0].dropped).toBe(true);
    expect(result.total).toBe(10); // 6 + 4
  });

  it("drops highest rolls (dh)", () => {
    mathRandomSpy = vi
      .spyOn(Math, "random")
      .mockReturnValueOnce(0.1) // 1
      .mockReturnValueOnce(0.9) // 6
      .mockReturnValueOnce(0.5); // 4

    const parsed = parseDiceNotation("3d6dh1")!;
    const result = rollDice(parsed);

    expect(result.kept).toHaveLength(2);
    expect(result.dropped).toHaveLength(1);
    expect(result.dropped[0].value).toBe(6);
    expect(result.total).toBe(5); // 1 + 4
  });

  it("handles exploding dice", () => {
    mathRandomSpy = vi
      .spyOn(Math, "random")
      .mockReturnValueOnce(0.99) // first roll: 6 (max, triggers explode)
      .mockReturnValueOnce(0.99) // explosion 1: 6 (triggers again)
      .mockReturnValueOnce(0.1); // explosion 2: 1 (stops)

    const parsed = parseDiceNotation("1d6!")!;
    const result = rollDice(parsed);

    expect(result.dice[0].exploded).toBe(true);
    expect(result.dice[0].explosions).toEqual([6, 1]);
    expect(result.total).toBe(13); // 6 + 6 + 1
  });

  it("handles penetrating explode", () => {
    mathRandomSpy = vi
      .spyOn(Math, "random")
      .mockReturnValueOnce(0.99) // first roll: 6 (explode)
      .mockReturnValueOnce(0.99); // explosion: 6 -> penetrating -> 5, then 5 < 6 stops

    const parsed = parseDiceNotation("1d6!p")!;
    const result = rollDice(parsed);

    expect(result.dice[0].explosions).toEqual([5]);
    expect(result.total).toBe(11); // 6 + 5
  });

  it("handles reroll", () => {
    mathRandomSpy = vi
      .spyOn(Math, "random")
      .mockReturnValueOnce(0.0) // first roll: 1 (reroll)
      .mockReturnValueOnce(0.5); // reroll: 4

    const parsed = parseDiceNotation("1d6r1")!;
    const result = rollDice(parsed);

    expect(result.dice[0].rerolledFrom).toBe(1);
    expect(result.dice[0].value).toBe(4);
  });

  it("handles reroll once (ro)", () => {
    mathRandomSpy = vi
      .spyOn(Math, "random")
      .mockReturnValueOnce(0.0) // first: 1 (reroll once)
      .mockReturnValueOnce(0.0); // second: 1 (stays, no more rerolls)

    const parsed = parseDiceNotation("1d6ro1")!;
    const result = rollDice(parsed);

    expect(result.dice[0].rerolledFrom).toBe(1);
    expect(result.dice[0].value).toBe(1);
  });
});

describe("rollAdvantage", () => {
  let mathRandomSpy: ReturnType<typeof vi.spyOn>;

  afterEach(() => {
    mathRandomSpy?.mockRestore();
  });

  it("returns highest for advantage", () => {
    mathRandomSpy = vi
      .spyOn(Math, "random")
      .mockReturnValueOnce(0.1) // 3
      .mockReturnValueOnce(0.9); // 19

    const result = rollAdvantage(20, 0, true);
    expect(result.total).toBe(19);
    expect(result.advantageRolls).toEqual([3, 19]);
  });

  it("returns lowest for disadvantage", () => {
    mathRandomSpy = vi
      .spyOn(Math, "random")
      .mockReturnValueOnce(0.9) // 19
      .mockReturnValueOnce(0.1); // 3

    const result = rollAdvantage(20, 2, false);
    expect(result.total).toBe(5); // 3 + 2
    expect(result.advantageRolls).toEqual([19, 3]);
  });
});

describe("buildNotation", () => {
  it("builds basic notation", () => {
    expect(buildNotation(1, 6, 0)).toBe("1d6");
    expect(buildNotation(2, 20, 0)).toBe("2d20");
  });

  it("adds positive modifier", () => {
    expect(buildNotation(2, 6, 3)).toBe("2d6+3");
  });

  it("adds negative modifier", () => {
    expect(buildNotation(2, 6, -2)).toBe("2d6-2");
  });
});

describe("isAdvancedNotation", () => {
  it("returns false for basic notation", () => {
    expect(isAdvancedNotation("2d6")).toBe(false);
    expect(isAdvancedNotation("1d20+5")).toBe(false);
    expect(isAdvancedNotation("3d8-1")).toBe(false);
  });

  it("returns true for keep/drop", () => {
    expect(isAdvancedNotation("4d6kh3")).toBe(true);
    expect(isAdvancedNotation("5d6dl2")).toBe(true);
  });

  it("returns true for explode", () => {
    expect(isAdvancedNotation("3d6!")).toBe(true);
    expect(isAdvancedNotation("2d10!p")).toBe(true);
  });

  it("returns true for reroll", () => {
    expect(isAdvancedNotation("2d6r1")).toBe(true);
    expect(isAdvancedNotation("2d6ro1")).toBe(true);
    expect(isAdvancedNotation("2d6r<3")).toBe(true);
  });
});
