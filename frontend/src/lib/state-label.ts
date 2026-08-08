import { STATE_NAMES } from "./content";

export function stateLabel(abbr: string | null | undefined): string | null {
  if (!abbr) return null;
  const upper = abbr.toUpperCase().trim();
  const name = STATE_NAMES[upper];
  return name ? `${name}, ${upper}` : upper;
}
