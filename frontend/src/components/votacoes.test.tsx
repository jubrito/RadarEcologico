import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Votacoes } from "./votacoes";

describe("Votacoes", () => {
  it("renders votations with description and per-party orientations", () => {
    render(
      <Votacoes
        votacoes={[
          {
            date: "2025-03-27",
            orgao: "Plenário",
            description: "Aprovação do Projeto",
            aprovado: true,
            orientacoes: [
              { partido: "PL", voto: "Sim" },
              { partido: "PSB", voto: "Não" },
            ],
          },
        ]}
      />,
    );

    expect(screen.getByText("Votações")).toBeInTheDocument();
    expect(screen.getByText("Aprovação do Projeto")).toBeInTheDocument();
    expect(screen.getByText("Aprovado")).toBeInTheDocument();
    expect(screen.getByText("PL")).toBeInTheDocument();
    expect(screen.getByText("Sim")).toBeInTheDocument();
    expect(screen.getByText("PSB")).toBeInTheDocument();
    expect(screen.getByText("Não")).toBeInTheDocument();
  });

  it("shows Rejeitado when not approved", () => {
    render(
      <Votacoes
        votacoes={[
          {
            date: "2025-03-27",
            description: "Rejeição do Projeto",
            aprovado: false,
            orientacoes: [],
          },
        ]}
      />,
    );

    expect(screen.getByText("Rejeitado")).toBeInTheDocument();
  });

  it("renders multiple votations newest first in the timeline", () => {
    render(
      <Votacoes
        votacoes={[
          {
            date: "2025-01-10",
            description: "Votação antiga",
            aprovado: false,
            orientacoes: [],
          },
          {
            date: "2025-03-27",
            description: "Votação recente",
            aprovado: true,
            orientacoes: [],
          },
        ]}
      />,
    );

    const items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("Votação recente");
    expect(items[1]).toHaveTextContent("Votação antiga");
    expect(screen.getByText("2 votações")).toBeInTheDocument();
  });

  it("renders a compact item without optional details", () => {
    render(
      <Votacoes
        votacoes={[{ date: "2025-03-27", aprovado: true, orientacoes: [] }]}
      />,
    );

    expect(screen.getByText("1 votação")).toBeInTheDocument();
    expect(screen.getByRole("article", { name: "Aprovado" })).toBeInTheDocument();
    expect(screen.queryByText("Orientação por partido")).not.toBeInTheDocument();
  });

  it("renders nothing when there are no votations", () => {
    const { container } = render(<Votacoes votacoes={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
