"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ClassificationBadge } from "@/components/classification-badge";
import { getBill, type Bill } from "@/lib/api";
import { formatDate, formatSource } from "@/lib/utils";
import { STYLE_MAP } from "@/lib/style";

function scoreToClassification(
  score: number,
): "favorable" | "needs_review" | "unfavorable" {
  if (score < 0.3) return "favorable";
  if (score >= 0.6) return "unfavorable";
  return "needs_review";
}

export default function BillDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getBill(id);
        setBill(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    );
  }

  if (error || !bill) {
    return (
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

  return (
    <article className="max-w-3xl mx-auto px-4 py-8">
      <nav aria-label="Breadcrumb" className="mb-6">
        <Link
          href="/bills"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Voltar para a lista
        </Link>
      </nav>

      <header className="mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <h1 className="text-2xl font-bold">
            {bill.bill_type} {bill.number}/{bill.year}
          </h1>
          {bill.classification && (
            <ClassificationBadge
              classification={bill.classification}
              score={bill.final_score}
            />
          )}
        </div>
      </header>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Ementa</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">{bill.ementa}</p>
        </CardContent>
      </Card>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Fonte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{formatSource(bill.source)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Data de apresentação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <time dateTime={bill.presentation_date || undefined}>
              {formatDate(bill.presentation_date)}
            </time>
          </CardContent>
        </Card>

        {bill.author && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Autor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>{bill.author}</p>
              {bill.author_party && (
                <p className="text-xs text-muted-foreground">
                  {bill.author_party}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {bill.status && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>{bill.status}</p>
            </CardContent>
          </Card>
        )}
      </section>

      {bill.final_score != null && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">
              Classificação de Risco Climático
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span className={STYLE_MAP.favorable.textAccent}>
                Favorável ao clima
              </span>
              <span className={STYLE_MAP.unfavorable.textAccent}>
                Prejudicial ao clima
              </span>
            </div>
            <div className="flex items-center gap-4 mb-3">
              <div
                className="flex-1 h-3 rounded-full bg-muted overflow-hidden"
                role="progressbar"
                aria-valuenow={Math.round(bill.final_score * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Risco climático: ${Math.round(bill.final_score * 100)}%`}
              >
                <div
                  className={`h-full rounded-full transition-all ${STYLE_MAP[scoreToClassification(bill.final_score)].bgSolid}`}
                  style={{ width: `${bill.final_score * 100}%` }}
                />
              </div>
              <span className="text-sm font-mono font-bold tabular-nums w-12 text-right">
                {Math.round(bill.final_score * 100)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {bill.classification === "favorable" &&
                "Baixo potencial de dano climático — a proposta tende a contribuir para o combate à crise do clima."}
              {bill.classification === "unfavorable" &&
                "Alto potencial de dano climático — a proposta tende a intensificar a crise do clima."}
              {bill.classification === "needs_review" &&
                "Impacto climático incerto — requer análise humana para determinar o efeito da proposta."}{" "}
              Quanto maior o percentual, maior o risco.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Classificado em {formatDate(bill.classified_at)}
              {bill.keyword_score != null &&
                ` • Análise por palavras-chave: ${(bill.keyword_score * 100).toFixed(0)}%`}
            </p>
          </CardContent>
        </Card>
      )}

      <Button
        variant="outline"
        className="w-full sm:w-auto"
        render={
          <a href={bill.link} target="_blank" rel="noopener noreferrer">
            Ver fonte original
            <span aria-hidden="true" className="ml-1">
              ↗
            </span>
          </a>
        }
      />
    </article>
  );
}
