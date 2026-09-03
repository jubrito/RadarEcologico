import Link from "next/link";
import { Bill } from "@/lib/api";
import { mergeStyles, formatSource, formatDate } from "@/lib/utils/utils";
import { STYLE_MAP } from "@/lib/style";
import { themeNamesFromIds } from "@/lib/themes";
import { deriveBillClassification } from "@/lib/bill-helpers";

export function BillCard({ bill }: { bill: Bill }) {
  const classification = deriveBillClassification(bill);
  const style = STYLE_MAP[classification];
  const themes = themeNamesFromIds(bill.theme_ids);

  return (
    <Link href={`/bills/${bill.id}`}>
      <article
        className={mergeStyles(
          "group rounded-xl overflow-hidden h-full",
          "bg-card transition-all cursor-pointer",
          "hover:shadow-lg hover:-translate-y-0.5",
          `border border-2 border-transparent ${style.hoverSolidBorder}`,
        )}
      >
        <div className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <span
                className={mergeStyles(
                  "w-2 h-2 rounded-full shrink-0",
                  style.bgSolid,
                )}
              />
              <h3 className="font-bold text-md leading-snug">
                {bill.bill_type} {bill.number}/{bill.year}
              </h3>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {bill.reviewed && (
                <span className="text-[11px] text-emerald-400">revisada</span>
              )}
              <span
                className={mergeStyles(
                  "shrink-0 rounded-full px-2 py-0.5 text-[13px] font-medium",
                  style.badge,
                )}
              >
                {style.label}
              </span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground group-hover:text-foreground line-clamp-3 leading-relaxed">
            {bill.ementa}
          </p>
          <div
            className={mergeStyles(
              "flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t",
            )}
          >
            <span>{formatSource(bill.source)}</span>
            <time dateTime={bill.presentation_date || undefined}>
              ({formatDate(bill.presentation_date)})
            </time>
          </div>
          <div
            className={mergeStyles(
              "flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t",
            )}
          >
            {bill.author && (
              <>
                <span className="text-xs text-muted-foreground">
                  <span className="mr-1">{bill.author}</span>
                  {(bill.author_party || bill.author_state) && (
                    <span>
                      (
                      {[bill.author_party, bill.author_state]
                        .filter(Boolean)
                        .join("/")}
                      )
                    </span>
                  )}
                </span>
              </>
            )}
          </div>
          {themes.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-3 border-t">
              {themes.map((name) => (
                <span
                  key={name}
                  className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground"
                >
                  {name}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
