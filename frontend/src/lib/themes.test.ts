import { describe, it, expect } from "vitest";
import { THEME_MAP, sortedThemeEntries, themeNamesFromIds } from "./themes";

const BACKEND_THEME_CODES = [
  "40",
  "41",
  "44",
  "48",
  "51",
  "54",
  "55",
  "56",
  "61",
  "62",
  "64",
  "66",
  "70",
  "76",
  "povos_indigenas",
];

describe("THEME_MAP", () => {
  it("keeps parity with the backend climate theme codes", () => {
    expect(Object.keys(THEME_MAP).sort()).toEqual(BACKEND_THEME_CODES);
  });

  it("has non-empty labels for every theme", () => {
    for (const label of Object.values(THEME_MAP)) {
      expect(label.trim()).not.toBe("");
    }
  });
});

describe("themeNamesFromIds", () => {
  it("maps a single code to its name", () => {
    expect(themeNamesFromIds("48")).toEqual([
      "Meio Ambiente e Desenvolvimento Sustentável",
    ]);
  });

  it("sorts theme entries alphabetically by name", () => {
    const entries = sortedThemeEntries();
    const names = entries.map(([, name]) => name);
    const sorted = [...names].sort((a, b) => a.localeCompare(b, "pt-BR"));
    expect(names).toEqual(sorted);
  });

  it("maps multiple codes in order", () => {
    expect(themeNamesFromIds("48,54")).toEqual([
      "Meio Ambiente e Desenvolvimento Sustentável",
      "Energia, Recursos Hídricos e Minerais",
    ]);
  });

  it("maps the indigenous theme id to its name", () => {
    expect(themeNamesFromIds("povos_indigenas")).toEqual([
      "Povos Indígenas e Comunidades Tradicionais",
    ]);
  });

  it("trims whitespace around codes", () => {
    expect(themeNamesFromIds(" 48 , 54 ")).toEqual([
      "Meio Ambiente e Desenvolvimento Sustentável",
      "Energia, Recursos Hídricos e Minerais",
    ]);
  });

  it("drops unknown codes", () => {
    expect(themeNamesFromIds("48,999")).toEqual([
      "Meio Ambiente e Desenvolvimento Sustentável",
    ]);
  });

  it("returns empty array for null/undefined/empty", () => {
    expect(themeNamesFromIds(null)).toEqual([]);
    expect(themeNamesFromIds(undefined)).toEqual([]);
    expect(themeNamesFromIds("")).toEqual([]);
  });
});
