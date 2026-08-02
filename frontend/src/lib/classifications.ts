export const CLASSIFICATION = {
  favorable: "favorable",
  needs_review: "needs_review",
  unfavorable: "unfavorable",
  unknown: "unknown",
} as const;

export const CLASSIFICATIONS_MAP = {
  favorable: {
    name: CLASSIFICATION.favorable,
    label: "Favorable",
    description:
      "Esse projeto de lei potencialmente apoia a luta contra a catástrofe climática.",
  },
  needs_review: {
    name: CLASSIFICATION.needs_review,
    label: "Needs Review",
    description:
      "Esse projeto de lei precisa de uma análise mais detalhada para determinar seu impacto sobre o meio ambiente.",
  },
  unfavorable: {
    name: CLASSIFICATION.unfavorable,
    label: "Unfavorable",
    description:
      "Esse projeto de lei potensiamente intensifica a catástrofe climática.",
  },
  unknown: {
    name: CLASSIFICATION.unknown,
    label: "Unknown",
    description:
      "A classificação desse projeto de lei ainda não foi determinada.",
  },
} as const;
