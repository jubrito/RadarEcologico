import { describe, it, expect } from "vitest";
import {
  CLASSIFICATION,
  CLASSIFICATION_DESCRIPTIONS,
  CLASSIFICATION_LABELS,
  getClassificationPhrase,
  isValidClassification,
} from "./classifications";

const KNOWN = ["favorable", "needs_review", "unfavorable", "neutral"];

describe("isValidClassification", () => {
  it("accepts known classifications", () => {
    for (const value of Object.values(CLASSIFICATION)) {
      expect(isValidClassification(value)).toBe(true);
    }
  });

  it("rejects unknown values", () => {
    expect(isValidClassification("transforming")).toBe(false);
    expect(isValidClassification("garbage")).toBe(false);
    expect(isValidClassification("")).toBe(false);
  });
});

describe("CLASSIFICATION_LABELS", () => {
  it("has a short label for every known classification", () => {
    expect(Object.keys(CLASSIFICATION_LABELS).sort()).toEqual([...KNOWN].sort());
    for (const key of KNOWN) {
      expect(CLASSIFICATION_LABELS[key as keyof typeof CLASSIFICATION_LABELS].trim()).not.toBe("");
    }
  });
});

describe("CLASSIFICATION_DESCRIPTIONS", () => {
  it("has a description for every known classification", () => {
    expect(Object.keys(CLASSIFICATION_DESCRIPTIONS).sort()).toEqual(
      [...KNOWN].sort(),
    );
    for (const key of KNOWN) {
      expect(
        CLASSIFICATION_DESCRIPTIONS[key as keyof typeof CLASSIFICATION_DESCRIPTIONS].trim(),
      ).not.toBe("");
    }
  });
});

describe("getClassificationPhrase", () => {
  it("describes favorable bills by score band", () => {
    expect(getClassificationPhrase("favorable", 0.15)).toBe(
      "Ativamente combate as causas da catástrofe climática ou minimiza as suas consequências.",
    );
    expect(getClassificationPhrase("favorable", 0.3)).toBe(
      "Ajuda de alguma forma (mesmo que não significativamente) no combate às causas da catástrofe climática ou a minimização de suas consequências.",
    );
  });

  it("describes unfavorable bills by score band", () => {
    expect(getClassificationPhrase("unfavorable", 0.8)).toBe(
      "Intensifica diretamente as causas da catástrofe climática ou piora as suas consequências.",
    );
    expect(getClassificationPhrase("unfavorable", 0.65)).toBe(
      "Atrapalha de alguma forma (mesmo que não significativamente) o combate às causas da catástrofe climática ou a minimização de suas consequências.",
    );
  });

  it("splits needs_review by the same score bands as the reviewed taxonomy", () => {
    expect(getClassificationPhrase("needs_review", 0.35)).toBe(
      "Ajuda de alguma forma (mesmo que não significativamente) no combate às causas da catástrofe climática ou a minimização de suas consequências.",
    );
    expect(getClassificationPhrase("needs_review", 0.45)).toBe(
      "Nem ajuda nem atrapalha significativamente o combate às causas da catástrofe climática ou a minimização de suas consequências.",
    );
    expect(getClassificationPhrase("needs_review", 0.6)).toBe(
      "Atrapalha de alguma forma (mesmo que não significativamente) o combate às causas da catástrofe climática ou a minimização de suas consequências.",
    );
  });

  it("respects the needs_review band boundaries", () => {
    expect(getClassificationPhrase("needs_review", 0.35)).not.toBeNull();
    expect(getClassificationPhrase("needs_review", 0.39)).toBe(
      "Ajuda de alguma forma (mesmo que não significativamente) no combate às causas da catástrofe climática ou a minimização de suas consequências.",
    );
    expect(getClassificationPhrase("needs_review", 0.4)).toBe(
      "Nem ajuda nem atrapalha significativamente o combate às causas da catástrofe climática ou a minimização de suas consequências.",
    );
    expect(getClassificationPhrase("needs_review", 0.59)).toBe(
      "Nem ajuda nem atrapalha significativamente o combate às causas da catástrofe climática ou a minimização de suas consequências.",
    );
    expect(getClassificationPhrase("needs_review", 0.6)).toBe(
      "Atrapalha de alguma forma (mesmo que não significativamente) o combate às causas da catástrofe climática ou a minimização de suas consequências.",
    );
  });

  it("shows the ambivalent phrase for a neutral roll-up (reviewed ambivalent bill)", () => {
    expect(getClassificationPhrase("neutral", 0.45)).toBe(
      "Nem ajuda nem atrapalha significativamente o combate às causas da catástrofe climática ou a minimização de suas consequências.",
    );
  });

  it("shows the sem-relacao phrase for neutral when notRelated is true", () => {
    expect(getClassificationPhrase("neutral", 0.45, true)).toBe(
      "Não se relaciona com questões climáticas.",
    );
  });

  it("returns null for unknown", () => {
    expect(getClassificationPhrase("unknown", 0.45)).toBeNull();
  });

  it("returns null for a missing score", () => {
    expect(getClassificationPhrase("favorable", null)).toBeNull();
  });
});

