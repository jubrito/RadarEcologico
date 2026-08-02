import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MultiSelect } from "./multiselect";

const options = [
  { value: "all", label: "Todos os temas (10)" },
  { value: "48", label: "Meio Ambiente (3)" },
  { value: "54", label: "Energia (2)" },
  { value: "64", label: "Agricultura (1)" },
];

describe("MultiSelect", () => {
  it("renders placeholder when nothing selected", () => {
    render(
      <MultiSelect
        options={options}
        selected={[]}
        onChange={() => {}}
        placeholder="Todos os temas"
      />,
    );

    expect(screen.getByText("Todos os temas")).toBeInTheDocument();
  });

  it("renders single selected label", () => {
    render(
      <MultiSelect
        options={options}
        selected={["48"]}
        onChange={() => {}}
        placeholder="Filtrar..."
      />,
    );

    expect(screen.getByText("Meio Ambiente (3)")).toBeInTheDocument();
  });

  it("renders count when multiple selected", () => {
    render(
      <MultiSelect
        options={options}
        selected={["48", "54"]}
        onChange={() => {}}
        placeholder="Filtrar..."
      />,
    );

    expect(screen.getByText("2 temas selecionados")).toBeInTheDocument();
  });

  it("opens dropdown on click", () => {
    render(
      <MultiSelect
        options={options}
        selected={[]}
        onChange={() => {}}
      />,
    );

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("sets aria-expanded correctly", () => {
    render(
      <MultiSelect
        options={options}
        selected={[]}
        onChange={() => {}}
      />,
    );

    const combobox = screen.getByRole("combobox");
    expect(combobox).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(combobox);
    expect(combobox).toHaveAttribute("aria-expanded", "true");
  });

  it("marks selected options with aria-selected", () => {
    render(
      <MultiSelect
        options={options}
        selected={["48"]}
        onChange={() => {}}
      />,
    );

    fireEvent.click(screen.getByRole("combobox"));

    const opts = screen.getAllByRole("option");
    const meioAmbiente = opts.find((o) => o.textContent?.includes("Meio Ambiente"));
    const energia = opts.find((o) => o.textContent?.includes("Energia"));

    expect(meioAmbiente).toHaveAttribute("aria-selected", "true");
    expect(energia).toHaveAttribute("aria-selected", "false");
  });

  it("calls onChange when option clicked", () => {
    const onChange = vi.fn();
    render(
      <MultiSelect
        options={options}
        selected={[]}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByText("Meio Ambiente (3)"));

    expect(onChange).toHaveBeenCalledWith(["48"]);
  });

  it("removes item when already selected", () => {
    const onChange = vi.fn();
    render(
      <MultiSelect
        options={options}
        selected={["48", "54"]}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByText("Meio Ambiente (3)"));

    expect(onChange).toHaveBeenCalledWith(["54"]);
  });

  it("clears all via X button", () => {
    const onChange = vi.fn();
    render(
      <MultiSelect
        options={options}
        selected={["48", "54"]}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByLabelText("Limpar filtro de temas"));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it("does not render all option in listbox", () => {
    render(
      <MultiSelect
        options={options}
        selected={[]}
        onChange={() => {}}
      />,
    );

    fireEvent.click(screen.getByRole("combobox"));

    const opts = screen.getAllByRole("option");
    const allOpt = opts.find((o) => o.textContent?.includes("Todos os temas"));
    expect(allOpt).toBeUndefined();
  });

  it("closes on Escape key", () => {
    render(
      <MultiSelect
        options={options}
        selected={[]}
        onChange={() => {}}
      />,
    );

    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("supports keyboard navigation", () => {
    render(
      <MultiSelect
        options={options}
        selected={[]}
        onChange={() => {}}
      />,
    );

    fireEvent.click(screen.getByRole("combobox"));

    fireEvent.keyDown(document, { key: "ArrowDown" });
    fireEvent.keyDown(document, { key: "ArrowDown" });

    const opts = screen.getAllByRole("option");
    // second item should be focused (index 1)
    expect(opts[1]).toHaveAttribute("tabindex", "0");
  });
});
