import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  CLASSIFICATION_THRESHOLDS,
  SOURCE_LABELS,
  type KnownClassification,
} from "../types";

export function mergeStyles(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getScoreColor(score: number): string {
  if (score < CLASSIFICATION_THRESHOLDS.FAVORABLE_MAX)
    return "text-emerald-500";
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
  // Date-only strings (e.g. "2026-02-02") are parsed as UTC by `new Date`,
  // which can shift the day in negative offsets. Force local midnight.
  const date = new Date(
    dateStr.includes("T") ? dateStr : `${dateStr}T00:00:00`,
  );
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatSource(source: string): string {
  return SOURCE_LABELS[source as keyof typeof SOURCE_LABELS] || source;
}
