import Link from "next/link";
import { Bill } from "@/lib/api";
import { mergeStyles, formatSource, formatDate } from "@/lib/utils/utils";
import { STYLE_MAP } from "@/lib/style";

export function BillCard({ bill }: { bill: Bill }) {
  const style = STYLE_MAP[bill.classification];

  return (
    <Link href={`/bills/${bill.id}`}>
      <article
        className={mergeStyles(
          "group rounded-xl border overflow-hidden h-full",
          "bg-card transition-all cursor-pointer",
          "hover:shadow-lg hover:-translate-y-0.5",
          style.hoverSolidBg,
          style.border,
        )}
      >
        <div className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <span
                className={mergeStyles(
                  "w-2 h-2 rounded-full shrink-0",
                  style.bgSolid,
                  "group-hover:bg-black",
                )}
              />
              <h3 className="font-bold text-md leading-snug group-hover:text-black">
                {bill.bill_type} {bill.number}/{bill.year}
              </h3>
            </div>
            <span
              className={mergeStyles(
                "shrink-0 rounded-full px-2 py-0.5 text-[13px] font-medium",
                "group-hover:bg-black group-hover:text-white",
                style.badge,
              )}
            >
              {style.label}
            </span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed group-hover:text-black">
            {bill.ementa}
          </p>
          <div
            className={mergeStyles(
              "flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t",
              "group-hover:text-black group-hover:border-black",
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
