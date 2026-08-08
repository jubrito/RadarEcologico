import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BillCard } from "./bill-card";
import { createBill, FAVORABLE_BILL, UNFAVORABLE_BILL, UNKNOWN_BILL } from "@/test-fixtures/bills";

describe("BillCard", () => {
  it("renders bill type, number and year", () => {
    render(<BillCard bill={FAVORABLE_BILL} />);
    expect(screen.getByText("PL 456/2026")).toBeInTheDocument();
  });

  it("renders ementa text", () => {
    render(<BillCard bill={FAVORABLE_BILL} />);
    expect(screen.getByText(/combate ao desmatamento/)).toBeInTheDocument();
  });

  it("renders classification label", () => {
    render(<BillCard bill={FAVORABLE_BILL} />);
    expect(screen.getByText("Combate a crise climática")).toBeInTheDocument();
  });

  it("renders unknown label for unknown classification", () => {
    render(<BillCard bill={UNKNOWN_BILL} />);
    expect(screen.getByText("Não classificado")).toBeInTheDocument();
  });

  it("renders unfavorable label", () => {
    render(<BillCard bill={UNFAVORABLE_BILL} />);
    expect(screen.getByText("Intensifica a crise climática")).toBeInTheDocument();
  });

  it("renders source name", () => {
    render(<BillCard bill={FAVORABLE_BILL} />);
    expect(screen.getByText("Câmara dos Deputados")).toBeInTheDocument();
  });

  it("renders author when present", () => {
    render(<BillCard bill={FAVORABLE_BILL} />);
    expect(screen.getByText("Dep. João Silva")).toBeInTheDocument();
  });

  it("does not render author when absent", () => {
    render(<BillCard bill={createBill({ author: null })} />);
    expect(screen.queryByText("Dep. João Silva")).not.toBeInTheDocument();
  });

  it("renders as a link", () => {
    render(<BillCard bill={FAVORABLE_BILL} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/bills/abc-123");
  });
});
