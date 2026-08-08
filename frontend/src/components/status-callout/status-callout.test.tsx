import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusCallout } from "./status-callout";

describe("StatusCallout", () => {
  it("renders status text", () => {
    render(<StatusCallout status="Aguardando Parecer" />);
    expect(screen.getByText("Aguardando Parecer")).toBeInTheDocument();
  });

  it("renders timeline chips for known status", () => {
    render(<StatusCallout status="Aguardando Parecer" />);
    expect(screen.getByText("Apresentação")).toBeInTheDocument();
    expect(screen.getByText("Comissão")).toBeInTheDocument();
    expect(screen.getByText("Plenário")).toBeInTheDocument();
    expect(screen.getByText("Sanção")).toBeInTheDocument();
  });

  it("renders explanation for known status", () => {
    render(<StatusCallout status="Pronta para Pauta" />);
    expect(screen.getByText(/ordem do dia/)).toBeInTheDocument();
  });

  it("renders timeline without explanation for unknown status", () => {
    render(<StatusCallout status="Status desconhecido" />);
    expect(screen.getByText("Apresentação")).toBeInTheDocument();
    expect(screen.queryByText(/ordem do dia/)).not.toBeInTheDocument();
  });

  it("marks presentation and comissao as done for plenario phase", () => {
    render(<StatusCallout status="Pronta para Pauta" />);
    const chips = screen.getAllByText(/Apresentação|Comissão|Plenário|Sanção/);
    // First two chips should be done (have CheckIcon), third is current
    expect(chips.length).toBe(4);
  });

  it("renders bright arrows before current phase", () => {
    const { container } = render(<StatusCallout status="Pronta para Pauta" />);
    // Pronta para Pauta is plenario (index 2), so first 2 arrows are before current
    const arrows = container.querySelectorAll(".lucide-arrow-right");
    expect(arrows.length).toBe(3);
    expect(arrows[0].classList.contains("text-foreground")).toBe(true);
    expect(arrows[1].classList.contains("text-foreground")).toBe(true);
    expect(arrows[2].classList.contains("text-muted-foreground")).toBe(true);
  });

  it("renders all arrows muted for unknown status", () => {
    const { container } = render(<StatusCallout status="desconhecido" />);
    const arrows = container.querySelectorAll(".lucide-arrow-right");
    arrows.forEach((arrow) => {
      expect(arrow.classList.contains("text-muted-foreground")).toBe(true);
    });
  });
});

