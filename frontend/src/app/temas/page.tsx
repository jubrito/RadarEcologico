"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { THEME_DESCRIPTIONS, sortedThemeEntries } from "@/lib/themes";
import { getStats, type StatsResponse } from "@/lib/api";
import { useNotification } from "@/components/notification-toaster";

export default function TemasPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const { notify } = useNotification();

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch((error) => {
        console.error("Erro ao carregar contagens dos temas:", error);
        notify({
          kind: "error",
          persistence: "temporary",
          message: "Não foi possível carregar as contagens dos temas.",
        });
      });
  }, [notify]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-5xl font-bold">Temas climáticos</h1>
      <p className="text-foreground/80 my-2 text-xl max-w-4xl">
        Como classificamos os projetos de lei por tema
      </p>
      <p className="text-muted-foreground max-w-3xl mb-8">
        Cada PL é associado a um ou mais temas climáticos. Os temas são uma
        reconciliação entre a taxonomia da Câmara dos Deputados e a
        &ldquo;Classificação Temática Unificada&rdquo; do Senado Federal.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedThemeEntries().map(([id, name]) => (
          <Link
            key={id}
            href={`/bills?theme=${id}`}
            className="group rounded-xl border bg-card p-5 transition-all hover:shadow-lg hover:-translate-y-0.5 border-2 border-transparent hover:border-foreground"
          >
            <div className="mb-2 flex items-start justify-between gap-3">
              <h2 className="font-bold group-hover:text-primary">{name}</h2>
              <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                {stats?.by_theme[id] ?? 0}{" "}
                {stats?.by_theme[id] === 1 ? "projeto" : "projetos"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {THEME_DESCRIPTIONS[id] ?? "Sem descrição."}
            </p>
            <span className="inline-block font-bold text-xs text-muted-foreground mt-3 group-hover:text-foreground group-hover:underline group-hover:underline-offset-5">
              Ver projetos →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
