import type { Classification } from "./api";

export const STYLE_MAP: Record<
  Classification,
  {
    gradient: string;
    badge: string;
    border: string;
    fadedBg: string;
    fadedHover: string;
    textAccent: string;
    bgSolid: string;
    label: string;
  }
> = {
  favorable: {
    gradient: "from-emerald-500 to-emerald-300",
    badge: "bg-emerald-600/20 text-emerald-400",
    border: "border-emerald-500/30",
    fadedBg: "bg-emerald-950/30",
    fadedHover: "hover:bg-emerald-950/30",
    textAccent: "text-emerald-400",
    bgSolid: "bg-emerald-500",
    label: "Combate à crise climática",
  },
  needs_review: {
    gradient: "from-amber-500 to-amber-300",
    badge: "bg-amber-500/20 text-amber-400",
    border: "border-amber-500/30",
    fadedBg: "bg-amber-950/30",
    fadedHover: "hover:bg-amber-950/30",
    textAccent: "text-amber-400",
    bgSolid: "bg-amber-500",
    label: "Requer revisão humana",
  },
  unfavorable: {
    gradient: "from-red-500 to-red-300",
    badge: "bg-red-600/20 text-red-400",
    border: "border-red-500/30",
    fadedBg: "bg-red-950/30",
    fadedHover: "hover:bg-red-950/30",
    textAccent: "text-red-400",
    bgSolid: "bg-red-500",
    label: "Intensifica a crise climática",
  },
  unknown: {
    gradient: "from-gray-500 to-gray-300",
    badge: "bg-gray-500/20 text-gray-400",
    border: "border-border/50",
    fadedBg: "border-gray-500/30",
    fadedHover: "hover:bg-gray-950/30",
    textAccent: "text-gray-400",
    bgSolid: "bg-gray-500",
    label: "Não classificado",
  },
} as const;
