"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase";
import { getBills, type Bill } from "@/lib/api";
import {
  classifyFromReviewScore,
  fetchReviews,
  upsertReview,
  type BillReview,
} from "@/lib/reviews";
import { getClassificationPhrase } from "@/lib/utils/classifications";
import { STYLE_MAP } from "@/lib/style";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [configured, setConfigured] = useState(false);

  useEffect(() => {
    let client: ReturnType<typeof getSupabase> | null = null;
    try {
      client = getSupabase();
    } catch {
      return;
    }
    setConfigured(true);

    client.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = client.auth.onAuthStateChange((_e, s) =>
      setSession(s),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!configured) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <p className="text-muted-foreground">
          Supabase não configurado. Defina{" "}
          <code>NEXT_PUBLIC_SUPABASE_URL</code> e{" "}
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
        </p>
      </div>
    );
  }

  if (session === null) return <Skeleton className="h-40 w-full rounded-xl" />;
  return session ? <ReviewDashboard /> : <LoginForm />;
}

function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const client = getSupabase();
    const fn =
      mode === "login"
        ? client.auth.signInWithPassword
        : client.auth.signUp;
    const { error } = await fn({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else if (mode === "register") {
      router.refresh();
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-6">Área de revisão</h1>
      <form onSubmit={submit} className="space-y-4">
        <label className="block">
          <span className="text-sm text-muted-foreground">Email</span>
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1"
          />
        </label>
        <label className="block">
          <span className="text-sm text-muted-foreground">Senha</span>
          <Input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1"
          />
        </label>
        {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {mode === "login" ? "Entrar" : "Criar conta"}
        </Button>
      </form>
      <p className="text-sm text-muted-foreground mt-4 text-center">
        {mode === "login" ? "Ainda não tem conta?" : "Já tem conta?"}{" "}
        <button
          className="underline underline-offset-2"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
        >
          {mode === "login" ? "Criar conta" : "Entrar"}
        </button>
      </p>
    </div>
  );
}

function ReviewDashboard() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [reviews, setReviews] = useState<Map<string, BillReview>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [data, revs] = await Promise.all([getBills(), fetchReviews()]);
        setBills(data.items);
        setReviews(
          new Map(revs.map((r) => [`${r.source}:${r.external_id}`, r])),
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const pending = bills.filter((b) => b.classification === "needs_review");

  async function logout() {
    await getSupabase().auth.signOut();
  }

  if (error) return <p role="alert" className="text-red-400">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Área de revisão</h1>
        <Button variant="outline" onClick={logout}>
          Sair
        </Button>
      </div>

      <p className="text-muted-foreground mb-6">
        {pending.length} projetos aguardando revisão ·{" "}
        {reviews.size} já revisados
      </p>

      {loading ? (
        <Skeleton className="h-40 w-full rounded-xl" />
      ) : pending.length === 0 ? (
        <p className="text-muted-foreground">
          Nenhum projeto aguardando revisão.
        </p>
      ) : (
        <ul className="space-y-4">
          {pending.map((bill) => (
            <ReviewCard
              key={bill.id}
              bill={bill}
              review={reviews.get(`${bill.source}:${bill.external_id}`)}
              onSaved={() => {
                fetchReviews().then((revs) =>
                  setReviews(
                    new Map(revs.map((r) => [`${r.source}:${r.external_id}`, r])),
                  ),
                );
              }}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function ReviewCard({
  bill,
  review,
  onSaved,
}: {
  bill: Bill;
  review?: BillReview;
  onSaved: () => void;
}) {
  const [score, setScore] = useState(review?.reviewer_score ?? 50);
  const [notRelated, setNotRelated] = useState(review?.not_related ?? false);
  const [notes, setNotes] = useState(review?.reviewer_notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const classification = classifyFromReviewScore(score, notRelated);
  const style = STYLE_MAP[classification];
  const phrase = getClassificationPhrase(classification, score / 100);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const {
        data: { user },
      } = await getSupabase().auth.getUser();
      await upsertReview({
        source: bill.source,
        external_id: bill.external_id,
        reviewed_by: user?.email ?? "unknown",
        reviewer_score: score,
        reviewer_classification: classification,
        reviewer_notes: notes || null,
        not_related: notRelated,
      });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <li className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-bold">
            {bill.bill_type} {bill.number}/{bill.year}
          </p>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {bill.ementa}
          </p>
        </div>
        {review && (
          <span className="text-xs text-emerald-400 shrink-0">revisada</span>
        )}
      </div>

      <label className="block">
        <span className="text-sm text-muted-foreground">
          Potencial risco de agravar a crise climática
        </span>
        <input
          type="range"
          min={0}
          max={100}
          value={score}
          onChange={(e) => setScore(Number(e.target.value))}
          className="w-full mt-2"
          aria-label="Potencial risco de agravar a crise climática"
        />
        <span className="text-sm font-bold tabular-nums">{score}%</span>
      </label>

      <div className={`rounded-lg p-3 border ${style.border} ${style.fadedBg}`}>
        <p className={`text-xs font-bold uppercase ${style.textAccent}`}>
          {style.label}
        </p>
        {phrase && <p className="text-sm mt-1">{phrase}</p>}
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={notRelated}
          onChange={(e) => setNotRelated(e.target.checked)}
        />
        Não se relaciona com questões climáticas (neutral)
      </label>

      <label className="block">
        <span className="text-sm text-muted-foreground">Notas</span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-md border border-border bg-background p-2 text-sm"
        />
      </label>

      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
      <Button onClick={save} disabled={saving}>
        {saving ? "Salvando…" : "Salvar revisão"}
      </Button>
    </li>
  );
}
