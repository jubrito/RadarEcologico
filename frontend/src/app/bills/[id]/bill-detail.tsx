"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ClassificationBadge } from "@/components/classification-badge";
import {
  CLASSIFICATION,
  CLASSIFICATION_DESCRIPTIONS,
} from "@/lib/utils/classifications";
import type { KnownClassification } from "@/lib/types";
import { STYLE_MAP } from "@/lib/style";
import { themeNamesFromIds } from "@/lib/themes";
import { useBill } from "@/lib/hooks/use-bill";
import { useTramitacoes } from "@/lib/hooks/use-tramitacoes";
import { useVotacoes } from "@/lib/hooks/use-votacoes";
import { BillMetadata } from "@/components/bill-metadata/bill-metadata";
import { StatusCallout } from "@/components/status-callout/status-callout";
import { ErrorBanner } from "@/components/error-banner";
import { Timeline } from "@/components/timeline";
import { Votacoes } from "@/components/votacoes";

export function BillDetail({ id }: { id: string }) {
  const { bill, loading, error } = useBill(id);
  const { events, loading: tramitacoesLoading } = useTramitacoes(id);
  const { votacoes, loading: votacoesLoading } = useVotacoes(id);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center space-y-4">
        {error ? (
          <ErrorBanner detail={error} className="mx-auto" />
        ) : (
          <p className="text-muted-foreground">
            Projeto de lei não encontrado.
          </p>
        )}
        <Button
          variant="outline"
          render={<Link href="/bills">Voltar para a lista</Link>}
        />
      </div>
    );
  }

  const classification =
    bill.reviewed && bill.reviewed_classification
      ? bill.reviewed_classification
      : (bill.classification ?? CLASSIFICATION.unknown);
  const style = STYLE_MAP[classification];
  const themes = themeNamesFromIds(bill.theme_ids);
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

        <article
          className={`rounded-xl border ${style.border} overflow-hidden`}
        >
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
                classification={classification}
                score={badgeScore}
                reviewed={bill.reviewed}
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
              <div className={`border-l-4 ${style.border} pl-4`}>
                <p className="text-md text-muted-foreground leading-relaxed">
                  {bill.ementa}
                </p>
              </div>
              {themes.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
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

            {pct != null && (
              <div
                className={`mt-5 rounded-lg ${style.fadedBg} border ${style.border} p-4`}
              >
                <h2
                  className={`text-xs font-bold uppercase tracking-wider ${style.textAccent} mb-2`}
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

            <BillMetadata
              bill={bill}
              statusRow={
                bill.status ? <StatusCallout status={bill.status} /> : null
              }
            />

            {tramitacoesLoading ? (
              <Skeleton className="h-32 w-full rounded-xl mt-7" />
            ) : (
              <Timeline events={events} />
            )}

            {votacoesLoading ? (
              <Skeleton className="h-24 w-full rounded-xl mt-7" />
            ) : (
              <Votacoes votacoes={votacoes} />
            )}
          </div>
        </article>
      </div>
    </div>
  );
}
