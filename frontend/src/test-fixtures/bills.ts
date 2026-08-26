import type { Bill, BillsResponse, StatsResponse } from "@/lib/api";

export function createBill(overrides: Partial<Bill> = {}): Bill {
  return {
    id: "abc-123",
    external_id: "12345",
    source: "camara",
    bill_type: "PL",
    number: 456,
    year: 2026,
    ementa: "Institui política de combate ao desmatamento na Amazônia.",
    author: "Dep. João Silva",
    author_party: "PT",
    author_state: "SP",
    presentation_date: "2026-01-15T00:00:00",
    status: "Tramitando",
    link: "https://www.camara.leg.br/proposicoes/12345",
    keyword_score: 0.12,
    bert_score: null,
    final_score: 0.12,
    classification: "favorable",
    theme_ids: "48",
    theme_names: "Meio Ambiente e Desenvolvimento Sustentável",
    classified_at: "2026-08-02T00:00:00",
    created_at: "2026-08-01T00:00:00",
    ...overrides,
  };
}

export function createBillsResponse(
  overrides: Partial<BillsResponse> = {},
): BillsResponse {
  return {
    items: [createBill()],
    total: 1,
    page: 1,
    limit: 20,
    ...overrides,
  };
}

export function createStats(overrides: Partial<StatsResponse> = {}): StatsResponse {
  return {
    total_bills: 10,
    by_classification: { favorable: 5, needs_review: 3, unfavorable: 2 },
    by_source: { camara: 7, senado: 3 },
    by_year: { "2026": 10 },
    by_theme: { "48": 3, "54": 2 },
    by_party: { PT: 3, PL: 2 },
    ...overrides,
  };
}

export const FAVORABLE_BILL = createBill();
export const NEEDS_REVIEW_BILL = createBill({
  classification: "needs_review",
  final_score: 0.45,
  keyword_score: 0.45,
});
export const UNFAVORABLE_BILL = createBill({
  classification: "unfavorable",
  final_score: 0.85,
  keyword_score: 0.85,
});
export const UNKNOWN_BILL = createBill({ classification: "unknown" });
