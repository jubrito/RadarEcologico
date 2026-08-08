import { describe, it, expect } from "vitest";
import { parseAuthor } from "./bill-helpers";
import type { Bill } from "./api";

function bill(overrides: Partial<Bill> = {}): Bill {
  return {
    id: "1", external_id: "1", source: "camara", bill_type: "PL",
    number: 100, year: 2026, ementa: "...", link: "http://...",
    classification: "favorable", ...overrides,
  } as Bill;
}

describe("parseAuthor", () => {
  it("extracts structured author fields", () => {
    const result = parseAuthor(
      bill({ author: "Dep. João", author_party: "PT", author_state: "SP" }),
    );
    expect(result.name).toBe("Dep. João");
    expect(result.party).toBe("PT");
    expect(result.state).toBe("SP");
  });

  it("extracts embedded party/state from author string", () => {
    const result = parseAuthor(
      bill({ author: "Sen. Maria (PP/RR)", author_party: null, author_state: null }),
    );
    expect(result.name).toBe("Sen. Maria");
    expect(result.party).toBe("PP");
    expect(result.state).toBe("RR");
  });

  it("prefers structured fields over embedded", () => {
    const result = parseAuthor(
      bill({ author: "Dep. João (XX/YY)", author_party: "PT", author_state: "SP" }),
    );
    expect(result.name).toBe("Dep. João");
    expect(result.party).toBe("PT");
    expect(result.state).toBe("SP");
  });

  it("handles null author", () => {
    const result = parseAuthor(bill({ author: null }));
    expect(result.name).toBeNull();
    expect(result.party).toBeNull();
    expect(result.state).toBeNull();
  });

  it("handles author without embedded info", () => {
    const result = parseAuthor(
      bill({ author: "Comissão de Meio Ambiente", author_party: null, author_state: null }),
    );
    expect(result.name).toBe("Comissão de Meio Ambiente");
    expect(result.party).toBeNull();
    expect(result.state).toBeNull();
  });
});
