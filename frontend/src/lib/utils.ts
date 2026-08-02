import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CLASSIFICATION_THRESHOLDS, SOURCE_LABELS, type KnownClassification } from "./types";

export function mergeStyles(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getScoreColor(score: number): string {
  if (score < CLASSIFICATION_THRESHOLDS.FAVORABLE_MAX) return "text-emerald-500";
  if (score >= CLASSIFICATION_THRESHOLDS.UNFAVORABLE_MIN) return "text-red-500";
  return "text-amber-500";
}

export function scoreToClassification(score: number): KnownClassification {
  if (score < CLASSIFICATION_THRESHOLDS.FAVORABLE_MAX) return "favorable";
  if (score >= CLASSIFICATION_THRESHOLDS.UNFAVORABLE_MIN) return "unfavorable";
  return "needs_review";
}

export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleDateString("pt-BR");
}

export function formatSource(source: string): string {
  return SOURCE_LABELS[source] || source;
}
