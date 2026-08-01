import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getClassificationLabel(label: string): string {
  const labels: Record<string, string> = {
    favorable: "Combate à crise climática",
    needs_review: "Requer revisão humana",
    unfavorable: "Agravamento da crise climática",
  };
  return labels[label] || label;
}

export function getClassificationColor(label: string): string {
  const colors: Record<string, string> = {
    favorable: "bg-emerald-600 text-white",
    needs_review: "bg-amber-500 text-black",
    unfavorable: "bg-red-600 text-white",
  };
  return colors[label] || "bg-gray-500 text-white";
}

export function getScoreColor(score: number): string {
  if (score < 0.30) return "text-emerald-500";
  if (score >= 0.60) return "text-red-500";
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
