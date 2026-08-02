import { CLASSIFICATION } from "./classifications";

export type Classification =
  (typeof CLASSIFICATION)[keyof typeof CLASSIFICATION];

export interface Bill {
  id: string;
  external_id: string;
  source: string;
  bill_type: string;
  number: number;
  year: number;
  ementa: string;
  full_text?: string | null;
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
}

export interface BillsResponse {
  items: Bill[];
  total: number;
  page: number;
  limit: number;
}

export interface StatsResponse {
  total_bills: number;
  by_classification: Record<string, number>;
  by_source: Record<string, number>;
  by_year: Record<string, number>;
}

export interface ClassifyResponse {
  final_score: number;
  classification: string;
  confidence: string;
  components: Record<string, number>;
  evidence: string[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchAPI<T>(path: string, params?: URLSearchParams): Promise<T> {
  const url = params
    ? `${API_BASE}/api${path}?${params.toString()}`
    : `${API_BASE}/api${path}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

const VALID_CLASSIFICATIONS: ReadonlySet<string> = new Set([
  "favorable",
  "needs_review",
  "unfavorable",
]);

/** Ensures classification is always a known value, defaulting to "unknown". */
function normalizeBill(bill: Bill): Bill {
  if (!bill.classification || !VALID_CLASSIFICATIONS.has(bill.classification)) {
    bill.classification = "unknown";
  }
  return bill;
}

export async function getBills(params?: {
  page?: number;
  limit?: number;
  classification?: string;
  source?: string;
  year?: number;
  search?: string;
  theme?: string;
}): Promise<BillsResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.classification)
    searchParams.set("classification", params.classification);
  if (params?.source) searchParams.set("source", params.source);
  if (params?.year) searchParams.set("year", String(params.year));
  if (params?.search) searchParams.set("search", params.search);
  if (params?.theme) searchParams.set("theme", params.theme);
  const data = await fetchAPI<BillsResponse>("/bills", searchParams);
  data.items = data.items.map(normalizeBill);
  return data;
}

export async function getBill(id: string): Promise<Bill> {
  const bill = await fetchAPI<Bill>(`/bills/${id}`);
  return normalizeBill(bill);
}

export async function getStats(): Promise<StatsResponse> {
  return fetchAPI<StatsResponse>("/stats");
}

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
