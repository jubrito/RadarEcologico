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

export const CLASSIFICATION_DESCRIPTIONS: Record<KnownClassification, string> =
  {
    favorable:
      "Baixo potencial de dano climático — a proposta tende a contribuir para o combate à crise do clima.",
    unfavorable:
      "Alto potencial de dano climático — a proposta tende a intensificar a crise do clima.",
    needs_review:
      "Impacto climático incerto — requer análise humana para determinar o efeito da proposta.",
    neutral: "Não se relaciona com questões climáticas.",
  };

const NEEDS_REVIEW_LOW_MAX = 0.4;
const NEEDS_REVIEW_MID_MAX = 0.5;

/**
 * Descriptive phrase for a bill's stance, always shown on the detail page.
 *   - favorable   → "Combatendo ativamente as causas da catástrofe climática"
 *   - unfavorable → "Intensificando diretamente as causas da catástrofe climática"
 *   - needs_review → split by score: "Ajudando superficialmente…" (low),
 *                    "Neutro (não relacionado)" (mid), "Atrapalhando a luta…" (high)
 *   - neutral / unknown → null
 */
export function getClassificationPhrase(
  classification: Classification,
  score: number | null | undefined,
): string | null {
  if (score == null) return null;

  if (classification === "favorable") {
    return "Combatendo ativamente as causas da catástrofe climática";
  }
  if (classification === "unfavorable") {
    return "Intensificando diretamente as causas da catástrofe climática";
  }
  if (classification === "needs_review") {
    if (score < NEEDS_REVIEW_LOW_MAX) {
      return "Ajudando superficialmente as causas climáticas";
    }
    if (score < NEEDS_REVIEW_MID_MAX) {
      return "Neutro (nem ajudando nem atrapalhando)";
    }
    return "Atrapalhando a luta contra a crise climática";
  }
  return null;
}
