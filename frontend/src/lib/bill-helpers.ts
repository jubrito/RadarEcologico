import type { Bill } from "./api";

export interface ParsedAuthor {
  name: string | null;
  party: string | null;
  state: string | null;
}

/**
 * Parse bill author field for both structured (author_party, author_state)
 * and embedded formats ("Dep. Name (PP/SP)").
 */
export function parseAuthor(bill: Bill): ParsedAuthor {
  const match = bill.author?.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
  const cleanName = match ? match[1].trim() : bill.author ?? null;
  const embedded = match ? match[2].trim() : null;

  return {
    name: cleanName,
    party:
      bill.author_party ?? embedded?.split("/")[0]?.trim() ?? null,
    state:
      bill.author_state ?? embedded?.split("/")[1]?.trim() ?? null,
  };
}
