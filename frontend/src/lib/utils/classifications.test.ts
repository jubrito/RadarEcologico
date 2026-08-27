import { describe, it, expect } from "vitest";
import {
  CLASSIFICATION,
  CLASSIFICATION_DESCRIPTIONS,
  CLASSIFICATION_LABELS,
  getSuperficialLabel,
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

describe("getSuperficialLabel", () => {
  it("flags weakly favorable bills as helping superficially", () => {
    expect(getSuperficialLabel("favorable", 0.25)).toBe(
      "Ajudando superficialmente",
    );
  });

  it("does not flag strongly favorable bills", () => {
    expect(getSuperficialLabel("favorable", 0.05)).toBeNull();
  });

  it("flags weakly unfavorable bills as harming superficially", () => {
    expect(getSuperficialLabel("unfavorable", 0.65)).toBe(
      "Prejudicando superficialmente",
    );
  });

  it("does not flag strongly unfavorable bills", () => {
    expect(getSuperficialLabel("unfavorable", 0.9)).toBeNull();
  });

  it("returns null for neutral and needs_review", () => {
    expect(getSuperficialLabel("neutral", 0.45)).toBeNull();
    expect(getSuperficialLabel("needs_review", 0.5)).toBeNull();
  });

  it("returns null for a missing score", () => {
    expect(getSuperficialLabel("favorable", null)).toBeNull();
  });
});

