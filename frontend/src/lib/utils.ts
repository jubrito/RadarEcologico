import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function mergeStyles(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getScoreColor(score: number): string {
  if (score < 0.3) return "text-emerald-500";
  if (score >= 0.6) return "text-red-500";
  return "text-amber-500";
}

export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleDateString("pt-BR");
}

export function formatSource(source: string): string {
  const sources: Record<string, string> = {
    camara: "Câmara dos Deputados",
    senado: "Senado Federal",
    alesp: "ALESP",
    "camara-sp": "Câmara Municipal de SP",
  };
  return sources[source] || source;
}
