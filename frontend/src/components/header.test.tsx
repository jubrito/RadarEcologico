import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Header } from "./header";

describe("Header", () => {
  it("renders site title", () => {
    render(<Header />);
    expect(
      screen.getByText("Radar Legislativo Ecológico")
    ).toBeInTheDocument();
  });

  it("renders subtitle and description", () => {
    render(<Header />);
    expect(screen.getByText(/De que forma/)).toBeInTheDocument();
    expect(screen.getByText(/Monitoramento/)).toBeInTheDocument();
  });

  it("renders large heading by default", () => {
    render(<Header />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveClass("text-5xl");
  });

  it("renders small heading when size=sm", () => {
    render(<Header size="sm" />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveClass("text-3xl");
  });
});
