import { describe, it, expect } from "vitest";
import {
  CLASSIFICATION,
  CLASSIFICATION_DESCRIPTIONS,
  CLASSIFICATION_LABELS,
  getNeedsReviewSubLabel,
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

describe("getNeedsReviewSubLabel", () => {
  it("flags a low score as helping superficially", () => {
    expect(getNeedsReviewSubLabel("needs_review", 0.33)).toBe(
      "Ajudando superficialmente as causas climáticas",
    );
  });

  it("flags a middle score as neutral", () => {
    expect(getNeedsReviewSubLabel("needs_review", 0.45)).toBe(
      "Neutro (não relacionado)",
    );
  });

  it("flags a high score as harming the fight", () => {
    expect(getNeedsReviewSubLabel("needs_review", 0.55)).toBe(
      "Atrapalhando a luta contra a crise climática",
    );
  });

  it("returns null for favorable, unfavorable and neutral", () => {
    expect(getNeedsReviewSubLabel("favorable", 0.25)).toBeNull();
    expect(getNeedsReviewSubLabel("unfavorable", 0.65)).toBeNull();
    expect(getNeedsReviewSubLabel("neutral", 0.45)).toBeNull();
  });

  it("returns null for a missing score", () => {
    expect(getNeedsReviewSubLabel("needs_review", null)).toBeNull();
  });
});

