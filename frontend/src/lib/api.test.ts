import { describe, it, expect, vi, beforeEach } from "vitest";
import { getBills, getBill, getStats, classifyText, getTramitacoes, getVotacoes } from "./api";
import { createBillsResponse, createStats } from "@/test-fixtures/bills";

beforeEach(() => {
  vi.restoreAllMocks();
});

function mockFetch(status: number, data: unknown) {
  vi.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 404 ? "Not Found" : "OK",
    json: () => Promise.resolve(data),
  } as Response);
}

describe("getBills", () => {
  it("fetches bills without params", async () => {
    mockFetch(200, createBillsResponse({ items: [], total: 0 }));
    const result = await getBills();
    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
  });

  it("sends filter params", async () => {
    mockFetch(200, createBillsResponse());
    await getBills({ classification: "favorable", source: "camara", search: "desmatamento" });
    const url = vi.mocked(fetch).mock.calls[0][0] as string;
    expect(url).toContain("classification=favorable");
    expect(url).toContain("source=camara");
    expect(url).toContain("search=desmatamento");
  });

  it("normalizes unknown classifications", async () => {
    mockFetch(200, createBillsResponse({ items: [{ ...createBillsResponse().items[0], classification: "invalid" as never }] }));
    const result = await getBills();
    expect(result.items[0].classification).toBe("unknown");
  });

  it("preserves known classifications", async () => {
    mockFetch(200, createBillsResponse());
    const result = await getBills();
    expect(result.items[0].classification).toBe("favorable");
  });

  it("throws on API error", async () => {
    mockFetch(500, {});
    await expect(getBills()).rejects.toThrow("API error");
  });

  it("sends theme param", async () => {
    mockFetch(200, createBillsResponse());
    await getBills({ theme: "48,54" });
    const url = vi.mocked(fetch).mock.calls[0][0] as string;
    expect(url).toContain("theme=48%2C54");
  });
});

describe("getBill", () => {
  it("fetches single bill", async () => {
    mockFetch(200, { id: "abc", classification: "favorable" });
    const result = await getBill("abc");
    expect(result.id).toBe("abc");
  });

  it("normalizes unknown classification", async () => {
    mockFetch(200, { id: "abc", classification: "garbage" });
    const result = await getBill("abc");
    expect(result.classification).toBe("unknown");
  });

  it("handles null classification", async () => {
    mockFetch(200, { id: "abc", classification: null });
    const result = await getBill("abc");
    expect(result.classification).toBe("unknown");
  });

  it("throws on 404", async () => {
    mockFetch(404, {});
    await expect(getBill("missing")).rejects.toThrow("API error");
  });
});

describe("getStats", () => {
  it("fetches stats", async () => {
    mockFetch(200, createStats());
    const result = await getStats();
    expect(result.total_bills).toBe(10);
    expect(result.by_classification.favorable).toBe(5);
    expect(result.by_theme["48"]).toBe(3);
  });
});

describe("getTramitacoes", () => {
  it("fetches tramitação events", async () => {
    mockFetch(200, [{ date: "2026-02-02", description: "Apresentação", orgao: "MESA" }]);
    const result = await getTramitacoes("abc-123");
    expect(result).toHaveLength(1);
    expect(result[0].description).toBe("Apresentação");
  });

  it("throws on API error", async () => {
    mockFetch(500, {});
    await expect(getTramitacoes("abc-123")).rejects.toThrow("API error");
  });
});

describe("getVotacoes", () => {
  it("fetches votations with orientations", async () => {
    mockFetch(200, [
      { date: "2025-03-27", description: "Aprovação", aprovado: true, orientacoes: [{ partido: "PL", voto: "Sim" }] },
    ]);
    const result = await getVotacoes("abc-123");
    expect(result).toHaveLength(1);
    expect(result[0].aprovado).toBe(true);
    expect(result[0].orientacoes[0].partido).toBe("PL");
  });

  it("throws on API error", async () => {
    mockFetch(500, {});
    await expect(getVotacoes("abc-123")).rejects.toThrow("API error");
  });
});

describe("classifyText", () => {
  it("classifies text", async () => {
    mockFetch(200, {
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
    mockFetch(500, {});
    await expect(classifyText("test")).rejects.toThrow("Classify error");
  });

  it("sends POST with correct body", async () => {
    mockFetch(200, { final_score: 0.5, classification: "needs_review", confidence: "low", components: {}, evidence: [] });
    await classifyText("algum texto de ementa");
    const [, init] = vi.mocked(fetch).mock.calls[0];
    expect(init?.method).toBe("POST");
    const body = JSON.parse(init?.body as string);
    expect(body.text).toBe("algum texto de ementa");
  });
});
