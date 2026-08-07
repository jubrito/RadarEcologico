"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ClassificationBadge } from "@/components/classification-badge";
import { getBill, type Bill } from "@/lib/api";
import { formatDate, formatSource } from "@/lib/utils/utils";
import { CLASSIFICATION } from "@/lib/utils/classifications";
import { STYLE_MAP } from "@/lib/style";
import { RefreshCw, User, Building2, Landmark, Calendar } from "lucide-react";

const LABEL_FOR: Record<string, string> = {
  favorable:
    "Baixo potencial de dano climático — a proposta tende a contribuir para o combate à crise do clima.",
  unfavorable:
    "Alto potencial de dano climático — a proposta tende a intensificar a crise do clima.",
  needs_review:
    "Impacto climático incerto — requer análise humana para determinar o efeito da proposta.",
};

function MetadataRow({
  icon: Icon,
  label,
  children,
  highlight = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex gap-3 p-4 rounded-lg ${
        highlight ? "border border-foreground" : "bg-card"
      }`}
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5 text-muted-foreground" />
      <div>
        <h2 className="font-bold uppercase text-sm">{label}</h2>
        <div className="text-sm mt-0.5">{children}</div>
      </div>
    </div>
  );
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

  const classification = bill?.classification ?? CLASSIFICATION.unknown;
  const style = STYLE_MAP[classification];
  const pct =
    bill?.final_score != null ? Math.round(bill.final_score * 100) : null;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const data = await getBill(id);
        if (!cancelled) setBill(data);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Erro ao carregar");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
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
          {/* Colored top stripe */}
          <div className={`h-1.5 w-full ${style.bgSolid}`} />

          <div className="p-6 sm:p-10 bg-background">
            {/* Header: Title + source link */}
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

            {/* Classification badge + bar */}
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

            {/* Ementa */}
            <section>
              <h2 className="text-xl font-bold mb-2">Ementa</h2>
              <div className={`border-l-2 ${style.border} pl-4`}>
                <p className="text-md text-muted-foreground leading-relaxed">
                  {bill.ementa}
                </p>
              </div>
            </section>

            {/* Analysis box */}
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
                  {LABEL_FOR[bill.classification] ??
                    "Classificação não disponível."}
                </p>
              </div>
            )}

            {/* Metadata */}
            <section className="mt-7 space-y-3">
              {/* Status — always full-width, highlighted */}
              {bill.status && (
                <MetadataRow icon={RefreshCw} label="Status" highlight>
                  {bill.status}
                </MetadataRow>
              )}

              {/* Non-status items — paired in 2-column grid when even */}
              {(() => {
                // Parse author field for embedded party/state: "Sen. Name (PP/RR)"
                const authorMatch = bill.author?.match(
                  /^(.+?)\s*\(([^)]+)\)\s*$/,
                );
                const cleanAuthor = authorMatch
                  ? authorMatch[1].trim()
                  : bill.author;
                const embeddedPartyState = authorMatch
                  ? authorMatch[2].trim()
                  : null;

                const party =
                  bill.author_party ||
                  embeddedPartyState?.split("/")[0]?.trim() ||
                  null;
                const state =
                  bill.author_state ||
                  embeddedPartyState?.split("/")[1]?.trim() ||
                  null;

                const items: Array<{
                  icon: React.ComponentType<{ className?: string }>;
                  label: string;
                  content: string;
                }> = [];

                if (cleanAuthor)
                  items.push({
                    icon: User,
                    label: "Autor:",
                    content: cleanAuthor,
                  });
                if (party || state)
                  items.push({
                    icon: Building2,
                    label: "Partido:",
                    content: [party, state].filter(Boolean).join(" / "),
                  });
                if (bill.presentation_date)
                  items.push({
                    icon: Calendar,
                    label: "Data de apresentação:",
                    content: formatDate(bill.presentation_date),
                  });
                items.push({
                  icon: Landmark,
                  label: "Fonte do projeto:",
                  content: formatSource(bill.source),
                });

                if (items.length === 0) return null;
                if (items.length === 1) {
                  const [item] = items;
                  return (
                    <MetadataRow icon={item.icon} label={item.label}>
                      {item.content}
                    </MetadataRow>
                  );
                }

                const isOdd = items.length % 2 !== 0;
                const pairs = [];
                for (let i = 0; i < items.length - (isOdd ? 1 : 0); i += 2) {
                  pairs.push(items.slice(i, i + 2));
                }

                return (
                  <>
                    {pairs.map(([a, b], i) => (
                      <div
                        key={i}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                      >
                        <MetadataRow icon={a.icon} label={a.label}>
                          {a.content}
                        </MetadataRow>
                        <MetadataRow icon={b.icon} label={b.label}>
                          {b.content}
                        </MetadataRow>
                      </div>
                    ))}
                    {isOdd && (
                      <MetadataRow
                        icon={items[items.length - 1].icon}
                        label={items[items.length - 1].label}
                      >
                        {items[items.length - 1].content}
                      </MetadataRow>
                    )}
                  </>
                );
              })()}
            </section>
          </div>
        </article>
      </div>
    </div>
  );
}
