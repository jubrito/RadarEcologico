import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatCard } from "./stat-card";

describe("StatCard", () => {
  const baseProps = {
    prefix: "PLs responsáveis por ",
    tema: "combater a crise",
    value: 12,
    desc: "Ex: preservação ambiental.",
    variant: "favorable" as const,
  };

  it("renders value", () => {
    render(<StatCard {...baseProps} />);
    expect(screen.getByText("12")).toBeInTheDocument();
  });

  it("renders prefix and tema", () => {
    render(<StatCard {...baseProps} />);
    expect(screen.getByText(/PLs responsáveis por/)).toBeInTheDocument();
    expect(screen.getByText("combater a crise")).toBeInTheDocument();
  });

  it("renders description", () => {
    render(<StatCard {...baseProps} />);
    expect(
      screen.getByText("Ex: preservação ambiental.")
    ).toBeInTheDocument();
  });

  it("renders unfavorable variant", () => {
    render(<StatCard {...baseProps} variant="unfavorable" />);
    expect(screen.getByText("12")).toBeInTheDocument();
  });

  it("renders needs_review variant", () => {
    render(<StatCard {...baseProps} variant="needs_review" />);
    expect(screen.getByText("12")).toBeInTheDocument();
  });
});
