import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Timeline } from "./timeline";

describe("Timeline", () => {
  it("renders events with date, description and orgao", () => {
    render(
      <Timeline
        events={[
          { date: "2026-02-02", description: "Apresentação de Proposição", orgao: "Mesa Diretora" },
          { date: "2026-03-10", description: "Aprovado na Comissão", orgao: "Comissão de Meio Ambiente" },
        ]}
      />,
    );

    expect(screen.getByText("Apresentação de Proposição")).toBeInTheDocument();
    expect(screen.getByText("Aprovado na Comissão")).toBeInTheDocument();
    expect(screen.getByText("Mesa Diretora")).toBeInTheDocument();
    expect(screen.getByText("02/02/2026")).toBeInTheDocument();
  });

  it("marks the most recent event as the current state", () => {
    render(
      <Timeline
        events={[
          { date: "2026-02-02", description: "Evento antigo" },
          { date: "2026-03-10", description: "Evento recente" },
        ]}
      />,
    );

    expect(screen.getByText("Situação atual")).toBeInTheDocument();
  });

  it("renders newest first", () => {
    render(
      <Timeline
        events={[
          { date: "2026-02-02", description: "Evento antigo" },
          { date: "2026-03-10", description: "Evento recente" },
        ]}
      />,
    );

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("Evento recente");
    expect(items[1]).toHaveTextContent("Evento antigo");
  });

  it("renders the timeline heading and current-state marker", () => {
    render(
      <Timeline
        events={[
          { date: "2026-02-02", description: "Evento antigo" },
          { date: "2026-03-10", description: "Evento recente" },
        ]}
      />,
    );

    expect(screen.getByText("Tramitação")).toBeInTheDocument();
    expect(screen.getByText(/Caminho que a proposta percorre/)).toBeInTheDocument();
    expect(screen.getByText("Situação atual")).toBeInTheDocument();
  });

  it("renders nothing when there are no events", () => {
    const { container } = render(<Timeline events={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
