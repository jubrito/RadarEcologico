import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BillDetail } from "./bill-detail";
import { createBill, FAVORABLE_BILL } from "@/test-fixtures/bills";

const { mockGetBill, mockGetTramitacoes, mockGetVotacoes } = vi.hoisted(() => ({
  mockGetBill: vi.fn(),
  mockGetTramitacoes: vi.fn(),
  mockGetVotacoes: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  getBill: mockGetBill,
  getTramitacoes: mockGetTramitacoes,
  getVotacoes: mockGetVotacoes,
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockGetTramitacoes.mockResolvedValue([]);
  mockGetVotacoes.mockResolvedValue([]);
});

describe("BillDetail", () => {
  it("renders bill data after load", async () => {
    mockGetBill.mockResolvedValue(FAVORABLE_BILL);
    render(<BillDetail id="abc-123" />);

    await waitFor(() => {
      expect(screen.getByText("PL 456/2026")).toBeInTheDocument();
    });
  });

  it("shows classification badge", async () => {
    mockGetBill.mockResolvedValue(FAVORABLE_BILL);
    render(<BillDetail id="abc-123" />);

    await waitFor(() => {
      expect(screen.getByText("Combate a crise climática")).toBeInTheDocument();
    });
  });

  it("shows score and risk description", async () => {
    mockGetBill.mockResolvedValue(FAVORABLE_BILL);
    render(<BillDetail id="abc-123" />);

    await waitFor(() => {
      expect(
        screen.getByText(/Baixo potencial de dano climático/),
      ).toBeInTheDocument();
    });
  });

  it("handles unfavorable bills", async () => {
    mockGetBill.mockResolvedValue(
      createBill({ classification: "unfavorable", final_score: 0.85 }),
    );
    render(<BillDetail id="abc-123" />);

    await waitFor(() => {
      expect(
        screen.getByText(/Alto potencial de dano climático/),
      ).toBeInTheDocument();
    });
  });

  it("shows error state", async () => {
    mockGetBill.mockRejectedValue(new Error("Network error"));
    render(<BillDetail id="abc-123" />);

    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeInTheDocument();
    });
  });

  it("shows source link", async () => {
    mockGetBill.mockResolvedValue(FAVORABLE_BILL);
    render(<BillDetail id="abc-123" />);

    await waitFor(() => {
      expect(screen.getByText(/Ver fonte original/)).toBeInTheDocument();
    });
  });

  it("shows author with party", async () => {
    mockGetBill.mockResolvedValue(FAVORABLE_BILL);
    render(<BillDetail id="abc-123" />);

    await waitFor(() => {
      expect(screen.getByText("Dep. João Silva")).toBeInTheDocument();
    });
  });

  it("shows the theme below the ementa", async () => {
    mockGetBill.mockResolvedValue(FAVORABLE_BILL);
    render(<BillDetail id="abc-123" />);

    await waitFor(() => {
      expect(
        screen.getByText("Meio Ambiente e Desenvolvimento Sustentável"),
      ).toBeInTheDocument();
    });
  });
});
