import type {
  Classification,
  ClassificationStyle,
  KnownClassification,
  Stance,
  StanceGroup,
  StanceInfo,
} from "../types";
import { STANCE } from "../types";

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

// --- Fine-grained reviewer stances (derived from score, never from the AI) ---

export const STANCE_GROUP_LABELS: Record<StanceGroup, string> = {
  favoraveis: "Favoráveis à luta climática",
  ambivalentes: "Ambivalentes",
  desfavoraveis: "Desfavoráveis à luta climática",
};

const STANCE_LABELS: Record<Stance, string> = {
  combate: "Combate a crise",
  ajuda: "Ajuda a luta",
  ambivalente: "Nem ajuda nem atrapalha",
  atrapalha: "Atrapalha a luta",
  intensifica: "Intensifica a crise",
  sem_relacao: "Sem relação climática",
};

const STANCE_GROUPS: Record<Stance, StanceGroup> = {
  combate: "favoraveis",
  ajuda: "favoraveis",
  ambivalente: "ambivalentes",
  atrapalha: "desfavoraveis",
  intensifica: "desfavoraveis",
  sem_relacao: "ambivalentes",
};

const STANCE_PHRASE = {
  [STANCE.combate]:
    "Ativamente combate as causas da catástrofe climática ou minimiza as suas consequências.",
  [STANCE.ajuda]:
    "Ajuda de alguma forma (mesmo que não significativamente) no combate às causas da catástrofe climática ou a minimização de suas consequências.",
  [STANCE.ambivalente]:
    "Nem ajuda nem atrapalha significativamente o combate às causas da catástrofe climática ou a minimização de suas consequências.",
  [STANCE.atrapalha]:
    "Atrapalha de alguma forma (mesmo que não significativamente) o combate às causas da catástrofe climática ou a minimização de suas consequências.",
  [STANCE.intensifica]:
    "Intensifica diretamente as causas da catástrofe climática ou piora as suas consequências.",
} as const;

/**
 * Style tokens per stance, so gravity is visible at a glance (deep vs soft
 * emerald, orange vs deep red). Reuses the `ClassificationStyle` shape.
 */
export const STANCE_MAP: Record<Stance, ClassificationStyle> = {
  combate: {
    gradient: "from-emerald-500 to-emerald-300",
    badge: "bg-emerald-600/20 text-emerald-400",
    border: "border-emerald-500/30",
    fadedBg: "bg-emerald-950/30",
    hoverFadedBg: "hover:bg-emerald-950/30",
    hoverSolidBg: "hover:bg-emerald-500",
    hoverSolidBorder: "hover:border-emerald-500",
    textAccent: "text-emerald-400",
    bgSolid: "bg-emerald-500",
    label: STANCE_LABELS.combate,
  },
  ajuda: {
    gradient: "from-teal-500 to-teal-300",
    badge: "bg-teal-600/20 text-teal-400",
    border: "border-teal-500/30",
    fadedBg: "bg-teal-950/30",
    hoverFadedBg: "hover:bg-teal-950/30",
    hoverSolidBg: "hover:bg-teal-500",
    hoverSolidBorder: "hover:border-teal-500",
    textAccent: "text-teal-400",
    bgSolid: "bg-teal-500",
    label: STANCE_LABELS.ajuda,
  },
  ambivalente: {
    gradient: "from-amber-500 to-amber-300",
    badge: "bg-amber-500/20 text-amber-400",
    border: "border-amber-500/30",
    fadedBg: "bg-amber-950/30",
    hoverFadedBg: "hover:bg-amber-950/30",
    hoverSolidBg: "hover:bg-amber-500",
    hoverSolidBorder: "hover:border-amber-500",
    textAccent: "text-amber-400",
    bgSolid: "bg-amber-500",
    label: STANCE_LABELS.ambivalente,
  },
  atrapalha: {
    gradient: "from-orange-500 to-orange-300",
    badge: "bg-orange-600/20 text-orange-400",
    border: "border-orange-500/30",
    fadedBg: "bg-orange-950/30",
    hoverFadedBg: "hover:bg-orange-950/30",
    hoverSolidBg: "hover:bg-orange-500",
    hoverSolidBorder: "hover:border-orange-500",
    textAccent: "text-orange-400",
    bgSolid: "bg-orange-500",
    label: STANCE_LABELS.atrapalha,
  },
  intensifica: {
    gradient: "from-red-500 to-red-300",
    badge: "bg-red-600/20 text-red-400",
    border: "border-red-500/30",
    fadedBg: "bg-red-950/30",
    hoverFadedBg: "hover:bg-red-950/30",
    hoverSolidBg: "hover:bg-red-500",
    hoverSolidBorder: "hover:border-red-500",
    textAccent: "text-red-400",
    bgSolid: "bg-red-500",
    label: STANCE_LABELS.intensifica,
  },
  sem_relacao: {
    gradient: "from-slate-500 to-slate-300",
    badge: "bg-slate-500/20 text-slate-400",
    border: "border-slate-500/30",
    fadedBg: "bg-slate-800/19",
    hoverFadedBg: "hover:bg-slate-950/30",
    hoverSolidBg: "hover:bg-slate-500",
    hoverSolidBorder: "hover:border-slate-500",
    textAccent: "text-slate-400",
    bgSolid: "bg-slate-500",
    label: STANCE_LABELS.sem_relacao,
  },
} as const;

export const STANCE_ORDER: Stance[] = [
  STANCE.combate,
  STANCE.ajuda,
  STANCE.ambivalente,
  STANCE.atrapalha,
  STANCE.intensifica,
  STANCE.sem_relacao,
];

export const STANCE_GROUPS_ORDER: StanceGroup[] = [
  "favoraveis",
  "ambivalentes",
  "desfavoraveis",
];

// --- Reviewer score bands (even 20-pt bands; the "sem relação" checkbox is separate) ---

export const REVIEW_BANDS = {
  combate: { min: 0, max: 19 },
  ajuda: { min: 20, max: 39 },
  ambivalente: { min: 40, max: 59 },
  atrapalha: { min: 60, max: 79 },
  intensifica: { min: 80, max: 100 },
} as const;

/**
 * Derive the fine stance (and its coarse roll-up) from a reviewer's 0–100
 * score and the "not related to climate" flag.
 *
 * The score is the single source of truth: this function never returns
 * `needs_review`, because a human review is always a verdict.
 */
export function deriveStance(
  score: number,
  notRelated = false,
): StanceInfo {
  if (notRelated) {
    return {
      stance: STANCE.sem_relacao,
      group: STANCE_GROUPS[STANCE.sem_relacao],
      label: STANCE_LABELS[STANCE.sem_relacao],
      phrase: "Não se relaciona com questões climáticas.",
    };
  }
  for (const stance of [
    STANCE.combate,
    STANCE.ajuda,
    STANCE.ambivalente,
    STANCE.atrapalha,
    STANCE.intensifica,
  ]) {
    const band = REVIEW_BANDS[stance];
    if (score >= band.min && score <= band.max) {
      return {
        stance,
        group: STANCE_GROUPS[stance],
        label: STANCE_LABELS[stance],
        phrase: STANCE_PHRASE[stance],
      };
    }
  }
  // Unreachable for 0–100 input; keeps the return type total.
  return {
    stance: STANCE.ambivalente,
    group: "ambivalentes",
    label: STANCE_LABELS[STANCE.ambivalente],
    phrase: STANCE_PHRASE[STANCE.ambivalente],
  };
}

/**
 * Descriptive phrase for a bill's stance, always shown on the detail page.
 *
 * The phrase reflects the score (the single source of truth): for any bill with
 * a score it is the fine-stance phrase matching the score's band (e.g. score 30
 * shows "Ajuda de alguma forma…", score 10 shows "Ativamente combate…"), even
 * when the coarse roll-up is `neutral` (a reviewed ambivalent bill). The
 * `notRelated` flag distinguishes "sem relação climática" from a balanced
 * stance. Unknown classifications (no verdict) have no phrase.
 */
export function getClassificationPhrase(
  classification: Classification,
  score: number | null | undefined,
  notRelated = false,
): string | null {
  if (score == null || classification === "unknown") return null;
  return deriveStance(Math.round(score * 100), notRelated).phrase;
}
