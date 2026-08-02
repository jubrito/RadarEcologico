import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BillCard } from "./bill-card";

const baseBill = {
  id: "abc-123",
  external_id: "12345",
  source: "camara",
  bill_type: "PL",
  number: 456,
  year: 2026,
  ementa: "Institui política nacional de combate ao desmatamento.",
  link: "https://www.camara.leg.br/proposicoes/12345",
  classification: "favorable" as const,
  final_score: 0.12,
  keyword_score: 0.12,
  author: "Dep. João Silva",
  presentation_date: "2026-01-15T00:00:00",
};

describe("BillCard", () => {
  it("renders bill type, number and year", () => {
    render(<BillCard bill={baseBill} />);
    expect(screen.getByText("PL 456/2026")).toBeInTheDocument();
  });

  it("renders ementa text", () => {
    render(<BillCard bill={baseBill} />);
    expect(screen.getByText(/combate ao desmatamento/)).toBeInTheDocument();
  });

  it("renders classification label", () => {
    render(<BillCard bill={baseBill} />);
    expect(screen.getByText("Combate à crise climática")).toBeInTheDocument();
  });

  it("renders unknown label for unknown classification", () => {
    const bill = { ...baseBill, classification: "unknown" as const };
    render(<BillCard bill={bill} />);
    expect(screen.getByText("Não classificado")).toBeInTheDocument();
  });

  it("renders unfavorable label", () => {
    const bill = { ...baseBill, classification: "unfavorable" as const };
    render(<BillCard bill={bill} />);
    expect(screen.getByText("Intensifica a crise climática")).toBeInTheDocument();
  });

  it("renders source name", () => {
    render(<BillCard bill={baseBill} />);
    expect(screen.getByText("Câmara dos Deputados")).toBeInTheDocument();
  });

  it("renders author when present", () => {
    render(<BillCard bill={baseBill} />);
    expect(screen.getByText("Dep. João Silva")).toBeInTheDocument();
  });

  it("does not render author when absent", () => {
    const bill = { ...baseBill, author: null };
    render(<BillCard bill={bill} />);
    expect(screen.queryByText("Dep. João Silva")).not.toBeInTheDocument();
  });

  it("renders as a link", () => {
    render(<BillCard bill={baseBill} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/bills/abc-123");
  });
});
