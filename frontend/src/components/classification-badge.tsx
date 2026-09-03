"use client";

import { type VariantProps } from "class-variance-authority";
import { badgeVariants } from "@/components/ui/badge";
import { getScoreColor } from "@/lib/utils/utils";
import { getClassificationPhrase } from "@/lib/utils/classifications";
import type { Classification } from "@/lib/api";

interface ClassificationBadgeProps extends VariantProps<typeof badgeVariants> {
  classification: Classification;
  score?: number | null;
  reviewed?: boolean;
}

export function RiskClassificationBadge({
  classification,
  score,
  reviewed = false,
}: ClassificationBadgeProps) {
  const phrase = getClassificationPhrase(classification, score);

  return (
    <span className="flex flex-col gap-2">
      {score != null && (
        <span
          className={`text-md font-mono tabular-nums ${getScoreColor(score)}`}
        >
          Potencial risco de agravar a crise climática:
          <span className="font-extrabold ml-1">
            {(score * 100).toFixed(0)}%
          </span>
        </span>
      )}
      {phrase && (
        <span className="text-sm text-muted-foreground">
          <strong>
            {reviewed
              ? "Classificação (revisada):"
              : "Classificação (estimada):"}
          </strong>{" "}
          {phrase}
        </span>
      )}
    </span>
  );
}
