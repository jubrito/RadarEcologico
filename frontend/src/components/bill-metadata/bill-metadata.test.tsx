import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BillMetadata } from "./bill-metadata";
import { createBill, FAVORABLE_BILL } from "@/test-fixtures/bills";

describe("BillMetadata", () => {
  it("renders author", () => {
    render(<BillMetadata bill={FAVORABLE_BILL} />);
    expect(screen.getByText("Dep. João Silva")).toBeInTheDocument();
  });

  it("renders party with state", () => {
    render(<BillMetadata bill={FAVORABLE_BILL} />);
    expect(screen.getByText(/PT/)).toBeInTheDocument();
  });

  it("renders presentation date", () => {
    render(<BillMetadata bill={FAVORABLE_BILL} />);
    expect(screen.getByText("15/01/2026")).toBeInTheDocument();
  });

  it("renders source", () => {
    render(<BillMetadata bill={FAVORABLE_BILL} />);
    expect(screen.getByText("Câmara dos Deputados")).toBeInTheDocument();
  });

  it("renders status row when provided", () => {
    render(
      <BillMetadata
        bill={FAVORABLE_BILL}
        statusRow={<div>Em tramitação</div>}
      />,
    );
    expect(screen.getByText("Em tramitação")).toBeInTheDocument();
  });

  it("renders without status row", () => {
    render(<BillMetadata bill={FAVORABLE_BILL} />);
    expect(screen.queryByText("Status")).not.toBeInTheDocument();
  });

  it("hides author section when no author", () => {
    const bill = createBill({ author: null });
    render(<BillMetadata bill={bill} />);
    expect(screen.queryByText("Autor")).not.toBeInTheDocument();
  });

  it("hides date when no presentation_date", () => {
    const bill = createBill({ presentation_date: null });
    render(<BillMetadata bill={bill} />);
    expect(screen.queryByText("Data de apresentação")).not.toBeInTheDocument();
  });

  it("renders metadata grid with pairs", () => {
    render(<BillMetadata bill={FAVORABLE_BILL} />);
    expect(screen.getByText("Autor")).toBeInTheDocument();
    expect(screen.getByText("Partido")).toBeInTheDocument();
    expect(screen.getByText("Fonte do projeto")).toBeInTheDocument();
  });
});
