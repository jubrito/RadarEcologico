import { getSupabase } from "./supabase";
import type { Classification } from "./types";

export interface BillReview {
  source: string;
  external_id: string;
  reviewed_by: string;
  reviewer_score: number;
  reviewer_classification: Classification;
  reviewer_notes?: string | null;
  not_related: boolean;
  reviewed_at: string;
}

// Reviewer thresholds (0–100), aligned with the fine score bands in
// `REVIEW_BANDS` (favorable = 0–39, ambivalente = 40–59, unfavorable = 60–100).
// The "uncertainty" band that maps to `needs_review` only applies BEFORE a
// human review; a reviewed bill is always a verdict, so the ambivalente band
// rolls up to `neutral`.
export const REVIEW_FAVORABLE_MAX = 40;
export const REVIEW_UNFAVORABLE_MIN = 60;

/**
 * Coarse classification from a reviewer's 0–100 score. A human review is
 * always a verdict, so it never returns `needs_review`:
 *   - not related → neutral
 *   - score < 40 → favorable
 *   - score 40–59 → neutral (ambivalent stance)
 *   - score ≥ 60 → unfavorable
 * The fine stance (combate/ajuda/…) is derived separately via `deriveStance`.
 */
export function classifyFromReviewScore(
  score: number,
  notRelated = false,
): Classification {
  if (notRelated) return "neutral";
  if (score < REVIEW_FAVORABLE_MAX) return "favorable";
  if (score >= REVIEW_UNFAVORABLE_MIN) return "unfavorable";
  return "neutral";
}

export async function fetchReviews(): Promise<BillReview[]> {
  const { data, error } = await getSupabase()
    .from("bill_reviews")
    .select("*")
    .order("reviewed_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as BillReview[];
}

/** Fetch the review for a single bill, or null if it has none. */
export async function fetchReview(
  source: string,
  externalId: string,
): Promise<BillReview | null> {
  const { data, error } = await getSupabase()
    .from("bill_reviews")
    .select("*")
    .eq("source", source)
    .eq("external_id", externalId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data ?? null) as BillReview | null;
}

export async function upsertReview(
  review: Omit<BillReview, "reviewed_at">,
): Promise<void> {
  const { error } = await getSupabase().from("bill_reviews").upsert(review, {
    onConflict: "source,external_id",
  });
  if (error) throw new Error(error.message);
}
