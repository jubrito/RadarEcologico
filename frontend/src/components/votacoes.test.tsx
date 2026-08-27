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

  it("renders nothing when there are no votations", () => {
    const { container } = render(<Votacoes votacoes={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
