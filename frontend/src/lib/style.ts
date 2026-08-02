import type { Classification } from "./api";

/** Base color token per classification (Tailwind shade-500). */
export const COLORS: Record<Classification, string> = {
  favorable: "emerald-500",
  needs_review: "amber-500",
  unfavorable: "red-500",
  unknown: "gray-500",
} as const;

/** Display labels in Portuguese. */
export const LABELS: Record<Classification, string> = {
  favorable: "Combate à crise climática",
  needs_review: "Requer revisão",
  unfavorable: "Intensifica a crise climática",
  unknown: "Não classificado",
} as const;

/** Replace the shade number in a Tailwind color token (e.g. "emerald-500" → shade(300) → "emerald-300"). */
export function shade(color: string, s: number): string {
  return color.replace(/-\d+$/, `-${s}`);
}
