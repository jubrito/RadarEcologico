import { describe, it, expect } from "vitest";
import { stateLabel } from "./state-label";

describe("stateLabel", () => {
  it("returns full name for known abbreviation", () => {
    expect(stateLabel("SP")).toBe("São Paulo, SP");
    expect(stateLabel("RJ")).toBe("Rio de Janeiro, RJ");
    expect(stateLabel("MG")).toBe("Minas Gerais, MG");
  });

  it("returns abbreviation only when unknown", () => {
    expect(stateLabel("XX")).toBe("XX");
  });

  it("handles lowercase input", () => {
    expect(stateLabel("sp")).toBe("São Paulo, SP");
  });

  it("handles whitespace", () => {
    expect(stateLabel(" SP ")).toBe("São Paulo, SP");
  });

  it("returns null for null", () => {
    expect(stateLabel(null)).toBeNull();
  });

  it("returns null for undefined", () => {
    expect(stateLabel(undefined)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(stateLabel("")).toBeNull();
  });
});
