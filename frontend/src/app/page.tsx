"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BillCard } from "@/components/bill-card";
import { StatCard } from "@/components/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { getBills, getStats, type Bill, type StatsResponse } from "@/lib/api";

export default function DashboardPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [recentBills, setRecentBills] = useState<Bill[]>([]);
  const [error, setError] = useState<string | null>(null);

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
        setError(
          err instanceof Error ? err.message : "Erro ao carregar dados"
        );
      }
    }
    load();
  }, []);

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <section className="text-center">
          <h1 className="text-3xl font-bold mb-4">
            Radar Legislativo Ecológico
          </h1>
          <p className="text-muted-foreground mb-4">
            Backend não disponível. Inicie o servidor com{" "}
            <code className="bg-muted px-1 rounded">uvicorn backend.main:app --reload</code>
          </p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </section>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <section className="mb-10">
        <h1 className="text-3xl font-bold mb-2">
          Radar Legislativo Ecológico
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Monitoramento de projetos de lei brasileiros relacionados à crise
          climática. Classificação automática de PLs como favoráveis,
          desfavoráveis ou que requerem revisão humana.
        </p>
      </section>

      <section
        aria-label="Estatísticas"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10"
      >
        {stats ? (
          <>
            <StatCard
              title="Combate à crise"
              value={stats.by_classification.transforming || 0}
              description="PLs que ajudam o clima"
              variant="transforming"
            />
            <StatCard
              title="Requer revisão"
              value={stats.by_classification.needs_review || 0}
              description="PLs ambíguos ou incertos"
              variant="needs_review"
            />
            <StatCard
              title="Agravamento"
              value={stats.by_classification.unfavorable || 0}
              description="PLs que prejudicam o clima"
              variant="unfavorable"
            />
          </>
        ) : (
          <>
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
          </>
        )}
      </section>

      <section aria-label="Projetos recentes">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Projetos de Lei Recentes</h2>
          <Button
            variant="outline"
            render={<Link href="/bills">Ver todos</Link>}
          />
        </div>

        {recentBills.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentBills.map((bill) => (
              <BillCard key={bill.id} bill={bill} />
            ))}
          </div>
        ) : stats ? (
          <p className="text-muted-foreground text-sm">
            Nenhum projeto de lei classificado ainda. Execute o pipeline
            diário para popular o banco.
          </p>
        ) : (
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
