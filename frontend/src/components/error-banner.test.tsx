import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ErrorBanner } from "./error-banner";
import "@testing-library/jest-dom/vitest";

const DEFAULT_MESSAGE =
  "Não foi possível carregar os resultados dessa página devido a um erro no servidor. Por favor, tente novamente mais tarde.";

describe("ErrorBanner", () => {
  it("renders the default message", () => {
    render(<ErrorBanner />);
    expect(screen.getByText(DEFAULT_MESSAGE)).toBeInTheDocument();
  });

  it("is announced to assistive technology via role=alert", () => {
    render(<ErrorBanner />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("renders a custom message", () => {
    render(<ErrorBanner message="Erro ao carregar os dados." />);
    expect(screen.getByText("Erro ao carregar os dados.")).toBeInTheDocument();
  });

  it("renders the technical detail when provided", () => {
    render(<ErrorBanner detail="Network error" />);
    expect(screen.getByText("Network error")).toBeInTheDocument();
    expect(screen.getAllByRole("paragraph")).toHaveLength(2);
  });

  it("does not render a detail when absent", () => {
    render(<ErrorBanner />);
    expect(screen.getAllByRole("paragraph")).toHaveLength(1);
  });

  it("renders a warning icon", () => {
    const { container } = render(<ErrorBanner />);
    expect(container.querySelector("svg")).not.toBeNull();
  });
});
