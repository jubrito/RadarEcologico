import Link from "next/link";
import { Bill } from "@/lib/api";
import { cn, formatSource, formatDate } from "@/lib/utils";
import { COLORS, LABELS, shade } from "@/lib/style";

export function BillCard({ bill }: { bill: Bill }) {
  const color = COLORS[bill.classification];

  return (
    <Link href={`/bills/${bill.id}`}>
      <article
        className={cn(
          "rounded-xl border border-border bg-card overflow-hidden h-full",
          "hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer",
        )}
      >
        <div
          className={cn(
            "h-1.5 bg-gradient-to-r",
            `from-${color}`,
            `to-${shade(color, 300)}`,
          )}
        />
        <div className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm leading-snug">
              {bill.bill_type} {bill.number}/{bill.year}
            </h3>
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
                bill.classification === "unknown"
                  ? `bg-${color}/20 text-${shade(color, 400)}`
                  : `bg-${shade(color, 600)}/20 text-${shade(color, 400)}`,
              )}
            >
              {LABELS[bill.classification]}
            </span>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
            {bill.ementa}
          </p>
          <div
            className={cn(
              "flex items-center gap-2 text-[11px] text-muted-foreground pt-1 border-t",
              `border-${color}/50`,
            )}
          >
            <span>{formatSource(bill.source)}</span>
            {bill.author && (
              <>
                <span aria-hidden="true">·</span>
                <span>{bill.author}</span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <time dateTime={bill.presentation_date || undefined}>
              {formatDate(bill.presentation_date)}
            </time>
          </div>
        </div>
      </article>
    </Link>
  );
}
