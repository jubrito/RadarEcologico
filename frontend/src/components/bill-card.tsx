import Link from "next/link";
import { Bill } from "@/lib/api";
import { cn, formatSource, formatDate } from "@/lib/utils";
import { STYLE_MAP } from "@/lib/style";

export function BillCard({ bill }: { bill: Bill }) {
  const classification = bill.classification;
  const style = STYLE_MAP[classification];

  return (
    <Link href={`/bills/${bill.id}`}>
      <article
        className={cn(
          "rounded-xl border bg-black overflow-hidden h-full",
          "hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer",
          `bg-card hover:${style.fadedBg}`,
          `border-1 ${style.border}`,
        )}
      >
        <div className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <span
                className={`w-2 h-2 rounded-full ${style.bgSolid} shrink-0`}
              />
              <h3 className="font-semibold text-sm leading-snug">
                {bill.bill_type} {bill.number}/{bill.year}
              </h3>
            </div>
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
                style.badge,
              )}
            >
              {style.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
            {bill.ementa}
          </p>
          <div
            className={cn(
              "flex items-center gap-2 text-[11px] text-muted-foreground pt-2 border-t",
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
