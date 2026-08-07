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
    <span className="flex flex-col gap-2">
      <span>
        <Badge className={style.badge} {...props}>
          {style.label}
        </Badge>
      </span>
      {score != null && (
        <span
          className={`text-sm font-mono tabular-nums ${getScoreColor(score)}`}
        >
          Potencial risco de agravar a crise climática:{" "}
          <span className="font-extrabold">{(score * 100).toFixed(0)}%</span>
        </span>
      )}
    </span>
  );
}
