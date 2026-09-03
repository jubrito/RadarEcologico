import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { RiskAnalysis } from "./risk-analysis";
import { createBill } from "@/test-fixtures/bills";

describe("RiskAnalysis", () => {
  it("renders the score, progress scale, and classification description", () => {
    render(
      <RiskAnalysis
        bill={createBill({ final_score: 0.45 })}
        classification="needs_review"
      />,
    );

    expect(screen.getByText("45%")).toBeInTheDocument();
    expect(screen.getByText("Combate a crise climática")).toBeInTheDocument();
    expect(screen.getByText("Nem combate nem intensifica")).toBeInTheDocument();
    expect(
      screen.getByText(/Impacto climático incerto/),
    ).toBeInTheDocument();
  });

  it("uses the reviewed score in preference to the automated score", () => {
    render(
      <RiskAnalysis
        bill={createBill({
          final_score: 0.1,
          reviewed: true,
          reviewed_score: 75,
        })}
        classification="unfavorable"
      />,
    );

    expect(screen.getByText("75%")).toBeInTheDocument();
    expect(screen.queryByText("10%")).not.toBeInTheDocument();
    expect(screen.getByText(/Alto potencial de dano climático/)).toBeInTheDocument();
  });

  it("does not render score-specific content without a score", () => {
    render(
      <RiskAnalysis
        bill={createBill({ final_score: null })}
        classification="unknown"
      />,
    );

    expect(screen.queryByText(/Potencial risco/)).not.toBeInTheDocument();
    expect(
      screen.queryByText("Análise de risco e impacto ecológico da proposta"),
    ).not.toBeInTheDocument();
  });
});
