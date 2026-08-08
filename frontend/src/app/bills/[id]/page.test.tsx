import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import { Suspense } from "react";
import BillDetailPage from "./page";

const { mockGetBill } = vi.hoisted(() => ({
  mockGetBill: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  getBill: mockGetBill,
}));

const mockBill = {
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
  final_score: 0.12,
  classification: "favorable" as const,
  classified_at: "2026-08-02T00:00:00",
  created_at: "2026-08-01T00:00:00",
};

beforeEach(() => {
  vi.clearAllMocks();
});

function renderBill(id: string) {
  return act(async () => {
    render(
      <Suspense fallback={<div>Loading</div>}>
        <BillDetailPage params={Promise.resolve({ id })} />
      </Suspense>,
    );
  });
}

describe("BillDetailPage", () => {
  it("renders bill data after load", async () => {
    mockGetBill.mockResolvedValue(mockBill);
    await renderBill("abc-123");

    await waitFor(() => {
      expect(screen.getByText("PL 456/2026")).toBeInTheDocument();
    });
  });

  it("shows classification badge", async () => {
    mockGetBill.mockResolvedValue(mockBill);
    await renderBill("abc-123");

    await waitFor(() => {
      expect(screen.getByText("Combate a crise climática")).toBeInTheDocument();
    });
  });

  it("shows score and risk description", async () => {
    mockGetBill.mockResolvedValue(mockBill);
    await renderBill("abc-123");

    await waitFor(() => {
      expect(screen.getByText(/Baixo potencial de dano climático/)).toBeInTheDocument();
    });
  });

  it("handles unfavorable bills", async () => {
    mockGetBill.mockResolvedValue({
      ...mockBill,
      classification: "unfavorable",
      final_score: 0.85,
    });
    await renderBill("abc-123");

    await waitFor(() => {
      expect(screen.getByText(/Alto potencial de dano climático/)).toBeInTheDocument();
    });
  });

  it("shows error state", async () => {
    mockGetBill.mockRejectedValue(new Error("Network error"));
    await renderBill("abc-123");

    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeInTheDocument();
    });
  });

  it("shows source link", async () => {
    mockGetBill.mockResolvedValue(mockBill);
    await renderBill("abc-123");

    await waitFor(() => {
      expect(screen.getByText(/Ver fonte original/)).toBeInTheDocument();
    });
  });

  it("shows author with party", async () => {
    mockGetBill.mockResolvedValue(mockBill);
    await renderBill("abc-123");

    await waitFor(() => {
      expect(screen.getByText("Dep. João Silva")).toBeInTheDocument();
    });
  });
});
