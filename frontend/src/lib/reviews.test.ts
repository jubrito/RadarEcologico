import { describe, it, expect } from "vitest";
import { classifyFromReviewScore } from "./reviews";

describe("classifyFromReviewScore", () => {
  it("maps low scores to favorable", () => {
    expect(classifyFromReviewScore(0)).toBe("favorable");
    expect(classifyFromReviewScore(39)).toBe("favorable");
  });

  it("maps the ambivalent band (40-59) to neutral, never needs_review", () => {
    expect(classifyFromReviewScore(40)).toBe("neutral");
    expect(classifyFromReviewScore(45)).toBe("neutral");
    expect(classifyFromReviewScore(50)).toBe("neutral");
    expect(classifyFromReviewScore(59)).toBe("neutral");
  });

  it("maps high scores to unfavorable", () => {
    expect(classifyFromReviewScore(60)).toBe("unfavorable");
    expect(classifyFromReviewScore(100)).toBe("unfavorable");
  });

  it("never returns needs_review for a reviewed bill", () => {
    for (let score = 0; score <= 100; score++) {
      expect(classifyFromReviewScore(score)).not.toBe("needs_review");
    }
  });

  it("returns neutral when not related", () => {
    expect(classifyFromReviewScore(50, true)).toBe("neutral");
    expect(classifyFromReviewScore(10, true)).toBe("neutral");
  });
});
