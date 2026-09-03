"use client";

import { useEffect, useState, type ReactElement } from "react";
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
import { useNotification } from "@/components/notification-toaster";
import { ErrorBanner } from "@/components/error-banner";

export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);

  useEffect(() => {
    let client: ReturnType<typeof getSupabase> | null = null;
    try {
      client = getSupabase();
    } catch (err) {
      setSetupError(
        err instanceof Error
          ? err.message
          : "Configuração do Supabase ausente.",
      );
      return;
    }
    setConfigured(true);

    let cancelled = false;
    (async () => {
      try {
        const { data } = await client!.auth.getSession();
        if (!cancelled) setSession(data.session);
      } catch (err) {
        console.error("[admin] getSession failed:", err);
        if (!cancelled) {
          setSetupError(
            "Erro ao conectar com o Supabase. Verifique as variáveis de ambiente.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    const { data: sub } = client.auth.onAuthStateChange((_e, s) => {
      if (!cancelled) setSession(s);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (setupError) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <ErrorBanner
          message="A área de revisão não está disponível."
          detail={setupError}
        />
      </div>
    );
  }

  if (!configured) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <p className="text-muted-foreground">
          Supabase não configurado. Defina <code>NEXT_PUBLIC_SUPABASE_URL</code>{" "}
          e <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>.
        </p>
      </div>
    );
  }

  if (loading) return <Skeleton className="h-40 w-full rounded-xl" />;
  return session ? <ReviewDashboard reviewCard={ReviewCard} /> : <LoginForm />;
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
      const draftKey = `review-draft:${bill.source}:${bill.external_id}`;
      const [score, setScore] = useState(review?.reviewer_score ?? 50);
      const [notRelated, setNotRelated] = useState(
        review?.not_related ?? false,
      );
      const [notes, setNotes] = useState(review?.reviewer_notes ?? "");
      const [saving, setSaving] = useState(false);
      const [error, setError] = useState<string | null>(null);

      useEffect(() => {
        if (review) return;
        try {
          const raw = localStorage.getItem(draftKey);
          if (!raw) return;
          const draft = JSON.parse(raw);
          if (typeof draft.score === "number") setScore(draft.score);
          if (typeof draft.notRelated === "boolean")
            setNotRelated(draft.notRelated);
          if (typeof draft.notes === "string") setNotes(draft.notes);
        } catch (err) {
          console.warn(`[admin] corrupted review draft (${draftKey}):`, err);
        }
      }, [draftKey, review]);

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
          try {
            localStorage.removeItem(draftKey);
          } catch (err) {
            console.warn("[admin] could not clear review draft:", err);
          }
          onSaved();
        } catch (err) {
          console.error("[admin] save review failed:", err);
          try {
            localStorage.setItem(
              draftKey,
              JSON.stringify({ score, notRelated, notes }),
            );
          } catch (storageErr) {
            console.warn("[admin] could not persist review draft:", storageErr);
          }
          setError(
            "Não foi possível salvar no Supabase. Sua revisão foi guardada " +
              "localmente e será restaurada ao recarregar a página.",
          );
        } finally {
          setSaving(false);
        }
      }

      return (
        <li className="space-y-3 rounded-xl border border-border bg-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-bold">
                {bill.bill_type} {bill.number}/{bill.year}
              </p>
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {bill.ementa}
              </p>
            </div>
            {review && (
              <span className="shrink-0 text-xs text-emerald-400">
                revisada
              </span>
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
              className="mt-2 w-full"
              aria-label="Potencial risco de agravar a crise climática"
            />
            <span className="text-sm font-bold tabular-nums">{score}%</span>
          </label>

          <div
            className={`rounded-lg border p-3 ${style.border} ${style.fadedBg}`}
          >
            <p className={`text-xs font-bold uppercase ${style.textAccent}`}>
              {style.label}
            </p>
            {phrase && <p className="mt-1 text-sm">{phrase}</p>}
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
              aria-label="Notas"
            />
          </label>

          {error && <ErrorBanner message="Não foi possível salvar a revisão." detail={error} />}
          <Button onClick={save} disabled={saving}>
            {saving ? "Salvando…" : "Salvar revisão"}
          </Button>
        </li>
      );
    }

function LoginForm() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    const client = getSupabase();
    if (mode === "login") {
      const { error } = await client.auth.signInWithPassword({
        email,
        password,
      });
      setLoading(false);
      if (error) setError(error.message);
      return;
    }
    // Route the email confirmation link back to /admin so the auth callback
    // (token/code in the URL) is picked up and the user is logged in automatically.
    const emailRedirectTo = `${window.location.origin}/admin`;
    const { error } = await client.auth.signUp({
      email,
      password,
      options: { emailRedirectTo },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSuccess(
      `Conta criada! Enviamos um link de confirmação para ${email}. ` +
        "Verifique sua caixa de entrada (e o spam) e confirme seu cadastro " +
        "para poder entrar.",
    );
    setMode("login");
    setPassword("");
  }

  return (
    <div className="max-w-6xl h-screen mx-auto px-4 py-8 bg-foreground/2">
      <div className="max-w-lg mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-6">Área de revisão</h1>
        {success && (
          <p
            role="status"
            className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 mb-4"
          >
            {success}
          </p>
        )}
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
          {error && <ErrorBanner message="Não foi possível concluir o acesso." detail={error} />}
          <Button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-5 "
          >
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
    </div>
  );
}

function ReviewDashboard({
  reviewCard: ReviewCardComponent,
}: {
  reviewCard: (props: {
    bill: Bill;
    review?: BillReview;
    onSaved: () => void;
  }) => ReactElement;
}) {
  const { notify } = useNotification();
  const [bills, setBills] = useState<Bill[]>([]);
  const [reviews, setReviews] = useState<Map<string, BillReview>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getBills();
        setBills(data.items);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar dados");
        setLoading(false);
        return;
      }
      try {
        const revs = await fetchReviews();
        setReviews(
          new Map(revs.map((r) => [`${r.source}:${r.external_id}`, r])),
        );
      } catch (err) {
        console.error("[admin] fetchReviews failed:", err);
        setError(
          "Erro ao carregar revisões — verifique se a tabela bill_reviews existe no Supabase.",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const pending = bills.filter((b) => b.classification === "needs_review");

  async function logout() {
    try {
      await getSupabase().auth.signOut();
    } catch (err) {
      console.error("[admin] signOut failed:", err);
      notify({
        kind: "error",
        persistence: "temporary",
        message: "Não foi possível sair da área de revisão. Tente novamente.",
      });
    }
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ErrorBanner
          message="Não foi possível carregar a área de revisão."
          detail={error}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Área de revisão</h1>
        <Button variant="outline" onClick={logout}>
          Sair
        </Button>
      </div>

      <p className="text-muted-foreground mb-6">
        {pending.length} projetos aguardando revisão · {reviews.size} já
        revisados
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
            <ReviewCardComponent
              key={bill.id}
              bill={bill}
              review={reviews.get(`${bill.source}:${bill.external_id}`)}
              onSaved={() => {
                fetchReviews().then((revs) =>
                  setReviews(
                    new Map(
                      revs.map((r) => [`${r.source}:${r.external_id}`, r]),
                    ),
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
