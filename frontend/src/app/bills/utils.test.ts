import { describe, it, expect } from "vitest";
import { withCounts, renderLabel } from "./bills-content";

describe("withCounts", () => {
  const opts = [
    { value: "all", label: "Todos" },
    { value: "a", label: "Opção A" },
    { value: "b", label: "Opção B" },
  ];

  it("appends count to non-all options", () => {
    const result = withCounts(opts, { a: 5, b: 3 });
    expect(result[0].label).toBe("Todos");
    expect(result[1].label).toBe("Opção A (5)");
    expect(result[2].label).toBe("Opção B (3)");
  });

  it("keeps all label unchanged even when count available", () => {
    const result = withCounts(opts, { all: 10, a: 2 });
    expect(result[0].label).toBe("Todos");
  });

  it("shows 0 for missing counts", () => {
    const result = withCounts(opts, {});
    expect(result[1].label).toBe("Opção A (0)");
    expect(result[2].label).toBe("Opção B (0)");
  });

  it("handles empty options", () => {
    expect(withCounts([], {})).toEqual([]);
  });
});

describe("renderLabel", () => {
  const opts = [
    { value: "all", label: "Todos (10)" },
    { value: "a", label: "Opção A (5)" },
  ];

  it("returns label for matching value", () => {
    expect(renderLabel(opts, "a", "fallback")).toBe("Opção A (5)");
  });

  it("returns fallback when value not found", () => {
    expect(renderLabel(opts, "z", "Nenhum")).toBe("Nenhum");
  });

  it("returns fallback for empty options", () => {
    expect(renderLabel([], "x", "padrão")).toBe("padrão");
  });
});
