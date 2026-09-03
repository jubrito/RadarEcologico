import { describe, it, expect } from "vitest";
import { mergeStyles, formatDate, formatSource } from "./utils";

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
