import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getBills,
  getBill,
  getStats,
  classifyText,
  getTramitacoes,
  getVotacoes,
  filterBills,
  resetStaticDataCache,
  type Bill,
} from "./api";
import { createBill, createStats } from "@/test-fixtures/bills";

beforeEach(() => {
  vi.restoreAllMocks();
  resetStaticDataCache();
});

function mockFetch(data: unknown, status = 200) {
  vi.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 404 ? "Not Found" : "OK",
    json: () => Promise.resolve(data),
  } as Response);
}

function bill(overrides: Partial<Bill> = {}): Bill {
  return createBill(overrides);
}

describe("filterBills", () => {
  const bills = [
    bill({ id: "1", classification: "favorable", source: "camara", author_party: "PT", theme_ids: "48", ementa: "Combate ao desmatamento", presentation_date: "2026-01-15T00:00:00" }),
    bill({ id: "2", classification: "unfavorable", source: "senado", author_party: "PL", theme_ids: "54", ementa: "Flexibiliza licenciamento", presentation_date: "2026-02-10T00:00:00" }),
    bill({ id: "3", classification: "favorable", source: "camara", author_party: "PT", theme_ids: "48,54", ementa: "Energia renovável", presentation_date: null }),
  ];

  it("filters by classification", () => {
    const result = filterBills(bills, { classification: "favorable" });
    expect(result.map((b) => b.id)).toEqual(["1", "3"]);
  });

  it("filters by source", () => {
    const result = filterBills(bills, { source: "senado" });
    expect(result.map((b) => b.id)).toEqual(["2"]);
  });

  it("filters by party", () => {
    const result = filterBills(bills, { party: "PL" });
    expect(result.map((b) => b.id)).toEqual(["2"]);
  });

  it("filters by search across ementa", () => {
    const result = filterBills(bills, { search: "desmatamento" });
    expect(result.map((b) => b.id)).toEqual(["1"]);
  });

  it("filters by theme (OR of comma-separated codes)", () => {
    const result = filterBills(bills, { theme: "54" });
    expect(result.map((b) => b.id)).toEqual(["2", "3"]);
  });

  it("sorts newest first with null dates last", () => {
    const result = filterBills(bills, {});
    expect(result.map((b) => b.id)).toEqual(["2", "1", "3"]);
  });
});

describe("getBills", () => {
  it("fetches bills.json and returns the first page", async () => {
    mockFetch([bill({ id: "1" }), bill({ id: "2" })]);
    const result = await getBills({ page: 1, limit: 1 });
    expect(result.items.map((b) => b.id)).toEqual(["1"]);
    expect(result.total).toBe(2);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(1);
  });

  it("applies client-side filters", async () => {
    mockFetch([
      bill({ id: "1", classification: "favorable" }),
      bill({ id: "2", classification: "unfavorable" }),
    ]);
    const result = await getBills({ classification: "favorable" });
    expect(result.items.map((b) => b.id)).toEqual(["1"]);
    expect(result.total).toBe(1);
  });

  it("normalizes unknown classifications", async () => {
    mockFetch([bill({ id: "1", classification: "invalid" as never })]);
    const result = await getBills();
    expect(result.items[0].classification).toBe("unknown");
  });

  it("returns empty results when data is missing", async () => {
    mockFetch([]);
    const result = await getBills();
    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
  });
});

describe("getBill", () => {
  it("finds a bill by id", async () => {
    mockFetch([bill({ id: "abc" })]);
    const result = await getBill("abc");
    expect(result.id).toBe("abc");
  });

  it("throws when the bill is missing", async () => {
    mockFetch([bill({ id: "abc" })]);
    await expect(getBill("missing")).rejects.toThrow("API error");
  });
});

describe("getStats", () => {
  it("fetches stats.json", async () => {
    mockFetch(createStats());
    const result = await getStats();
    expect(result.total_bills).toBe(10);
    expect(result.by_classification.favorable).toBe(5);
    expect(result.by_theme["48"]).toBe(3);
  });
});

describe("getTramitacoes", () => {
  it("returns events for a bill", async () => {
    mockFetch({
      "abc-123": [{ date: "2026-02-02", description: "Apresentação", orgao: "MESA" }],
    });
    const result = await getTramitacoes("abc-123");
    expect(result).toHaveLength(1);
    expect(result[0].description).toBe("Apresentação");
  });

  it("returns an empty list for an unknown bill", async () => {
    mockFetch({});
    const result = await getTramitacoes("missing");
    expect(result).toEqual([]);
  });
});

describe("getVotacoes", () => {
  it("returns votations with orientations", async () => {
    mockFetch({
      "abc-123": [
        { date: "2025-03-27", description: "Aprovação", aprovado: true, orientacoes: [{ partido: "PL", voto: "Sim" }] },
      ],
    });
    const result = await getVotacoes("abc-123");
    expect(result).toHaveLength(1);
    expect(result[0].aprovado).toBe(true);
    expect(result[0].orientacoes[0].partido).toBe("PL");
  });

  it("returns an empty list for an unknown bill", async () => {
    mockFetch({});
    const result = await getVotacoes("missing");
    expect(result).toEqual([]);
  });
});

describe("classifyText", () => {
  it("classifies text", async () => {
    mockFetch({
      final_score: 0.15,
      classification: "favorable",
      confidence: "high",
      components: { keyword_score: 0.15 },
      evidence: ["combate ao desmatamento"],
    });
    const result = await classifyText("combate ao desmatamento");
    expect(result.classification).toBe("favorable");
    expect(result.components.keyword_score).toBe(0.15);
  });

  it("throws on classify error", async () => {
    mockFetch({}, 500);
    await expect(classifyText("test")).rejects.toThrow("Classify error");
  });

  it("sends POST with correct body", async () => {
    mockFetch({ final_score: 0.5, classification: "needs_review", confidence: "low", components: {}, evidence: [] });
    await classifyText("algum texto de ementa");
    const [, init] = vi.mocked(fetch).mock.calls[0];
    expect(init?.method).toBe("POST");
    const body = JSON.parse(init?.body as string);
    expect(body.text).toBe("algum texto de ementa");
  });
});
