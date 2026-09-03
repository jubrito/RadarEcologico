import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { BillHeader } from "./bill-header";
import { FAVORABLE_BILL } from "@/test-fixtures/bills";

describe("BillHeader", () => {
  it("renders the bill identifier and source link", () => {
    render(<BillHeader bill={FAVORABLE_BILL} />);

    expect(screen.getByRole("heading", { name: "PL 456/2026" })).toBeInTheDocument();
    expect(screen.getByText(/Ver fonte original/).closest("a")).toHaveAttribute(
      "href",
      FAVORABLE_BILL.link,
    );
  });

  it("opens the source link in a new tab safely", () => {
    render(<BillHeader bill={FAVORABLE_BILL} />);

    const sourceLink = screen.getByText(/Ver fonte original/).closest("a");
    expect(sourceLink).toHaveAttribute("target", "_blank");
    expect(sourceLink).toHaveAttribute("rel", "noopener noreferrer");
  });
});
