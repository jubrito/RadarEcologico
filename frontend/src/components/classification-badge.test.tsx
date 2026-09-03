import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RiskClassificationBadge } from "./classification-badge";

describe("RiskClassificationBadge", () => {
  it("does not render a phrase when score is absent", () => {
    render(<RiskClassificationBadge classification="favorable" />);
    expect(screen.queryByText(/Classificação/)).not.toBeInTheDocument();
  });

  it("does not render a phrase for needs_review without a score", () => {
    render(<RiskClassificationBadge classification="needs_review" />);
    expect(screen.queryByText(/Classificação/)).not.toBeInTheDocument();
  });

  it("does not render a phrase for unfavorable without a score", () => {
    render(<RiskClassificationBadge classification="unfavorable" />);
    expect(screen.queryByText(/Classificação/)).not.toBeInTheDocument();
  });

  it("does not render a phrase for unknown classification", () => {
    render(<RiskClassificationBadge classification="unknown" />);
    expect(screen.queryByText(/Classificação/)).not.toBeInTheDocument();
  });

  it("does not render a phrase for neutral classification", () => {
    render(<RiskClassificationBadge classification="neutral" />);
    expect(screen.queryByText(/Classificação/)).not.toBeInTheDocument();
  });

  it("shows the phrase for a favorable bill", () => {
    render(<RiskClassificationBadge classification="favorable" score={0.15} />);
    expect(
      screen.getByText(
        "Ativamente combate as causas da catástrofe climática ou minimiza as suas consequências.",
      ),
    ).toBeInTheDocument();
  });

  it("shows the phrase for an unfavorable bill", () => {
    render(
      <RiskClassificationBadge classification="unfavorable" score={0.8} />,
    );
    expect(
      screen.getByText(
        "Intensifica diretamente as causas da catástrofe climática ou piora as suas consequências.",
      ),
    ).toBeInTheDocument();
  });

  it("shows the phrase for a needs_review bill leaning positive", () => {
    render(
      <RiskClassificationBadge classification="needs_review" score={0.33} />,
    );
    expect(
      screen.getByText(
        "Ajuda de alguma forma (mesmo que não significativamente) no combate às causas da catástrofe climática ou a minimização de suas consequências.",
      ),
    ).toBeInTheDocument();
  });

  it("shows the phrase for a needs_review bill in the middle", () => {
    render(
      <RiskClassificationBadge classification="needs_review" score={0.45} />,
    );
    expect(
      screen.getByText(
        "Neutro (nem ajuda nem atrapalha significativamente o combate às causas da catástrofe climática ou a minimização de suas consequências)",
      ),
    ).toBeInTheDocument();
  });

  it("shows the phrase for a needs_review bill leaning negative", () => {
    render(
      <RiskClassificationBadge classification="needs_review" score={0.55} />,
    );
    expect(
      screen.getByText(
        "Atrapalha de alguma forma (mesmo que não significativamente) o combate às causas da catástrofe climática ou a minimização de suas consequências.",
      ),
    ).toBeInTheDocument();
  });

  it("labels the phrase as an estimated classification", () => {
    render(<RiskClassificationBadge classification="favorable" score={0.15} />);
    expect(screen.getByText("Classificação (estimada):")).toBeInTheDocument();
  });

  it("labels the phrase as reviewed when reviewed is true", () => {
    render(
      <RiskClassificationBadge
        classification="favorable"
        score={0.15}
        reviewed
      />,
    );
    expect(screen.getByText("Classificação (revisada):")).toBeInTheDocument();
  });

  it("shows score percentage when provided", () => {
    render(<RiskClassificationBadge classification="favorable" score={0.31} />);
    expect(screen.getByText(/31%/)).toBeInTheDocument();
    expect(screen.getByText(/Potencial risco/)).toBeInTheDocument();
  });

  it("does not show score text when null", () => {
    render(<RiskClassificationBadge classification="favorable" score={null} />);
    expect(screen.queryByText(/Potencial risco/)).not.toBeInTheDocument();
  });

  it("shows risk text with percentage", () => {
    render(<RiskClassificationBadge classification="favorable" score={0.75} />);
    expect(screen.getByText(/75%/)).toBeInTheDocument();
  });
});
