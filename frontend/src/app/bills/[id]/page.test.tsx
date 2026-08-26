import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import { Suspense } from "react";
import BillDetailPage from "./page";
import { createBill, FAVORABLE_BILL } from "@/test-fixtures/bills";

const { mockGetBill } = vi.hoisted(() => ({
  mockGetBill: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  getBill: mockGetBill,
}));

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
    mockGetBill.mockResolvedValue(FAVORABLE_BILL);
    await renderBill("abc-123");

    await waitFor(() => {
      expect(screen.getByText("PL 456/2026")).toBeInTheDocument();
    });
  });

  it("shows classification badge", async () => {
    mockGetBill.mockResolvedValue(FAVORABLE_BILL);
    await renderBill("abc-123");

    await waitFor(() => {
      expect(screen.getByText("Combate a crise climática")).toBeInTheDocument();
    });
  });

  it("shows score and risk description", async () => {
    mockGetBill.mockResolvedValue(FAVORABLE_BILL);
    await renderBill("abc-123");

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
    await renderBill("abc-123");

    await waitFor(() => {
      expect(
        screen.getByText(/Alto potencial de dano climático/),
      ).toBeInTheDocument();
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
    mockGetBill.mockResolvedValue(FAVORABLE_BILL);
    await renderBill("abc-123");

    await waitFor(() => {
      expect(screen.getByText(/Ver fonte original/)).toBeInTheDocument();
    });
  });

  it("shows author with party", async () => {
    mockGetBill.mockResolvedValue(FAVORABLE_BILL);
    await renderBill("abc-123");

    await waitFor(() => {
      expect(screen.getByText("Dep. João Silva")).toBeInTheDocument();
    });
  });

  it("shows the theme below the ementa", async () => {
    mockGetBill.mockResolvedValue(FAVORABLE_BILL);
    await renderBill("abc-123");

    await waitFor(() => {
      expect(
        screen.getByText("Meio Ambiente e Desenvolvimento Sustentável"),
      ).toBeInTheDocument();
    });
  });
});
