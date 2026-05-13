import { describe, it, expect, beforeEach } from "vitest";
import { getClientLang, getClientT } from "./i18n";
import type { T } from "@/i18n/translations";

const mockDocument = {
  documentElement: {
    lang: "en",
  },
};

(globalThis as Record<string, unknown>).document = mockDocument;

describe("getClientLang", () => {
  beforeEach(() => {
    mockDocument.documentElement.lang = "en";
  });

  it('returns "en" when document.documentElement.lang is "en"', () => {
    mockDocument.documentElement.lang = "en";
    expect(getClientLang()).toBe("en");
  });

  it('returns "ru" when document.documentElement.lang is "ru"', () => {
    mockDocument.documentElement.lang = "ru";
    expect(getClientLang()).toBe("ru");
  });

  it('defaults to "en" for unsupported languages', () => {
    mockDocument.documentElement.lang = "fr";
    expect(getClientLang()).toBe("en");
  });
});

describe("getClientT", () => {
  beforeEach(() => {
    mockDocument.documentElement.lang = "en";
  });

  it("returns English translations when lang is 'en'", () => {
    mockDocument.documentElement.lang = "en";
    const t: T = getClientT();
    expect(t.allGenerators).toBe("All generators");
  });

  it("returns Russian translations when lang is 'ru'", () => {
    mockDocument.documentElement.lang = "ru";
    const t: T = getClientT();
    expect(t.allGenerators).toBe("Все генераторы");
  });
});
