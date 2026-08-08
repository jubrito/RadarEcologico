"use client";

import { use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ClassificationBadge } from "@/components/classification-badge";
import { CLASSIFICATION, CLASSIFICATION_DESCRIPTIONS } from "@/lib/utils/classifications";
import { STYLE_MAP } from "@/lib/style";
import { useBill } from "@/lib/hooks/use-bill";
import { RefreshCw } from "lucide-react";
import { BillMetadata } from "@/components/bill-metadata/bill-metadata";

export default function BillDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { bill, loading, error } = useBill(id);

  if (loading || !bill) {
    return loading ? (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    ) : (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground mb-4">
          {error || "Projeto de lei não encontrado."}
        </p>
        <Button
          variant="outline"
          render={<Link href="/bills">Voltar para a lista</Link>}
        />
      </div>
    );
  }

  const classification = bill.classification ?? CLASSIFICATION.unknown;
  const style = STYLE_MAP[classification];
  const pct = bill.final_score != null ? Math.round(bill.final_score * 100) : null;

  return (
    <div className={`max-w-6xl mx-auto px-4 py-8 ${style.fadedBg}`}>
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <nav aria-label="Breadcrumb" className="mb-6">
          <Link
            href="/bills"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Voltar para a lista
          </Link>
        </nav>

        <article className={`rounded-xl border ${style.border} overflow-hidden`}>
          <div className={`h-1.5 w-full ${style.bgSolid}`} />

          <div className="p-6 sm:p-10 bg-background">
            <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
              <h1 className="text-2xl font-bold">
                {bill.bill_type} {bill.number}/{bill.year}
              </h1>
              <Button
                variant="outline"
                size="sm"
                className="flex-shrink-0"
                render={
                  <a href={bill.link} target="_blank" rel="noopener noreferrer">
                    Ver fonte original ↗
                  </a>
                }
              />
            </header>

            <div className="mb-6">
              <ClassificationBadge
                classification={bill.classification}
                score={bill.final_score}
              />
              {pct != null && (
                <div aria-hidden="true">
                  <div className="h-2 rounded-full bg-muted overflow-hidden mt-5">
                    <div
                      className={`h-full rounded-full ${style.bgSolid}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>Favorável</span>
                    <span>Prejudicial</span>
                  </div>
                </div>
              )}
            </div>

            <section>
              <h2 className="text-xl font-bold mb-2">Ementa</h2>
              <div className={`border-l-2 ${style.border} pl-4`}>
                <p className="text-md text-muted-foreground leading-relaxed">
                  {bill.ementa}
                </p>
              </div>
            </section>

            {pct != null && (
              <div
                className={`mt-5 rounded-lg ${style.fadedBg} border ${style.border} p-4`}
              >
                <h2 className={`text-xs font-bold uppercase tracking-wider ${style.textAccent} mb-2`}>
                  Análise de risco e impacto ecológico da proposta
                </h2>
                <p className="text-sm leading-relaxed">
                  {CLASSIFICATION_DESCRIPTIONS[bill.classification] ??
                    "Classificação não disponível."}
                </p>
              </div>
            )}

            <BillMetadata
              bill={bill}
              statusRow={
                bill.status && (
                  <div className="flex gap-3 p-4 rounded-lg border border-foreground">
                    <RefreshCw className="w-5 h-5 flex-shrink-0 mt-0.5 text-muted-foreground" />
                    <div>
                      <h2 className="font-bold uppercase text-sm">Status</h2>
                      <div className="text-sm mt-0.5">{bill.status}</div>
                    </div>
                  </div>
                )
              }
            />
          </div>
        </article>
      </div>
    </div>
  );
}
