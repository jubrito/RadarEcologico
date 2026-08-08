"use client";

import { useEffect, useState } from "react";
import { getBill, type Bill } from "@/lib/api";

interface UseBillResult {
  bill: Bill | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to fetch bill details by ID
 * @param id – The ID of the bill to fetch
 * @returns object containing the bill data, loading state, and error message (if any)
 */
export function useBill(id: string): UseBillResult {
  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return { bill, loading, error };
}
