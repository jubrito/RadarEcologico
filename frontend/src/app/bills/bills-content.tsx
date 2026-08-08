"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BillCard } from "@/components/bill-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getBills,
  getStats,
  type BillsResponse,
  type StatsResponse,
} from "@/lib/api";
import { isValidClassification } from "@/lib/utils/classifications";
import { MultiSelect } from "@/components/ui/multiselect";

export function withCounts(
  options: { value: string; label: string }[],
  counts: Record<string, number>,
): { value: string; label: string }[] {
  return options.map((opt) => {
    if (opt.value === "all") return opt;
    const count = counts[opt.value] ?? 0;
    return { ...opt, label: `${opt.label} (${count})` };
  });
}

export function renderLabel(
  options: { value: string; label: string }[],
  value: string,
  fallback: string,
) {
  return options.find((o) => o.value === value)?.label || fallback;
}

const CLASSIFICATION_OPTIONS = [
  { value: "all", label: "Todas as classificações" },
  { value: "favorable", label: "Combate à crise" },
  { value: "needs_review", label: "Requer revisão" },
  { value: "unfavorable", label: "Agravamento" },
];

const SOURCE_OPTIONS = [
  { value: "all", label: "Todas as fontes" },
  { value: "camara", label: "Câmara dos Deputados" },
  { value: "senado", label: "Senado Federal" },
];

const THEME_OPTIONS = [
  { value: "all", label: "Todos os temas" },
  { value: "48", label: "Meio Ambiente" },
  { value: "54", label: "Energia, Água e Mineração" },
  { value: "64", label: "Agricultura e Pecuária" },
  { value: "51", label: "Estrutura Fundiária" },
  { value: "61", label: "Transporte e Mobilidade" },
  { value: "44", label: "Direitos Humanos e Minorias" },
  { value: "70", label: "Orçamento Público" },
  { value: "41", label: "Cidades e Des. Urbano" },
  { value: "40", label: "Economia" },
  { value: "55", label: "Relações Internacionais" },
  { value: "56", label: "Saúde" },
  { value: "62", label: "Ciência e Tecnologia" },
  { value: "66", label: "Indústria e Comércio" },
  { value: "68", label: "Direito Constitucional" },
  { value: "76", label: "Direito e Justiça" },
];

export function BillsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";

  const [data, setData] = useState<BillsResponse | null>(null);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const page = Number(searchParams.get("page") || "1");
  const classification = searchParams.get("classification") || "all";
  const source = searchParams.get("source") || "all";
  const themeParam = searchParams.get("theme") || "";

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [statsData] = await Promise.all([getStats()]);
        if (!cancelled) setStats(statsData);
      } catch {
        // stats are optional — don't block the page
      }

      try {
        const params: Parameters<typeof getBills>[0] = { page, limit: 20 };
        if (classification !== "all" && isValidClassification(classification)) {
          params.classification = classification;
        }
        if (source !== "all") params.source = source;
        if (themeParam) params.theme = themeParam;
        if (search) params.search = search;
        const result = await getBills(params);
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Erro ao carregar");
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [page, classification, source, themeParam, search]);

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    if (key !== "page") params.delete("page");
    router.push(`/bills?${params.toString()}`);
  };

  const totalPages = data ? Math.ceil(data.total / data.limit) : 0;

  const classOpts = stats
    ? withCounts(CLASSIFICATION_OPTIONS, stats.by_classification)
    : CLASSIFICATION_OPTIONS;
  const sourceOpts = stats
    ? withCounts(SOURCE_OPTIONS, stats.by_source)
    : SOURCE_OPTIONS;
  const themeOpts = stats
    ? withCounts(THEME_OPTIONS, stats.by_theme)
    : THEME_OPTIONS;

  return (
    <>
      <section className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              updateParam("search", searchInput || null);
            }}
          >
            <label htmlFor="search-bills" className="sr-only">
              Buscar projetos de lei
            </label>
            <Input
              id="search-bills"
              placeholder="Buscar PL (título, ementa, tipo, autor...)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full"
            />
          </form>
        </div>

        <Select
          value={classification}
          onValueChange={(v) => updateParam("classification", v)}
        >
          <SelectTrigger
            className="w-full sm:w-52"
            aria-label="Filtrar por classificação"
          >
            <SelectValue>
              {renderLabel(
                classOpts,
                classification,
                "Todas as classificações",
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {classOpts.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={source} onValueChange={(v) => updateParam("source", v)}>
          <SelectTrigger
            className="w-full sm:w-58"
            aria-label="Filtrar por fonte"
          >
            <SelectValue>
              {renderLabel(sourceOpts, source, "Todas as fontes")}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {sourceOpts.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <MultiSelect
          options={themeOpts}
          selected={themeParam ? themeParam.split(",").filter(Boolean) : []}
          onChange={(vals) => {
            const params = new URLSearchParams(searchParams.toString());
            if (vals.length > 0) {
              params.set("theme", vals.join(","));
            } else {
              params.delete("theme");
            }
            params.delete("page");
            router.push(`/bills?${params.toString()}`);
          }}
          placeholder="Todos os temas"
          className="w-full sm:w-70"
        />
      </section>

      {error && (
        <p role="alert" className="text-red-400 mb-4">
          {error}
        </p>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : data && data.items.length > 0 ? (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            {data.total} projeto{data.total !== 1 ? "s" : ""} encontrado
            {data.total !== 1 ? "s" : ""}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {data.items.map((bill) => (
              <BillCard key={bill.id} bill={bill} />
            ))}
          </div>
        </>
      ) : (
        <p className="text-muted-foreground">Nenhum projeto encontrado.</p>
      )}

      {totalPages > 1 && (
        <nav
          aria-label="Paginação"
          className="flex items-center justify-center gap-2"
        >
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => updateParam("page", String(page - 1))}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground px-3">
            Página {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => updateParam("page", String(page + 1))}
          >
            Próxima
          </Button>
        </nav>
      )}
    </>
  );
}
