import { mergeStyles } from "@/lib/utils/utils";
import { STYLE_MAP } from "@/lib/style";
import type { Classification } from "@/lib/api";

interface StatCardProps {
  prefix: string;
  tema: string;
  value: number;
  desc: string;
  variant: Classification;
}

export function StatCard({
  prefix,
  tema,
  value,
  desc,
  variant,
}: StatCardProps) {
  const style = STYLE_MAP[variant];

  return (
    <div
      className={mergeStyles(
        "relative rounded-xl overflow-hidden p-4",
        style.fadedBg,
      )}
    >
      <div
        className={mergeStyles(
          "absolute top-0 left-0 right-0 h-1",
          style.bgSolid,
        )}
      />
      <div className="flex justify-start gap-4">
        <p
          className={mergeStyles(
            "text-2xl font-bold tabular-nums shrink-0",
            style.textAccent,
          )}
        >
          {value}
        </p>
        <div className="min-w-0 space-y-0.5">
          <p className="text-lg font-bold leading-snug">
            {prefix}
            <span className={style.textAccent}>{tema}</span>
          </p>
          <p className="text-sm mt-2 text-muted-foreground leading-snug">
            {desc}
          </p>
        </div>
      </div>
    </div>
  );
}
