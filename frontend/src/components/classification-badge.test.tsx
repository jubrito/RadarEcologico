import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ClassificationBadge } from "./classification-badge";

describe("ClassificationBadge", () => {
  it("renders favorable label", () => {
    render(<ClassificationBadge classification="favorable" />);
    expect(screen.getByText("Combate à crise climática")).toBeInTheDocument();
  });

  it("renders needs_review label", () => {
    render(<ClassificationBadge classification="needs_review" />);
    expect(screen.getByText("Requer revisão humana")).toBeInTheDocument();
  });

  it("renders unfavorable label", () => {
    render(<ClassificationBadge classification="unfavorable" />);
    expect(screen.getByText("Intensifica a crise climática")).toBeInTheDocument();
  });

  it("renders unknown label", () => {
    render(<ClassificationBadge classification="unknown" />);
    expect(screen.getByText("Não classificado")).toBeInTheDocument();
  });

  it("shows score percentage when provided", () => {
    render(<ClassificationBadge classification="favorable" score={0.31} />);
    expect(screen.getByText("31%")).toBeInTheDocument();
  });

  it("does not show score when null", () => {
    render(<ClassificationBadge classification="favorable" score={null} />);
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });

  it("has accessible score label", () => {
    render(<ClassificationBadge classification="favorable" score={0.75} />);
    expect(
      screen.getByLabelText("Score de risco climático: 75%")
    ).toBeInTheDocument();
  });
});
