import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import TemasPage from "./page";

vi.mock("@/lib/api", () => ({
  getStats: vi.fn().mockResolvedValue({
    by_theme: { "40": 7, "48": 1, povos_indigenas: 0 },
  }),
}));

describe("TemasPage", () => {
  it("renders every theme with its description", async () => {
    render(<TemasPage />);

    expect(screen.getByText("Economia")).toBeInTheDocument();
    expect(
      screen.getByText("Meio Ambiente e Desenvolvimento Sustentável"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Povos Indígenas e Comunidades Tradicionais"),
    ).toBeInTheDocument();
    expect(screen.getByText(/precificação de carbono/)).toBeInTheDocument();
    expect(await screen.findByText("7 projetos")).toBeInTheDocument();
  });

  it("links each theme to the bills filter", async () => {
    render(<TemasPage />);

    const economia = screen.getByText("Economia");
    expect(economia.closest("a")).toHaveAttribute("href", "/bills?theme=40");
    expect(await screen.findByText("7 projetos")).toBeInTheDocument();

    const indigenas = screen.getByText(
      "Povos Indígenas e Comunidades Tradicionais",
    );
    expect(indigenas.closest("a")).toHaveAttribute(
      "href",
      "/bills?theme=povos_indigenas",
    );
  });

  it("shows the bill count for each theme", async () => {
    render(<TemasPage />);

    expect(await screen.findByText("7 projetos")).toBeInTheDocument();
    expect(await screen.findByText("1 projeto")).toBeInTheDocument();
    expect(screen.getAllByText("0 projetos").length).toBeGreaterThan(0);
  });
});
