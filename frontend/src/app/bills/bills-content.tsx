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
import { ErrorBanner } from "@/components/error-banner";
import { useNotification } from "@/components/notification-toaster";
import {
  getBills,
  getStats,
  type BillsResponse,
  type StatsResponse,
} from "@/lib/api";
import {
  CLASSIFICATION_LABELS,
  isValidClassification,
} from "@/lib/utils/classifications";
import { SOURCE_LABELS, type KnownClassification } from "@/lib/types";
import { sortedThemeEntries } from "@/lib/themes";
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

const CLASSIFICATION_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "Todas as classificações" },
  ...(Object.keys(CLASSIFICATION_LABELS) as KnownClassification[])
    .map((value) => ({ value, label: CLASSIFICATION_LABELS[value] }))
    .sort((a, b) => a.label.localeCompare(b.label, "pt-BR")),
];

const SOURCE_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "Todas as fontes" },
  ...[
    { value: "camara", label: SOURCE_LABELS.camara },
    { value: "senado", label: SOURCE_LABELS.senado },
  ].sort((a, b) => a.label.localeCompare(b.label, "pt-BR")),
];

const THEME_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "Todos os temas" },
  ...sortedThemeEntries().map(([value, label]) => ({ value, label })),
];

export function BillsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";

  const [data, setData] = useState<BillsResponse | null>(null);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { notify } = useNotification();
  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const page = Number(searchParams.get("page") || "1");
  const classification = searchParams.get("classification") || "all";
  const source = searchParams.get("source") || "all";
  const themeParam = searchParams.get("theme") || "";
  const party = searchParams.get("party") || "all";

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [statsData] = await Promise.all([getStats()]);
        if (!cancelled) setStats(statsData);
      } catch (err) {
        console.error("Erro ao carregar estatísticas:", err);
        notify({
          kind: "error",
          persistence: "temporary",
          message: "As estatísticas não puderam ser carregadas.",
        });
      }

      try {
        const params: Parameters<typeof getBills>[0] = { page, limit: 20 };
        if (classification !== "all" && isValidClassification(classification)) {
          params.classification = classification;
        }
        if (source !== "all") params.source = source;
        if (themeParam) params.theme = themeParam;
        if (party !== "all") params.party = party;
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
  }, [page, classification, source, themeParam, party, search, notify]);

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
  const partyOptions: { value: string; label: string }[] = stats
    ? [
        { value: "all", label: "Todos os partidos" },
        ...Object.keys(stats.by_party)
          .sort()
          .map((p) => ({ value: p, label: p })),
      ]
    : [{ value: "all", label: "Todos os partidos" }];
  const partyOpts = stats
    ? withCounts(partyOptions, stats.by_party)
    : partyOptions;

  return (
    <>
      <section aria-label="Filtros" className="mb-6">
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

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="filter-classification"
              className="text-sm font-medium text-foreground"
            >
              Classificação
            </label>
            <Select
              value={classification}
              onValueChange={(v) => updateParam("classification", v)}
            >
              <SelectTrigger id="filter-classification" className="w-full">
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
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="filter-source"
              className="text-sm font-medium text-foreground"
            >
              Fonte
            </label>
            <Select
              value={source}
              onValueChange={(v) => updateParam("source", v)}
            >
              <SelectTrigger id="filter-source" className="w-full">
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
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="filter-party"
              className="text-sm font-medium text-foreground"
            >
              Partido
            </label>
            <Select
              value={party}
              onValueChange={(v) => updateParam("party", v)}
            >
              <SelectTrigger id="filter-party" className="w-full">
                <SelectValue>
                  {renderLabel(partyOpts, party, "Todos os partidos")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {partyOpts.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="filter-theme"
              className="text-sm font-medium text-foreground"
            >
              Tema
            </label>
            <MultiSelect
              id="filter-theme"
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
              className="w-full"
            />
          </div>
        </div>
      </section>

      {error && <ErrorBanner detail={error} className="mb-4" />}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl bg-foreground/10" />
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
