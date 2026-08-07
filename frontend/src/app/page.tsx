"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BillCard } from "@/components/bill-card";
import { StatCard } from "@/components/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { getBills, getStats, type Bill, type StatsResponse } from "@/lib/api";
import { Header } from "@/components/header";

export default function DashboardPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [recentBills, setRecentBills] = useState<Bill[]>([]);
  const [error, setError] = useState<string | null>(null);
  const showRecentBills = recentBills.length > 0;
  const showEmptyBills = !showRecentBills && stats;
  const showLoadingBills = !showRecentBills && !showEmptyBills;

  useEffect(() => {
    async function load() {
      try {
        const [statsData, billsData] = await Promise.all([
          getStats(),
          getBills({ limit: 6, page: 1 }),
        ]);
        setStats(statsData);
        setRecentBills(billsData.items);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar dados");
      }
    }
    load();
  }, []);

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <section className="text-center">
          <Header size="sm" />
          <p className="text-muted-foreground mb-4 mt-6">
            Backend não disponível. Inicie o servidor com{" "}
            <code className="bg-muted px-1 rounded">
              uvicorn backend.main:app --reload
            </code>
          </p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </section>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Header size="lg" className="mb-10" />

      <section
        aria-label="Estatísticas"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10"
      >
        {stats && (
          <>
            <StatCard
              prefix="PLs potencialmente "
              tema="combatem a crise climática"
              value={stats.by_classification.favorable || 0}
              desc="Ex: preservação ambiental, transição energética, sustentabilidade, proteção dos povos tradicionais."
              variant="favorable"
            />
            <StatCard
              prefix="PLs sem classificação e com "
              tema="revisão humana pendente"
              value={stats.by_classification.needs_review || 0}
              desc="PLs sem informações claras ou suficientes para serem classificadas com precisão por inteligência artificial."
              variant="needs_review"
            />
            <StatCard
              prefix="PLs potencialmente "
              tema="agravam a crise climática"
              value={stats.by_classification.unfavorable || 0}
              desc="Ex: incentivo a combustíveis fósseis, desmatamento, poluição, flexibilização da legislação ambiental."
              variant="unfavorable"
            />
            {/* <StatCard
              prefix="PLs potencialmente responsáveis por "
              tema="combater a crise climática"
              value={stats.by_classification.favorable || 0}
              desc="Ex: preservação ambiental, transição energética, sustentabilidade, proteção dos povos tradicionais."
              variant="favorable"
            />
            <StatCard
              prefix="PLs sem classificação automática e com "
              tema="revisão humana pendente"
              value={stats.by_classification.needs_review || 0}
              desc="PLs sem informações claras ou suficientes para serem classificadas com precisão por inteligência artificial."
              variant="needs_review"
            />
            <StatCard
              prefix="PLs potencialmente responsáveis por "
              tema="agravar a crise climática"
              value={stats.by_classification.unfavorable || 0}
              desc="Ex: incentivo a combustíveis fósseis, desmatamento, poluição, flexibilização da legislação ambiental."
              variant="unfavorable"
            /> */}
          </>
        )}
        {!stats && (
          <>
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
          </>
        )}
      </section>

      <section aria-label="Projetos recentes">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-semibold">Projetos de Lei Recentes</h2>
          <Button
            variant="outline"
            render={<Link href="/bills">Ver todos</Link>}
          />
        </div>

        {showRecentBills && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentBills.map((bill) => (
              <BillCard key={bill.id} bill={bill} />
            ))}
          </div>
        )}
        {showEmptyBills && (
          <p className="text-muted-foreground text-sm">
            Nenhum projeto de lei classificado ainda. Execute o pipeline diário
            para popular o banco.
          </p>
        )}
        {showLoadingBills && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
