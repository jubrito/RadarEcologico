import { CLASSIFICATION } from "./utils/classifications";
import type {
  Classification,
  BillQueryParams,
  ClassifyComponents,
} from "./types";

export type { Classification };

export interface Bill {
  id: string;
  external_id: string;
  source: string;
  bill_type: string;
  number: number;
  year: number;
  ementa: string;
  author?: string | null;
  author_party?: string | null;
  author_state?: string | null;
  presentation_date?: string | null;
  status?: string | null;
  link: string;
  keyword_score?: number | null;
  bert_score?: number | null;
  final_score?: number | null;
  classification: Classification;
  theme_ids?: string | null;
  theme_names?: string | null;
  classified_at?: string | null;
  created_at?: string | null;
  reviewed?: boolean;
  reviewed_classification?: Classification | null;
  reviewed_score?: number | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
}

export interface BillsResponse {
  items: Bill[];
  total: number;
  page: number;
  limit: number;
}

export interface StatsResponse {
  total_bills: number;
  reviewed: number;
  by_classification: Record<string, number>;
  by_source: Record<string, number>;
  by_year: Record<string, number>;
  by_theme: Record<string, number>;
  by_party: Record<string, number>;
}

export interface ClassifyResponse {
  final_score: number;
  classification: Classification;
  confidence: string;
  components: ClassifyComponents;
  evidence: string[];
}

export interface TramitacaoEvent {
  date: string;
  description: string;
  orgao?: string | null;
}

export interface VotacaoEvent {
  date: string;
  orgao?: string | null;
  description: string;
  aprovado: boolean;
  orientacoes: { partido: string; voto: string }[];
}

// The static site is served from GitHub Pages (e.g. /RadarEcologico/). The
// generated JSON lives under <basePath>/data/. Locally basePath is empty.
const DATA_BASE = `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/data`;

const KNOWN_CLASSIFICATIONS: ReadonlySet<string> = new Set([
  CLASSIFICATION.favorable,
  CLASSIFICATION.needs_review,
  CLASSIFICATION.unfavorable,
  CLASSIFICATION.neutral,
]);

/** Ensures classification is always a known value, defaulting to "unknown". */
function normalizeBill(bill: Bill): Bill {
  if (!KNOWN_CLASSIFICATIONS.has(bill.classification ?? "")) {
    bill.classification = CLASSIFICATION.unknown;
  }
  return bill;
}

async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${DATA_BASE}/${path}`);
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

// In-memory caches so the JSON is fetched once per session instead of on every
// navigation (the app is client-side; this avoids redundant network requests).
let billsCache: Promise<Bill[]> | null = null;
let statsCache: Promise<StatsResponse> | null = null;
let tramitacoesCache: Promise<Record<string, TramitacaoEvent[]>> | null = null;
let votacoesCache: Promise<Record<string, VotacaoEvent[]>> | null = null;

function loadBills(): Promise<Bill[]> {
  if (!billsCache) {
    billsCache = fetchJSON<Bill[]>("bills.json")
      .then((bills) => bills.map(normalizeBill))
      .catch((err) => {
        billsCache = null;
        throw err;
      });
  }
  return billsCache;
}

function loadStats(): Promise<StatsResponse> {
  if (!statsCache) {
    statsCache = fetchJSON<StatsResponse>("stats.json").catch((err) => {
      statsCache = null;
      throw err;
    });
  }
  return statsCache;
}

function loadTramitacoes(): Promise<Record<string, TramitacaoEvent[]>> {
  if (!tramitacoesCache) {
    tramitacoesCache = fetchJSON<Record<string, TramitacaoEvent[]>>(
      "tramitacoes.json",
    ).catch((err) => {
      tramitacoesCache = null;
      throw err;
    });
  }
  return tramitacoesCache;
}

function loadVotacoes(): Promise<Record<string, VotacaoEvent[]>> {
  if (!votacoesCache) {
    votacoesCache = fetchJSON<Record<string, VotacaoEvent[]>>(
      "votacoes.json",
    ).catch((err) => {
      votacoesCache = null;
      throw err;
    });
  }
  return votacoesCache;
}

/** Reset the in-memory caches (exposed for tests). */
export function resetStaticDataCache() {
  billsCache = null;
  statsCache = null;
  tramitacoesCache = null;
  votacoesCache = null;
}

/**
 * Apply the query filters and default ordering to a list of bills.
 * Mirrors the backend `GET /api/bills` semantics (client-side equivalent).
 */
export function filterBills(bills: Bill[], params: BillQueryParams): Bill[] {
  let result = bills;

  if (params.classification) {
    result = result.filter((b) => b.classification === params.classification);
  }
  if (params.source) {
    result = result.filter((b) => b.source === params.source);
  }
  if (params.year) {
    result = result.filter((b) => b.year === params.year);
  }
  if (params.party) {
    result = result.filter((b) => b.author_party === params.party);
  }
  if (params.search) {
    const query = params.search.toLowerCase();
    result = result.filter((b) =>
      [b.ementa, b.bill_type, b.author, b.status, String(b.number)].some(
        (value) => value != null && value.toLowerCase().includes(query),
      ),
    );
  }
  if (params.theme) {
    const codes = params.theme
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    if (codes.length > 0) {
      result = result.filter((b) =>
        codes.some((code) => (b.theme_ids ?? "").includes(code)),
      );
    }
  }

  // Newest first, null dates last (stable across filter calls).
  return result.slice().sort((a, b) => {
    const dateA = a.presentation_date ?? "";
    const dateB = b.presentation_date ?? "";
    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;
    return dateB.localeCompare(dateA);
  });
}

export async function getBills(
  params?: BillQueryParams,
): Promise<BillsResponse> {
  const bills = await loadBills();
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;
  const filtered = filterBills(bills, params ?? {});
  const start = (page - 1) * limit;
  return {
    items: filtered.slice(start, start + limit),
    total: filtered.length,
    page,
    limit,
  };
}

export async function getBill(id: string): Promise<Bill> {
  const bills = await loadBills();
  const bill = bills.find((b) => b.id === id);
  if (!bill) {
    throw new Error("API error: 404 Not Found");
  }
  return bill;
}

export async function getTramitacoes(id: string): Promise<TramitacaoEvent[]> {
  const map = await loadTramitacoes();
  return map[id] ?? [];
}

export async function getVotacoes(id: string): Promise<VotacaoEvent[]> {
  const map = await loadVotacoes();
  return map[id] ?? [];
}

export async function getStats(): Promise<StatsResponse> {
  return loadStats();
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Classify a bill ementa on demand. Requires the live FastAPI backend
 * (`POST /api/classify`), which is not part of the static GitHub Pages site.
 */
export async function classifyText(text: string): Promise<ClassifyResponse> {
  const res = await fetch(`${API_BASE}/api/classify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    throw new Error(`Classify error: ${res.status}`);
  }
  return res.json() as Promise<ClassifyResponse>;
}
