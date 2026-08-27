import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MainNav } from "./main-nav";
import "@testing-library/jest-dom/vitest";

describe("MainNav", () => {
  it("renders the site title link", () => {
    render(<MainNav />);
    const siteTitleLink = screen.getByText("Radar Legislativo Ecológico");
    expect(siteTitleLink).toBeInTheDocument();
    expect(siteTitleLink.closest("a")).toHaveAttribute("href", "/");
  });

  it("renders the navigation links", () => {
    render(<MainNav />);
    const billsLink = screen.getByText("Projetos de Lei");
    expect(billsLink).toBeInTheDocument();
    expect(billsLink.closest("a")).toHaveAttribute("href", "/bills");

    const temasLink = screen.getByText("Temas");
    expect(temasLink).toBeInTheDocument();
    expect(temasLink.closest("a")).toHaveAttribute("href", "/temas");
  });

  it("renders the GitHub link with correct attributes", () => {
    render(<MainNav />);
    const githubLink = screen.getByLabelText("Código do projeto no GitHub");
    expect(githubLink).toBeInTheDocument();
    expect(githubLink).toHaveAttribute(
      "href",
      "https://github.com/jubrito/RadarEcologico",
    );
    expect(githubLink).toHaveAttribute("target", "_blank");
    expect(githubLink).toHaveAttribute("rel", "noopener noreferrer");
  });
});
