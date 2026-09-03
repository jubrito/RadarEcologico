import { CLASSIFICATION_DESCRIPTIONS } from "@/lib/utils/classifications";
import type { Classification, KnownClassification } from "@/lib/types";
import { STYLE_MAP } from "@/lib/style";
import { RiskClassificationBadge } from "@/components/classification-badge";
import type { Bill } from "@/lib/api";

export function RiskAnalysis({
  bill,
  classification,
}: {
  classification: Classification;
  bill: Bill;
}) {
  const style = STYLE_MAP[classification];
  const pct =
    bill.reviewed && bill.reviewed_score != null
      ? Math.round(bill.reviewed_score)
      : bill.final_score != null
        ? Math.round(bill.final_score * 100)
        : null;
  const badgeScore =
    bill.reviewed && bill.reviewed_score != null
      ? bill.reviewed_score / 100
      : bill.final_score;

  return (
    <section className={`rounded-lg border p-4 ${style.border} bg-background`}>
      <RiskClassificationBadge
        classification={classification}
        score={badgeScore}
        reviewed={bill.reviewed}
        notRelated={bill.reviewed_not_related ?? false}
      />
      {pct != null && (
        <div aria-hidden="true">
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full ${style.bgSolid}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-1 flex justify-between gap-10 text-sm text-muted-foreground">
            <span>Combate a crise climática</span>
            <span>Nem combate nem intensifica</span>
            <span>Intensifica a crise climática</span>
          </div>
        </div>
      )}

      {pct != null && (
        <div
          className={`mt-5 rounded-lg border p-4 ${style.fadedBg} ${style.border}`}
        >
          <h2
            className={`mb-2 text-xs font-bold uppercase tracking-wider ${style.textAccent}`}
          >
            Análise de risco e impacto ecológico da proposta
          </h2>
          <p className="text-sm leading-relaxed">
            {CLASSIFICATION_DESCRIPTIONS[
              classification as KnownClassification
            ] ?? "Classificação não disponível."}
          </p>
        </div>
      )}
    </section>
  );
}
