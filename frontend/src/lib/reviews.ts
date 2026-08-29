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

const FAVORABLE_MAX = 30; // matches backend: score < 0.30 → favorable
const UNFAVORABLE_MIN = 60; // matches backend: score >= 0.60 → unfavorable

/** Derive the classification from a 0–100 reviewer score, using the same thresholds as the bill detail page. */
export function classifyFromReviewScore(
  score: number,
  notRelated = false,
): Classification {
  if (notRelated) return "neutral";
  if (score < FAVORABLE_MAX) return "favorable";
  if (score >= UNFAVORABLE_MIN) return "unfavorable";
  return "needs_review";
}

export async function fetchReviews(): Promise<BillReview[]> {
  const { data, error } = await getSupabase()
    .from("bill_reviews")
    .select("*")
    .order("reviewed_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as BillReview[];
}

export async function upsertReview(
  review: Omit<BillReview, "reviewed_at">,
): Promise<void> {
  const { error } = await getSupabase().from("bill_reviews").upsert(review, {
    onConflict: "source,external_id",
  });
  if (error) throw new Error(error.message);
}
