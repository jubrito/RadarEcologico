"use client";

import { type VariantProps } from "class-variance-authority";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { getScoreColor } from "@/lib/utils/utils";
import { STYLE_MAP } from "@/lib/style";
import type { Classification } from "@/lib/api";

interface ClassificationBadgeProps extends VariantProps<typeof badgeVariants> {
  classification: Classification;
  score?: number | null;
}

export function ClassificationBadge({
  classification,
  score,
  ...props
}: ClassificationBadgeProps) {
  const style = STYLE_MAP[classification];

  return (
    <span className="inline-flex items-center gap-2">
      <Badge className={style.badge} {...props}>
        {style.label}
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
