import { describe, it, expect } from "vitest";
import { THEME_MAP } from "./themes";

const BACKEND_THEME_CODES = [
  "40",
  "41",
  "44",
  "48",
  "51",
  "54",
  "55",
  "56",
  "61",
  "62",
  "64",
  "66",
  "68",
  "70",
  "76",
];

describe("THEME_MAP", () => {
  it("keeps parity with the backend climate theme codes", () => {
    expect(Object.keys(THEME_MAP).sort()).toEqual(BACKEND_THEME_CODES);
  });

  it("has non-empty labels for every theme", () => {
    for (const label of Object.values(THEME_MAP)) {
      expect(label.trim()).not.toBe("");
    }
  });
});
