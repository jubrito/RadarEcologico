"use client";

import { useEffect, useState } from "react";
import { getTramitacoes, type TramitacaoEvent } from "@/lib/api";

interface UseTramitacoesResult {
  events: TramitacaoEvent[];
  loading: boolean;
  error: string | null;
}

export function useTramitacoes(id: string): UseTramitacoesResult {
  const [events, setEvents] = useState<TramitacaoEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getTramitacoes(id);
        if (!cancelled) setEvents(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Erro ao carregar");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { events, loading, error };
}
