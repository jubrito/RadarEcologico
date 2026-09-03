import { Badge } from "@/components/ui/badge";
import { STYLE_MAP } from "@/lib/style";
import { themeNamesFromIds } from "@/lib/themes";
import type { Classification } from "@/lib/types";
import type { Bill } from "@/lib/api";

export function BillEmenta({
  bill,
  classification,
}: {
  bill: Bill;
  classification: Classification;
}) {
  const style = STYLE_MAP[classification];
  const themes = themeNamesFromIds(bill.theme_ids);

  return (
    <section aria-labelledby="ementa-heading">
      <div className="mb-2 flex items-center gap-3">
        <h2 id="ementa-heading" className="text-xl font-bold">
          Ementa
        </h2>
        <Badge className={style.badge}>{style.label}</Badge>
      </div>

      <div className={`border-l-4 ${style.border} pl-4`}>
        <p className="text-md text-foreground leading-relaxed">{bill.ementa}</p>
      </div>

      {themes.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {themes.map((name) => (
            <span
              key={name}
              className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
            >
              {name}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
