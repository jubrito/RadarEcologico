import { describe, expect, it } from "vitest";
import {
  SITE_DESCRIPTION,
  SITE_SUBTITLE,
  SITE_TAGLINE,
  SITE_TITLE,
  STATE_NAMES,
} from "./content";

describe("site content", () => {
  it("provides non-empty text for the site identity and metadata", () => {
    expect(SITE_TITLE.trim()).not.toBe("");
    expect(SITE_SUBTITLE.trim()).not.toBe("");
    expect(SITE_DESCRIPTION.trim()).not.toBe("");
    expect(SITE_TAGLINE.trim()).not.toBe("");
  });

  it("describes the climate legislative monitoring scope", () => {
    expect(SITE_DESCRIPTION).toContain("Câmara dos Deputados");
    expect(SITE_DESCRIPTION).toContain("Senado Federal");
    expect(SITE_DESCRIPTION).toContain("crise climática");
    expect(SITE_TAGLINE).toContain("Brasil");
  });
});

describe("STATE_NAMES", () => {
  const brazilianFederativeUnits = [
    "AC",
    "AL",
    "AP",
    "AM",
    "BA",
    "CE",
    "DF",
    "ES",
    "GO",
    "MA",
    "MT",
    "MS",
    "MG",
    "PA",
    "PB",
    "PR",
    "PE",
    "PI",
    "RJ",
    "RN",
    "RS",
    "RO",
    "RR",
    "SC",
    "SP",
    "SE",
    "TO",
  ];

  it("contains every Brazilian federative unit exactly once", () => {
    expect(Object.keys(STATE_NAMES).sort()).toEqual(
      [...brazilianFederativeUnits].sort(),
    );
    expect(Object.values(STATE_NAMES)).toHaveLength(
      new Set(Object.values(STATE_NAMES)).size,
    );
  });

  it("maps representative abbreviations to Portuguese names", () => {
    expect(STATE_NAMES.SP).toBe("São Paulo");
    expect(STATE_NAMES.DF).toBe("Distrito Federal");
    expect(STATE_NAMES.AM).toBe("Amazonas");
  });

  it("does not contain blank state names", () => {
    expect(Object.values(STATE_NAMES).every((name) => name.trim())).toBe(true);
  });
});