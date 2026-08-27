import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import TemasPage from "./page";
import { CAMARA_TEMA_REFERENCE_URL, SENADO_CLASSES_URL } from "@/lib/themes";

describe("TemasPage", () => {
  it("renders the heading and source taxonomy links", () => {
    render(<TemasPage />);

    expect(screen.getByText("Temas climáticos")).toBeInTheDocument();
    expect(
      screen.getByText(/Classificação temática do Senado/),
    ).toBeInTheDocument();

    const hrefs = screen.getAllByRole("link").map((el) => el.getAttribute("href"));
    expect(hrefs).toContain(CAMARA_TEMA_REFERENCE_URL);
    expect(hrefs).toContain(SENADO_CLASSES_URL);
  });

  it("renders every theme with its description", () => {
    render(<TemasPage />);

    expect(screen.getByText("Economia")).toBeInTheDocument();
    expect(
      screen.getByText("Meio Ambiente e Desenvolvimento Sustentável"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Povos Indígenas e Comunidades Tradicionais"),
    ).toBeInTheDocument();
    expect(screen.getByText(/precificação de carbono/)).toBeInTheDocument();
  });

  it("links each theme to the bills filter", () => {
    render(<TemasPage />);

    const economia = screen.getByText("Economia");
    expect(economia.closest("a")).toHaveAttribute("href", "/bills?theme=40");

    const indigenas = screen.getByText("Povos Indígenas e Comunidades Tradicionais");
    expect(indigenas.closest("a")).toHaveAttribute(
      "href",
      "/bills?theme=povos_indigenas",
    );
  });
});
