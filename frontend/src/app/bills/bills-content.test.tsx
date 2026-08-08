import "@testing-library/jest-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BillsContent } from "./bills-content";

const { mockGetBills, mockGetStats } = vi.hoisted(() => ({
  mockGetBills: vi.fn(),
  mockGetStats: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  getBills: mockGetBills,
  getStats: mockGetStats,
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockGetStats.mockResolvedValue({
    total_bills: 10,
    by_classification: { favorable: 5, needs_review: 3, unfavorable: 2 },
    by_source: { camara: 7, senado: 3 },
    by_year: { "2026": 10 },
    by_theme: { "48": 3, "54": 2 },
  });
  mockGetBills.mockResolvedValue({
    items: [
      {
        id: "1",
        external_id: "100",
        source: "camara",
        bill_type: "PL",
        number: 100,
        year: 2026,
        ementa: "Combate ao desmatamento.",
        link: "https://camara.leg.br/100",
        classification: "favorable",
        final_score: 0.12,
        keyword_score: 0.12,
        author: "Dep. Maria",
        author_party: "PT",
        author_state: "SP",
        presentation_date: "2026-01-15T00:00:00",
      },
    ],
    total: 1,
    page: 1,
    limit: 20,
  });
});

describe("BillsContent", () => {
  it("renders search input", () => {
    render(<BillsContent />);
    expect(
      screen.getByPlaceholderText("Buscar por ementa..."),
    ).toBeInTheDocument();
  });

  it("renders classification filter", async () => {
    render(<BillsContent />);
    await waitFor(() => {
      expect(
        screen.getByLabelText("Filtrar por classificação"),
      ).toBeInTheDocument();
    });
  });

  it("renders source filter", async () => {
    render(<BillsContent />);
    await waitFor(() => {
      expect(screen.getByLabelText("Filtrar por fonte")).toBeInTheDocument();
    });
  });

  it("renders multiselect theme filter", async () => {
    render(<BillsContent />);
    await waitFor(() => {
      expect(
        screen.getByRole("combobox", { name: "Filtrar por tema" }),
      ).toBeInTheDocument();
    });
  });

  it("renders bill cards after load", async () => {
    render(<BillsContent />);
    await waitFor(() => {
      expect(screen.getByText("Combate ao desmatamento.")).toBeInTheDocument();
    });
  });

  it("renders pagination when multiple pages", async () => {
    mockGetStats.mockResolvedValue({
      total_bills: 50,
      by_classification: {},
      by_source: {},
      by_year: {},
      by_theme: {},
    });
    mockGetBills.mockResolvedValue({
      items: [],
      total: 50,
      page: 1,
      limit: 20,
    });

    render(<BillsContent />);
    await waitFor(() => {
      expect(screen.getByText(/Página 1 de 3/)).toBeInTheDocument();
      expect(screen.getByText("Próxima")).toBeInTheDocument();
    });
  });

  it("shows empty state when no results", async () => {
    mockGetStats.mockResolvedValue({
      total_bills: 0,
      by_classification: {},
      by_source: {},
      by_year: {},
      by_theme: {},
    });
    mockGetBills.mockResolvedValue({ items: [], total: 0, page: 1, limit: 20 });

    render(<BillsContent />);
    await waitFor(() => {
      expect(
        screen.getByText("Nenhum projeto encontrado."),
      ).toBeInTheDocument();
    });
  });
});
