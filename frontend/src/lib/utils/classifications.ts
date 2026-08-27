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
    return "Ativamente combate as causas da catástrofe climática ou a minimiza as suas consequências.";
  }
  if (classification === "unfavorable") {
    return "Intensifica diretamente as causas da catástrofe climática ou piora as suas consequências.";
  }
  if (classification === "needs_review") {
    if (score < NEEDS_REVIEW_LOW_MAX) {
      return "Ajuda de alguma forma (mesmo que não significativamente) no combate às causas da catástrofe climática ou a minimização de suas consequências.";
    }
    if (score < NEEDS_REVIEW_MID_MAX) {
      return "Neutro (nem ajuda nem atrapalha significativamente o combate as causas da catastrofe climática ou a minimização de suas consequências)";
    }
    return "Atrapalha de alguma forma (mesmo que não significativamente) o combate às causas da catástrofe climática ou a minimização de suas consequências.";
  }
  return null;
}
