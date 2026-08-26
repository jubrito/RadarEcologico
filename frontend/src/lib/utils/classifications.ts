import type { Classification, KnownClassification } from "../types";

export const CLASSIFICATION = {
  favorable: "favorable",
  needs_review: "needs_review",
  unfavorable: "unfavorable",
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
};

export const CLASSIFICATION_DESCRIPTIONS: Record<KnownClassification, string> = {
  favorable:
    "Baixo potencial de dano climático — a proposta tende a contribuir para o combate à crise do clima.",
  unfavorable:
    "Alto potencial de dano climático — a proposta tende a intensificar a crise do clima.",
  needs_review:
    "Impacto climático incerto — requer análise humana para determinar o efeito da proposta.",
};
