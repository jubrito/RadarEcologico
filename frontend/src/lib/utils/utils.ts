import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { SOURCE_LABELS } from "../types";

export function mergeStyles(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
