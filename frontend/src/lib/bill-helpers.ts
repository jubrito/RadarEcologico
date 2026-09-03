import type { Bill } from "./api";
import type { Classification } from "./types";
import { CLASSIFICATION } from "./utils/classifications";
import { CLASSIFICATION_THRESHOLDS } from "./types";
import { classifyFromReviewScore } from "./reviews";

export interface ParsedAuthor {
  name: string | null;
  party: string | null;
  state: string | null;
}

/**
 * Parse bill author field for both structured (author_party, author_state)
 * and embedded formats ("Dep. Name (PP/SP)").
 */
export function parseAuthor(bill: Bill): ParsedAuthor {
  const match = bill.author?.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
  const cleanName = match ? match[1].trim() : bill.author ?? null;
  const embedded = match ? match[2].trim() : null;

  return {
    name: cleanName,
    party:
      bill.author_party ?? embedded?.split("/")[0]?.trim() ?? null,
    state:
      bill.author_state ?? embedded?.split("/")[1]?.trim() ?? null,
  };
}

/**
 * Derive the classification shown to the user from the score (the single
 * source of truth), never from the stored `classification` field — the stored
 * value can be stale (e.g. computed with the old thresholds) and would
 * disagree with the percentage/phrase. Reviewed bills roll up through
 * `classifyFromReviewScore` (never `needs_review`); unreviewed bills use the
 * current machine thresholds on `final_score`.
 */
export function deriveBillClassification(bill: Bill): Classification {
  if (bill.reviewed && bill.reviewed_score != null) {
    return classifyFromReviewScore(
      bill.reviewed_score,
      bill.reviewed_not_related ?? false,
    );
  }
  const score = bill.final_score;
  if (score == null) return bill.classification ?? CLASSIFICATION.unknown;
  if (score < CLASSIFICATION_THRESHOLDS.FAVORABLE_MAX) {
    return CLASSIFICATION.favorable;
  }
  if (score >= CLASSIFICATION_THRESHOLDS.UNFAVORABLE_MIN) {
    return CLASSIFICATION.unfavorable;
  }
  return CLASSIFICATION.needs_review;
}
