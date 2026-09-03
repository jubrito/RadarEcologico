import type { CLASSIFICATION } from "./utils/classifications";

export type Classification =
  (typeof CLASSIFICATION)[keyof typeof CLASSIFICATION];

export type KnownClassification = Exclude<
  Classification,
  typeof CLASSIFICATION.unknown
>;

export type ClassificationStyle = {
  gradient: string;
  badge: string;
  border: string;
  fadedBg: string;
  hoverFadedBg: string;
  hoverSolidBg: string;
  hoverSolidBorder: string;
  textAccent: string;
  bgSolid: string;
  label: string;
};

export type SelectOption = {
  value: string;
  label: string;
};

export type BillQueryParams = {
  page?: number;
  limit?: number;
  classification?: Classification;
  source?: string;
  year?: number;
  search?: string;
  theme?: string;
  party?: string;
};

export type ClassifyComponents = {
  keyword_score: number;
  bert_score?: number;
};

export const CLASSIFICATION_THRESHOLDS = {
  FAVORABLE_MAX: 0.35,
  UNFAVORABLE_MIN: 0.65,
} as const;

/**
 * Fine-grained stances derived from a reviewer's 0–100 score.
 * The AI/machine stays coarse (favorable/needs_review/unfavorable); these fine
 * stances only exist for human-reviewed bills.
 */
export const STANCE = {
  combate: "combate",
  ajuda: "ajuda",
  ambivalente: "ambivalente",
  atrapalha: "atrapalha",
  intensifica: "intensifica",
  sem_relacao: "sem_relacao",
} as const;

export type Stance = (typeof STANCE)[keyof typeof STANCE];

export type StanceGroup = "favoraveis" | "ambivalentes" | "desfavoraveis";

export type StanceInfo = {
  stance: Stance;
  group: StanceGroup;
  label: string;
  phrase: string | null;
};

export const SOURCE_LABELS: Record<
  "camara" | "senado" | "alesp" | "camara-sp",
  string
> = {
  camara: "Câmara dos Deputados",
  senado: "Senado Federal",
  alesp: "ALESP",
  "camara-sp": "Câmara Municipal de SP",
} as const;
