import { describe, it, expect } from "vitest";
import {
  CLASSIFICATION,
  CLASSIFICATION_DESCRIPTIONS,
  CLASSIFICATION_LABELS,
  isValidClassification,
} from "./classifications";

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
    const known = ["favorable", "needs_review", "unfavorable"] as const;
    expect(Object.keys(CLASSIFICATION_LABELS).sort()).toEqual([...known].sort());
    for (const key of known) {
      expect(CLASSIFICATION_LABELS[key].trim()).not.toBe("");
    }
  });
});

describe("CLASSIFICATION_DESCRIPTIONS", () => {
  it("has a description for every known classification", () => {
    const known = ["favorable", "needs_review", "unfavorable"] as const;
    expect(Object.keys(CLASSIFICATION_DESCRIPTIONS).sort()).toEqual(
      [...known].sort(),
    );
    for (const key of known) {
      expect(CLASSIFICATION_DESCRIPTIONS[key].trim()).not.toBe("");
    }
  });
});
