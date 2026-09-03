import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { BillEmenta } from "./bill-ementa";
import { createBill, FAVORABLE_BILL } from "@/test-fixtures/bills";

describe("BillEmenta", () => {
  it("renders the ementa, classification, and themes", () => {
    render(<BillEmenta bill={FAVORABLE_BILL} classification="favorable" />);

    expect(screen.getByRole("heading", { name: "Ementa" })).toBeInTheDocument();
    expect(screen.getByText(FAVORABLE_BILL.ementa)).toBeInTheDocument();
    expect(screen.getByText("Combate a crise climática")).toBeInTheDocument();
    expect(
      screen.getByText("Meio Ambiente e Desenvolvimento Sustentável"),
    ).toBeInTheDocument();
  });

  it("does not render a theme area when the bill has no known themes", () => {
    render(
      <BillEmenta
        bill={createBill({ theme_ids: null })}
        classification="neutral"
      />,
    );

    expect(screen.queryByText("Meio Ambiente e Desenvolvimento Sustentável")).not.toBeInTheDocument();
  });
});
