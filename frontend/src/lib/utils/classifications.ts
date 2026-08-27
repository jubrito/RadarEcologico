import type { Classification, KnownClassification } from "../types";

export const CLASSIFICATION = {
  favorable: "favorable",
  needs_review: "needs_review",
  unfavorable: "unfavorable",
  neutral: "neutral",
  unknown: "unknown",
} as const;

const VALID_CLASSIFICATIONS = new Set<string>(Object.values(CLASSIFICATION));

export function isValidClassification(value: string): value is Classification {
  return VALID_CLASSIFICATIONS.has(value);
}

export const CLASSIFICATION_LABELS: Record<KnownClassification, string> = {
  favorable: "Combate à crise",
  needs_review: "Requer revisão",
  unfavorable: "Agravamento",
  neutral: "Neutro",
};

export const CLASSIFICATION_DESCRIPTIONS: Record<KnownClassification, string> = {
  favorable:
    "Baixo potencial de dano climático — a proposta tende a contribuir para o combate à crise do clima.",
  unfavorable:
    "Alto potencial de dano climático — a proposta tende a intensificar a crise do clima.",
  needs_review:
    "Impacto climático incerto — requer análise humana para determinar o efeito da proposta.",
  neutral:
    "Não se relaciona com questões climáticas.",
};

const SUPERFICIAL_FAVORABLE_MIN = 0.2;
const SUPERFICIAL_UNFAVORABLE_MAX = 0.7;

/**
 * A nuance shown only on the bill detail page: when a bill leans favorable or
 * unfavorable but only weakly (score close to the boundary), flag it as
 * "superficial" so reviewers can tell it doesn't address the root cause.
 */
export function getSuperficialLabel(
  classification: Classification,
  score: number | null | undefined,
): string | null {
  if (score == null) return null;
  if (classification === "favorable" && score >= SUPERFICIAL_FAVORABLE_MIN) {
    return "Ajudando superficialmente";
  }
  if (classification === "unfavorable" && score < SUPERFICIAL_UNFAVORABLE_MAX) {
    return "Prejudicando superficialmente";
  }
  return null;
}
