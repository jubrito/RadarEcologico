import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Timeline } from "./timeline";

describe("Timeline", () => {
  it("renders events with date, description and orgao", () => {
    render(
      <Timeline
        events={[
          { date: "2026-02-02", description: "Apresentação de Proposição", orgao: "MESA" },
          { date: "2026-03-10", description: "Aprovado na Comissão", orgao: "CMADS" },
        ]}
      />,
    );

    expect(screen.getByText("Apresentação de Proposição")).toBeInTheDocument();
    expect(screen.getByText("Aprovado na Comissão")).toBeInTheDocument();
    expect(screen.getByText("MESA")).toBeInTheDocument();
    expect(screen.getByText("CMADS")).toBeInTheDocument();
    expect(screen.getByText("02/02/2026")).toBeInTheDocument();
  });

  it("renders a list in chronological order", () => {
    render(
      <Timeline
        events={[
          { date: "2026-03-10", description: "Segundo evento" },
          { date: "2026-02-02", description: "Primeiro evento" },
        ]}
      />,
    );

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
  });

  it("renders nothing when there are no events", () => {
    const { container } = render(<Timeline events={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
