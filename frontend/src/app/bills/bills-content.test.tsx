import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BillsContent } from "./bills-content";
import { createBillsResponse, createStats } from "@/test-fixtures/bills";
import "@testing-library/jest-dom/vitest";

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
  mockGetStats.mockResolvedValue(createStats());
  mockGetBills.mockResolvedValue(createBillsResponse());
});

describe("BillsContent", () => {
  it("renders search input", () => {
    render(<BillsContent />);
    expect(
      screen.getByPlaceholderText("Buscar PL (título, ementa, tipo, autor...)"),
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

  it("renders party filter", async () => {
    render(<BillsContent />);
    await waitFor(() => {
      expect(screen.getByLabelText("Filtrar por partido")).toBeInTheDocument();
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
      expect(screen.getByText(/combate ao desmatamento/)).toBeInTheDocument();
    });
  });

  it("renders pagination when multiple pages", async () => {
    mockGetStats.mockResolvedValue(createStats({ total_bills: 50 }));
    mockGetBills.mockResolvedValue(
      createBillsResponse({ items: [], total: 50 }),
    );

    render(<BillsContent />);
    await waitFor(() => {
      expect(screen.getByText(/Página 1 de 3/)).toBeInTheDocument();
    });
  });

  it("shows empty state when no results", async () => {
    mockGetStats.mockResolvedValue(createStats({ total_bills: 0 }));
    mockGetBills.mockResolvedValue(
      createBillsResponse({ items: [], total: 0 }),
    );

    render(<BillsContent />);
    await waitFor(() => {
      expect(
        screen.getByText("Nenhum projeto encontrado."),
      ).toBeInTheDocument();
    });
  });

  it("shows an error banner when fetching bills fails", async () => {
    mockGetBills.mockRejectedValue(new Error("Network error"));

    render(<BillsContent />);
    await waitFor(() => {
      expect(
        screen.getByText(
          "Não foi possível carregar essa página devido a um erro no servidor. Tente novamente mais tarde.",
        ),
      ).toBeInTheDocument();
    });
    expect(screen.getByText("Network error")).toBeInTheDocument();
  });
});
