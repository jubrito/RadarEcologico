"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CLASSIFICATION } from "@/lib/utils/classifications";
import { STYLE_MAP } from "@/lib/style";
import { useBill } from "@/lib/hooks/use-bill";
import { useTramitacoes } from "@/lib/hooks/use-tramitacoes";
import { useVotacoes } from "@/lib/hooks/use-votacoes";
import { BillMetadata } from "@/components/bill-metadata/bill-metadata";
import { ErrorBanner } from "@/components/error-banner";
import { Timeline } from "@/components/timeline";
import { Votacoes } from "@/components/votacoes";
import { BillHeader } from "@/components/bill-detail/bill-header";
import { BillEmenta } from "@/components/bill-detail/bill-ementa";
import { RiskAnalysis } from "@/components/bill-detail/risk-analysis";

export function BillDetail({ id }: { id: string }) {
  const { bill, loading, error } = useBill(id);
  const {
    events,
    loading: tramitacoesLoading,
    error: tramitacoesError,
  } = useTramitacoes(id);
  const {
    votacoes,
    loading: votacoesLoading,
    error: votacoesError,
  } = useVotacoes(id);

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

          <div className="p-6 sm:p-10 bg-background flex flex-col gap-6">
            <BillHeader bill={bill} />

            <BillEmenta bill={bill} classification={classification} />

            <RiskAnalysis bill={bill} classification={classification} />

            <BillMetadata bill={bill} />

            {tramitacoesLoading && (
              <Skeleton className="h-32 w-full rounded-xl" />
            )}
            {!tramitacoesLoading && (
              <Timeline events={events} tramitacoesError={tramitacoesError} />
            )}

            {votacoesLoading && <Skeleton className="h-32 w-full rounded-xl" />}
            {!votacoesLoading && (
              <Votacoes votacoes={votacoes} votacoesError={votacoesError} />
            )}
          </div>
        </article>
      </div>
    </div>
  );
}
