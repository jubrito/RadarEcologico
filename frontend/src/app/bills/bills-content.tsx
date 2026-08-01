"use client";

import { useCallback, useEffect, useState } from "react";
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
import { getBills, type BillsResponse } from "@/lib/api";

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

export function BillsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] = useState<BillsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const page = Number(searchParams.get("page") || "1");
  const classification = searchParams.get("classification") || "all";
  const source = searchParams.get("source") || "all";
  const search = searchParams.get("search") || "";

  const fetchBills = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Parameters<typeof getBills>[0] = { page, limit: 20 };
      if (classification !== "all") params.classification = classification;
      if (source !== "all") params.source = source;
      if (search) params.search = search;
      const result = await getBills(params);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar");
    } finally {
      setLoading(false);
    }
  }, [page, classification, source, search]);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

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

  return (
    <>
      <section className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <label htmlFor="search-bills" className="sr-only">
            Buscar projetos de lei
          </label>
          <Input
            id="search-bills"
            placeholder="Buscar por ementa..."
            defaultValue={search}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateParam("search", (e.target as HTMLInputElement).value);
              }
            }}
          />
        </div>

        <Select
          value={classification}
          onValueChange={(v) => updateParam("classification", v)}
        >
          <SelectTrigger className="w-full sm:w-56" aria-label="Filtrar por classificação">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CLASSIFICATION_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={source}
          onValueChange={(v) => updateParam("source", v)}
        >
          <SelectTrigger className="w-full sm:w-48" aria-label="Filtrar por fonte">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SOURCE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
        <nav aria-label="Paginação" className="flex items-center justify-center gap-2">
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
