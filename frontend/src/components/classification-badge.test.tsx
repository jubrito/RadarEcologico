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
