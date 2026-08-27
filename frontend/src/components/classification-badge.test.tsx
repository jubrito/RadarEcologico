import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ClassificationBadge } from "./classification-badge";

describe("ClassificationBadge", () => {
  it("renders favorable label", () => {
    render(<ClassificationBadge classification="favorable" />);
    expect(screen.getByText("Combate a crise climática")).toBeInTheDocument();
  });

  it("renders needs_review label", () => {
    render(<ClassificationBadge classification="needs_review" />);
    expect(screen.getByText("Requer revisão humana")).toBeInTheDocument();
  });

  it("renders unfavorable label", () => {
    render(<ClassificationBadge classification="unfavorable" />);
    expect(
      screen.getByText("Intensifica a crise climática"),
    ).toBeInTheDocument();
  });

  it("renders unknown label", () => {
    render(<ClassificationBadge classification="unknown" />);
    expect(screen.getByText("Não classificado")).toBeInTheDocument();
  });

  it("renders neutral label", () => {
    render(<ClassificationBadge classification="neutral" />);
    expect(screen.getByText("Neutro")).toBeInTheDocument();
  });

  it("shows superficial label for a weakly favorable bill", () => {
    render(<ClassificationBadge classification="favorable" score={0.25} />);
    expect(screen.getByText("Ajudando superficialmente")).toBeInTheDocument();
  });

  it("does not show superficial label for a strongly favorable bill", () => {
    render(<ClassificationBadge classification="favorable" score={0.05} />);
    expect(
      screen.queryByText("Ajudando superficialmente"),
    ).not.toBeInTheDocument();
  });

  it("shows score percentage when provided", () => {
    render(<ClassificationBadge classification="favorable" score={0.31} />);
    expect(screen.getByText(/31%/)).toBeInTheDocument();
    expect(screen.getByText(/Potencial risco/)).toBeInTheDocument();
  });

  it("does not show score text when null", () => {
    render(<ClassificationBadge classification="favorable" score={null} />);
    expect(screen.queryByText(/Potencial risco/)).not.toBeInTheDocument();
  });

  it("shows risk text with percentage", () => {
    render(<ClassificationBadge classification="favorable" score={0.75} />);
    expect(screen.getByText(/75%/)).toBeInTheDocument();
  });
});
