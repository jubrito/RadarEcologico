"use client";

import { type VariantProps } from "class-variance-authority";
import { Badge, badgeVariants } from "@/components/ui/badge";
import {
  getClassificationLabel,
  getClassificationColor,
  getScoreColor,
} from "@/lib/utils";

interface ClassificationBadgeProps extends VariantProps<typeof badgeVariants> {
  classification: string;
  score?: number | null;
}

export function ClassificationBadge({
  classification,
  score,
  ...props
}: ClassificationBadgeProps) {
  return (
    <span className="inline-flex items-center gap-2">
      <Badge
        className={getClassificationColor(classification)}
        {...props}
      >
        {getClassificationLabel(classification)}
      </Badge>
      {score != null && (
        <span
          className={`text-sm font-mono tabular-nums ${getScoreColor(score)}`}
          aria-label={`Score de risco climático: ${(score * 100).toFixed(0)}%`}
        >
          {(score * 100).toFixed(0)}%
        </span>
      )}
    </span>
  );
}
