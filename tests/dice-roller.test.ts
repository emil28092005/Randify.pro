import { describe, it, expect } from "vitest";
import { parseDiceNotation, rollDice } from "../src/lib/client/dice";

describe("Dice Roller", () => {
  describe("parseDiceNotation", () => {
    it("parses d20 notation", () => {
      expect(parseDiceNotation("d20")).toEqual({
        count: 1,
        sides: 20,
        modifier: 0,
      });
    });

    it("parses 2d6+3 notation", () => {
      expect(parseDiceNotation("2d6+3")).toEqual({
        count: 2,
        sides: 6,
        modifier: 3,
      });
    });

    it("parses 3d8-1 notation", () => {
      expect(parseDiceNotation("3d8-1")).toEqual({
        count: 3,
        sides: 8,
        modifier: -1,
      });
    });

    it("parses 1d4 notation", () => {
      expect(parseDiceNotation("1d4")).toEqual({
        count: 1,
        sides: 4,
        modifier: 0,
      });
    });

    it("parses 5d100+10 notation", () => {
      expect(parseDiceNotation("5d100+10")).toEqual({
        count: 5,
        sides: 100,
        modifier: 10,
      });
    });

    it("parses notation with spaces", () => {
      expect(parseDiceNotation(" 2d6 + 3 ")).toEqual({
        count: 2,
        sides: 6,
        modifier: 3,
      });
    });

    it("throws on invalid notation", () => {
      expect(() => parseDiceNotation("abc")).toThrow();
      expect(() => parseDiceNotation("")).toThrow();
    });
  });

  describe("rollDice", () => {
    it("rolls within valid range for 1d20", () => {
      const result = rollDice(1, 20, 0);
      expect(result.total).toBeGreaterThanOrEqual(1);
      expect(result.total).toBeLessThanOrEqual(20);
      expect(result.rolls).toHaveLength(1);
      expect(result.rolls[0]).toBeGreaterThanOrEqual(1);
      expect(result.rolls[0]).toBeLessThanOrEqual(20);
    });

    it("rolls 2d6 within 2-12 range", () => {
      const result = rollDice(2, 6, 0);
      expect(result.total).toBeGreaterThanOrEqual(2);
      expect(result.total).toBeLessThanOrEqual(12);
      expect(result.rolls).toHaveLength(2);
    });

    it("applies positive modifier", () => {
      const result = rollDice(1, 6, 5);
      expect(result.total).toBeGreaterThanOrEqual(6);
      expect(result.total).toBeLessThanOrEqual(11);
      expect(result.modifier).toBe(5);
    });

    it("applies negative modifier", () => {
      const result = rollDice(1, 6, -2);
      expect(result.total).toBeGreaterThanOrEqual(-1);
      expect(result.total).toBeLessThanOrEqual(4);
      expect(result.modifier).toBe(-2);
    });

    it("returns correct structure", () => {
      const result = rollDice(3, 8, 1);
      expect(result).toHaveProperty("rolls");
      expect(result).toHaveProperty("total");
      expect(result).toHaveProperty("modifier");
      expect(Array.isArray(result.rolls)).toBe(true);
      expect(typeof result.total).toBe("number");
      expect(typeof result.modifier).toBe("number");
    });

    it("sum of rolls plus modifier equals total", () => {
      const result = rollDice(4, 10, 3);
      const sum = result.rolls.reduce((a, b) => a + b, 0);
      expect(result.total).toBe(sum + result.modifier);
    });
  });
});
