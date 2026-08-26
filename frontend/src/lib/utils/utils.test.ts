import { describe, it, expect } from "vitest";
import {
  mergeStyles,
  getScoreColor,
  scoreToClassification,
  formatDate,
  formatSource,
} from "./utils";

describe("mergeStyles", () => {
  it("merges class names", () => {
    const result = mergeStyles("text-red-500", "font-bold");
    expect(result).toContain("text-red-500");
    expect(result).toContain("font-bold");
  });

  it("resolves tailwind conflicts", () => {
    const result = mergeStyles("p-4", "p-2");
    expect(result).toContain("p-2");
    expect(result).not.toContain("p-4");
  });

  it("handles empty input", () => {
    expect(mergeStyles()).toBe("");
  });
});

describe("getScoreColor", () => {
  it("returns emerald for favorable scores", () => {
    expect(getScoreColor(0)).toContain("emerald");
    expect(getScoreColor(0.1)).toContain("emerald");
    expect(getScoreColor(0.29)).toContain("emerald");
  });

  it("returns red for unfavorable scores", () => {
    expect(getScoreColor(0.6)).toContain("red");
    expect(getScoreColor(0.8)).toContain("red");
    expect(getScoreColor(1)).toContain("red");
  });

  it("returns amber for needs_review scores", () => {
    expect(getScoreColor(0.3)).toContain("amber");
    expect(getScoreColor(0.45)).toContain("amber");
    expect(getScoreColor(0.59)).toContain("amber");
  });
});

describe("scoreToClassification", () => {
  it('returns "favorable" for scores < 0.30', () => {
    expect(scoreToClassification(0)).toBe("favorable");
    expect(scoreToClassification(0.1)).toBe("favorable");
    expect(scoreToClassification(0.29)).toBe("favorable");
  });

  it('returns "unfavorable" for scores >= 0.60', () => {
    expect(scoreToClassification(0.6)).toBe("unfavorable");
    expect(scoreToClassification(0.8)).toBe("unfavorable");
    expect(scoreToClassification(1)).toBe("unfavorable");
  });

  it('returns "needs_review" for scores between 0.30 and 0.60', () => {
    expect(scoreToClassification(0.3)).toBe("needs_review");
    expect(scoreToClassification(0.45)).toBe("needs_review");
    expect(scoreToClassification(0.59)).toBe("needs_review");
  });
});

describe("formatDate", () => {
  it("returns em-dash for null", () => {
    expect(formatDate(null)).toBe("—");
  });

  it("returns em-dash for undefined", () => {
    expect(formatDate(undefined)).toBe("—");
  });

  it("formats ISO date string to pt-BR", () => {
    const result = formatDate("2026-01-15T00:00:00");
    expect(result).toContain("15");
    expect(result).toContain("2026");
  });

  it("formats date-only string without timezone shift", () => {
    expect(formatDate("2026-02-02")).toBe("02/02/2026");
  });
});

describe("formatSource", () => {
  it('returns "Câmara dos Deputados" for camara', () => {
    expect(formatSource("camara")).toBe("Câmara dos Deputados");
  });

  it('returns "Senado Federal" for senado', () => {
    expect(formatSource("senado")).toBe("Senado Federal");
  });

  it("returns raw value for unknown source", () => {
    expect(formatSource("desconhecido")).toBe("desconhecido");
  });
});
