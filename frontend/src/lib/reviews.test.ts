import { describe, it, expect } from "vitest";
import { classifyFromReviewScore } from "./reviews";

describe("classifyFromReviewScore", () => {
  it("maps low scores to favorable", () => {
    expect(classifyFromReviewScore(0)).toBe("favorable");
    expect(classifyFromReviewScore(29)).toBe("favorable");
  });

  it("maps mid scores to needs_review", () => {
    expect(classifyFromReviewScore(30)).toBe("needs_review");
    expect(classifyFromReviewScore(45)).toBe("needs_review");
    expect(classifyFromReviewScore(59)).toBe("needs_review");
  });

  it("maps high scores to unfavorable", () => {
    expect(classifyFromReviewScore(60)).toBe("unfavorable");
    expect(classifyFromReviewScore(100)).toBe("unfavorable");
  });

  it("returns neutral when not related", () => {
    expect(classifyFromReviewScore(50, true)).toBe("neutral");
    expect(classifyFromReviewScore(10, true)).toBe("neutral");
  });
});
