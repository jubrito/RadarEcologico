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
        aria-hidden="true"
      />
      <div className="flex-1 flex-row justify-start gap-4">
        <span
          className={`float-left text-2xl font-bold ${style.bgSolid} px-2.5 py-0.5 mr-5 mt-1 border rounded-lg text-black`}
        >
          {value}
        </span>
        <div className="min-w-0">
          <p className="text-lg font-bold leading-snug">
            {prefix}
            <span className={`${style.textAccent}`}>{tema}</span>
          </p>
          <p className="text-sm mt-2 text-muted-foreground">{desc}</p>
        </div>
      </div>
    </div>
  );
}
