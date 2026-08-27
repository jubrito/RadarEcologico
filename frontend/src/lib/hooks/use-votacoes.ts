"use client";

import { useEffect, useState } from "react";
import { getVotacoes, type VotacaoEvent } from "@/lib/api";

interface UseVotacoesResult {
  votacoes: VotacaoEvent[];
  loading: boolean;
  error: string | null;
}

export function useVotacoes(id: string): UseVotacoesResult {
  const [votacoes, setVotacoes] = useState<VotacaoEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getVotacoes(id);
        if (!cancelled) setVotacoes(data);
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

  return { votacoes, loading, error };
}
