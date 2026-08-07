"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import SyncIcon from "@mui/icons-material/Sync";
import SourceIcon from "@mui/icons-material/Source";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import HowToVoteIcon from "@mui/icons-material/HowToVote";
import PersonIcon from "@mui/icons-material/Person";

// ── Hardcoded sample bills (one of each classification) ──

type Classification = "favorable" | "needs_review" | "unfavorable";

interface BillData {
  id: string;
  external_id: string;
  source: string;
  bill_type: string;
  number: number;
  year: number;
  ementa: string;
  author: string;
  author_party: string;
  author_state: string;
  presentation_date: string;
  status: string;
  link: string;
  keyword_score: number;
  bert_score: null;
  final_score: number;
  classification: Classification;
  classified_at: string;
}

const FAVORABLE = {
  id: "sample-1",
  external_id: "PL-1234-2024",
  source: "camara",
  bill_type: "PL",
  number: 1234,
  year: 2024,
  ementa:
    "Institui a Política Nacional de Pagamento por Serviços Ambientais e cria o Fundo Federal de PSA para remunerar produtores rurais que conservam vegetação nativa.",
  author: "Deputado João Silva",
  author_party: "PT",
  author_state: "SP",
  presentation_date: "2024-03-15",
  status: "Em tramitação na Comissão de Meio Ambiente",
  link: "#",
  keyword_score: 0.12,
  bert_score: null,
  final_score: 0.12,
  classification: "favorable",
  classified_at: "2025-01-10",
} as const satisfies BillData;

const NEEDS_REVIEW = {
  id: "sample-2",
  external_id: "PLP-567-2024",
  source: "senado",
  bill_type: "PLP",
  number: 567,
  year: 2024,
  ementa:
    "Altera a Lei de Licitações para prever critérios de sustentabilidade nas contratações públicas, estabelecendo percentuais mínimos de energia renovável e eficiência energética.",
  author: "Sen. Maria Oliveira",
  author_party: "PSB",
  author_state: "BA",
  presentation_date: "2024-06-20",
  status: "Aguardando parecer do relator",
  link: "#",
  keyword_score: 0.45,
  bert_score: null,
  final_score: 0.45,
  classification: "needs_review",
  classified_at: "2025-01-10",
} as const satisfies BillData;

const UNFAVORABLE = {
  id: "sample-3",
  external_id: "PL-8901-2024",
  source: "camara",
  bill_type: "PL",
  number: 8901,
  year: 2024,
  ementa:
    "Flexibiliza os limites de supressão de vegetação nativa em áreas de preservação permanente para empreendimentos de infraestrutura energética, dispensando EIA/RIMA para projetos considerados estratégicos.",
  author: "Dep. Carlos Santos",
  author_party: "PL",
  author_state: "MT",
  presentation_date: "2024-09-05",
  status: "Pronto para pauta no Plenário",
  link: "#",
  keyword_score: 0.88,
  bert_score: null,
  final_score: 0.88,
  classification: "unfavorable",
  classified_at: "2025-01-10",
} as const satisfies BillData;

// ── Style maps ──

const STYLES = {
  favorable: {
    gradient: "from-emerald-500/20 via-emerald-500/5 to-transparent",
    pill: "bg-emerald-600/20 text-emerald-400 border-emerald-500/30",
    bar: "bg-emerald-500",
    accent: "text-emerald-400",
    border: "border-emerald-500/30",
    bg: "bg-emerald-950/30",
    label: "Potencialmente combate a catástrofe climática",
  },
  needs_review: {
    gradient: "from-amber-500/20 via-amber-500/5 to-transparent",
    pill: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    bar: "bg-amber-500",
    accent: "text-amber-400",
    border: "border-amber-500/30",
    bg: "bg-amber-950/30",
    label: "Requer revisão humana para ser categorizada",
  },
  unfavorable: {
    gradient: "from-red-500/20 via-red-500/5 to-transparent",
    pill: "bg-red-600/20 text-red-400 border-red-500/30",
    bar: "bg-red-500",
    accent: "text-red-400",
    border: "border-red-500/30",
    bg: "bg-red-950/30",
    label: "Potencialmente agrava a catástrofe climática",
  },
} as const;

// ── Reusable bits ──

function Badge({
  classification,
  size = "text-sm",
}: {
  classification: Classification;
  size?: "text-sm" | "text-md" | "text-lg" | "text-xl";
}) {
  const s = STYLES[classification];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${size} font-medium border ${s.pill}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.bar}`} />
      {s.label}
    </span>
  );
}

function ScoreBar({
  score,
  classification,
}: {
  score: number;
  classification: Classification;
}) {
  const s = STYLES[classification];
  return (
    <div>
      <div className="flex justify-between text-xs text-muted-foreground mb-1">
        <span className={STYLES.favorable.accent}>0% — Favorável</span>
        <span className={STYLES.unfavorable.accent}>100% — Prejudicial</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${s.bar}`}
            style={{ width: `${score * 100}%` }}
          />
        </div>
        <span className="text-sm font-mono font-bold tabular-nums w-12 text-right">
          {Math.round(score * 100)}%
        </span>
      </div>
    </div>
  );
}

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR");
}

function labelFor(c: Classification) {
  if (c === "favorable")
    return "Baixo potencial de dano climático — a proposta tende a contribuir para o combate à crise do clima.";
  if (c === "unfavorable")
    return "Alto potencial de dano climático — a proposta tende a intensificar a crise do clima.";
  return "Impacto climático incerto — requer análise humana para determinar o efeito da proposta.";
}

// ═══════════════════════════════════════════════════════════════
//  VARIANT 1 — Gradient Hero
// ═══════════════════════════════════════════════════════════════

function Variant1({ bill }: { bill: BillData }) {
  const s = STYLES[bill.classification];
  return (
    <article>
      {/* Gradient header */}
      <header
        className={`rounded-xl bg-gradient-to-b ${s.gradient} border ${s.border} p-6 mb-5`}
      >
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <Badge classification={bill.classification} size="text-md" />
            <h2 className="text-xl font-bold mt-3">
              {bill.bill_type} {bill.number}/{bill.year}
            </h2>
          </div>
          <span className={`text-3xl font-mono font-bold ${s.accent}`}>
            {Math.round(bill.final_score! * 100)}%
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-3 leading-relaxed line-clamp-3">
          {bill.ementa}
        </p>
      </header>

      {/* Metadata grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          ["Fonte", bill.source === "camara" ? "Câmara" : "Senado"],
          ["Data", formatDate(bill.presentation_date)],
          ["Autor", bill.author],
          ["Status", bill.status],
        ].map(([label, value]) => (
          <div
            key={label}
            className={`rounded-lg border ${s.border} ${s.bg} px-3 py-2.5`}
          >
            <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {label}
            </dt>
            <dd className="text-sm font-medium mt-0.5 truncate">{value}</dd>
          </div>
        ))}
      </div>

      {/* Score section */}
      <section className={`rounded-xl border ${s.border} p-5`}>
        <h3 className={`text-sm font-semibold ${s.accent} mb-3`}>
          Risco Climático
        </h3>
        <ScoreBar
          score={bill.final_score!}
          classification={bill.classification}
        />
        <p className="text-xs text-muted-foreground mt-3">
          {labelFor(bill.classification)}
        </p>
      </section>
    </article>
  );
}

// ═══════════════════════════════════════════════════════════════
//  VARIANT 2 — Vibrant Accents
// ═══════════════════════════════════════════════════════════════

function Variant2({ bill }: { bill: BillData }) {
  const s = STYLES[bill.classification];
  return (
    <article className="flex flex-col gap-5">
      {/* Title row with big colored number */}
      <header className="flex items-start justify-between gap-4">
        <div>
          <Badge classification={bill.classification} />
          <h2 className="text-xl font-bold mt-2">
            {bill.bill_type} {bill.number}/{bill.year}
          </h2>
        </div>
        {/* Big score circle */}
        <div
          className={`flex-shrink-0 w-16 h-16 rounded-full border-2 ${s.border} ${s.bg} flex items-center justify-center`}
        >
          <span className={`text-lg font-mono font-bold ${s.accent}`}>
            {Math.round(bill.final_score! * 100)}
          </span>
        </div>
      </header>

      {/* Ementa with colored left border */}
      <div className={`border-l-2 ${s.border} pl-4`}>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {bill.ementa}
        </p>
      </div>

      {/* Metadata as colored pills/badges */}
      <div className="flex flex-wrap gap-2">
        {bill.author && (
          <span
            className={`text-xs px-2.5 py-1 rounded-full ${s.bg} ${s.accent} border ${s.border}`}
          >
            {bill.author} {bill.author_party && `(${bill.author_party})`}
          </span>
        )}
        <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
          {bill.source === "camara" ? "Câmara" : "Senado"}
        </span>
        <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
          {formatDate(bill.presentation_date)}
        </span>
        {bill.status && (
          <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground truncate max-w-[200px]">
            {bill.status}
          </span>
        )}
      </div>

      {/* Score section — horizontal colored divider */}
      <section>
        <div className={`h-px w-full ${s.bar} mb-4`} />
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <h3
              className={`text-xs font-semibold ${s.accent} mb-2 uppercase tracking-wide`}
            >
              Risco Climático
            </h3>
            <ScoreBar
              score={bill.final_score!}
              classification={bill.classification}
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          {labelFor(bill.classification)}
        </p>
      </section>
    </article>
  );
}

// ═══════════════════════════════════════════════════════════════
//  VARIANT 3 — Immersive Color Blocks
// ═══════════════════════════════════════════════════════════════

function Variant3({ bill }: { bill: BillData }) {
  const s = STYLES[bill.classification];
  return (
    <article>
      {/* Top: dark ementa section */}
      <Badge classification={bill.classification} />
      <h1 className="text-2xl font-bold mt-4">
        {bill.bill_type} {bill.number}/{bill.year}
      </h1>
      <section className="rounded-xl bg-card border border-border px-5 my-4">
        {/* Header from V2 */}
        <header className="flex items-start justify-between gap-4 mb-5">
          <h2 className="text-xl font-bold mt-4">Ementa</h2>
        </header>

        {/* Ementa with colored left border (V2) */}
        <div className={`border-l-2 ${s.border} pl-4 mb-5`}>
          <p className="text-md text-muted-foreground leading-relaxed">
            {bill.ementa}
          </p>
        </div>

        {/* Metadata — colored chips (V2 style) */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span
            className={`text-xs px-2.5 py-1 rounded-full ${s.bg} ${s.accent} border ${s.border}`}
          >
            {bill.author} {bill.author_party && `(${bill.author_party})`}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
            {bill.source === "camara"
              ? "Câmara dos Deputados"
              : "Senado Federal"}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
            {formatDate(bill.presentation_date)}
          </span>
        </div>
      </section>

      {/* Score — full colored block */}
      <section className={`rounded-xl ${s.bg} border ${s.border} p-6 mb-4`}>
        <h2 className={`text-lg font-bold mb-3 tracking-wider ${s.accent}`}>
          Classificação de Risco Climático
        </h2>
        {/* <p
          className={`text-xs uppercase tracking-wider font-semibold ${s.accent} mb-4`}
        >
          Classificação de Risco Climático
        </p> */}

        <div className="flex items-end gap-6">
          <div>
            <span className={`text-4xl font-mono font-bold ${s.accent}`}>
              {Math.round(bill.final_score! * 100)}
            </span>
            <span className={`text-lg ${s.accent}`}>%</span>
          </div>
          <div className="flex-1 pb-1">
            <div className="h-2 rounded-full bg-black/30 overflow-hidden">
              <div
                className={`h-full rounded-full ${s.bar}`}
                style={{ width: `${bill.final_score! * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-sm font-semibold text-muted-foreground mt-1">
              <span>Favorável</span>
              <span>Prejudicial</span>
            </div>
          </div>
        </div>
        <p className="text-md text-muted-foreground mt-3 leading-relaxed">
          {labelFor(bill.classification)}
        </p>
      </section>

      {/* Metadata cards row */}
      <div className="grid grid-cols-2 gap-3">
        {bill.status && (
          <div className="rounded-lg bg-card border border-border p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              Status
            </p>
            <p className="text-sm">{bill.status}</p>
          </div>
        )}
        <div className="rounded-lg bg-card border border-border p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            Classificado em
          </p>
          <p className="text-sm">{formatDate(bill.classified_at)}</p>
        </div>
      </div>
      <Button
        variant="outline"
        className="w-full sm:w-auto mt-4"
        render={
          <a href={bill.link} target="_blank" rel="noopener noreferrer">
            Ver fonte original
            <span aria-hidden="true" className="ml-1">
              ↗
            </span>
          </a>
        }
      />
    </article>
  );
}

// ═══════════════════════════════════════════════════════════════
//  VARIANT 4 — V2 Header + V3 Score Block (simple metadata)
// ═══════════════════════════════════════════════════════════════

function Variant4({ bill }: { bill: BillData }) {
  const s = STYLES[bill.classification];
  return (
    <article>
      {/* Header from V2 */}
      <header className="flex items-start justify-between gap-4 mb-5">
        <div>
          <Badge classification={bill.classification} />
          <h2 className="text-xl font-bold mt-4">
            {bill.bill_type} {bill.number}/{bill.year}
          </h2>
        </div>
        {/* <div
          className={`flex-shrink-0 w-16 h-16 rounded-full border-2 ${s.border} ${s.bg} flex items-center justify-center`}
        >
          <span className={`text-lg font-mono font-bold ${s.accent}`}>
            {Math.round(bill.final_score! * 100)}%
          </span>
        </div> */}
      </header>

      {/* Ementa with colored left border (V2) */}
      <div className={`border-l-2 ${s.border} pl-4 mb-5`}>
        <p className="text-md text-muted-foreground leading-relaxed">
          {bill.ementa}
        </p>
      </div>

      {/* Metadata — colored chips (V2 style) */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span
          className={`text-xs px-2.5 py-1 rounded-full ${s.bg} ${s.accent} border ${s.border}`}
        >
          {bill.author} {bill.author_party && `(${bill.author_party})`}
        </span>
        <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
          {bill.source === "camara" ? "Câmara dos Deputados" : "Senado Federal"}
        </span>
        <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
          {formatDate(bill.presentation_date)}
        </span>
      </div>

      {/* Status — full row card (V3 style) */}
      {bill.status && (
        <div className="rounded-lg bg-card border border-border p-3 mb-5">
          <p className="text-sm uppercase tracking-wider mb-2 font-bold">
            Status
          </p>
          <p className="text-md">{bill.status}</p>
        </div>
      )}

      {/* Score from V3 — full colored block */}
      <section className={`rounded-xl ${s.bg} border ${s.border} p-6`}>
        <p
          className={`text-xs uppercase tracking-wider font-semibold ${s.accent} mb-4`}
        >
          Análise de Risco Climático
        </p>
        <div className="flex items-end gap-6">
          <div>
            <span className={`text-4xl font-mono font-bold ${s.accent}`}>
              {Math.round(bill.final_score! * 100)}
            </span>
            <span className={`text-lg ${s.accent}`}>%</span>
          </div>
          <div className="flex-1 pb-1">
            <div className="h-2 rounded-full bg-black/30 overflow-hidden">
              <div
                className={`h-full rounded-full ${s.bar}`}
                style={{ width: `${bill.final_score! * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-sm font-semibold text-muted-foreground mt-1">
              <span>Favorável</span>
              <span>Prejudicial</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
          {labelFor(bill.classification)}
        </p>
      </section>
    </article>
  );
}

// ═══════════════════════════════════════════════════════════════
//  VARIANT 5 — V4 base + Metadata as compact icon-cards
// ═══════════════════════════════════════════════════════════════

function Variant5({ bill }: { bill: BillData }) {
  const s = STYLES[bill.classification];
  return (
    <article>
      {/* Top: dark ementa section */}
      <Badge classification={bill.classification} />
      <section className="rounded-xl bg-card border border-border p-5 my-4">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-lg font-bold">
            {bill.bill_type} {bill.number}/{bill.year}
          </h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {bill.ementa}
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          <span className="text-xs text-muted-foreground">
            {bill.source === "camara"
              ? "Câmara dos Deputados"
              : "Senado Federal"}
          </span>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground">
            {formatDate(bill.presentation_date)}
          </span>
          {bill.author && (
            <>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">
                {bill.author} {bill.author_party && `(${bill.author_party})`}
              </span>
            </>
          )}
        </div>
      </section>

      {/* Score — full colored block */}
      <section className={`rounded-xl ${s.bg} border ${s.border} p-6 mb-4`}>
        <p
          className={`text-xs uppercase tracking-wider font-semibold ${s.accent} mb-4`}
        >
          Análise de Risco Climático
        </p>
        <div className="flex items-end gap-6">
          <div>
            <span className={`text-4xl font-mono font-bold ${s.accent}`}>
              {Math.round(bill.final_score! * 100)}
            </span>
            <span className={`text-lg ${s.accent}`}>%</span>
          </div>
          <div className="flex-1 pb-1">
            <div className="h-2 rounded-full bg-black/30 overflow-hidden">
              <div
                className={`h-full rounded-full ${s.bar}`}
                style={{ width: `${bill.final_score! * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>Favorável</span>
              <span>Prejudicial</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
          {labelFor(bill.classification)}
        </p>
      </section>

      {/* Metadata cards row */}
      <div className="grid grid-cols-2 gap-3">
        {bill.status && (
          <div className="rounded-lg bg-card border border-border p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              Status
            </p>
            <p className="text-sm">{bill.status}</p>
          </div>
        )}
        <div className="rounded-lg bg-card border border-border p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            Classificado em
          </p>
          <p className="text-sm">{formatDate(bill.classified_at)}</p>
        </div>
      </div>
    </article>
  );
}

// ═══════════════════════════════════════════════════════════════
//  VARIANT 0 — V4 base + Metadata as horizontal stat row
// ═══════════════════════════════════════════════════════════════

function Variant0({ bill }: { bill: BillData }) {
  const s = STYLES[bill.classification];
  const pct = Math.round(bill.final_score! * 100);

  return (
    <article
      className={`rounded-xl border ${s.border} overflow-hidden hover:shadow-lg transition-shadow`}
    >
      <div className={`h-1.5 w-full ${s.bar}`} />

      <div className="p-10">
        {/* Top: dark ementa section */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {bill.bill_type} {bill.number}/{bill.year}
          </h1>
          {/* <Badge classification={bill.classification} /> */}
        </div>

        {/* Classification bar */}
        <div className="mb-5">
          <Badge classification={bill.classification} size="text-md" />
          <div aria-hidden="true">
            <div className="h-2 rounded-full bg-muted overflow-hidden mt-5">
              <div
                className={`h-full rounded-full ${s.bar}`}
                style={{ width: `${pct}%` }}
                aria-hidden="true"
              />
            </div>
            <div className="flex justify-between text-sm text-muted-foreground mt-1">
              <span>Favorável</span>
              <span>Prejudicial</span>
            </div>
          </div>
        </div>

        <section className="my-6">
          {/* Header from V2 */}
          <h2 className="text-xl font-bold mt-4 mb-2">Ementa</h2>

          {/* Ementa with colored left border (V2) */}
          <div className={`border-l-2 ${s.border} pl-4 mb-5`}>
            <p className="text-md text-muted-foreground leading-relaxed">
              {bill.ementa}
            </p>
          </div>

          <div className={`mt-5 rounded-lg ${s.bg} border ${s.border} p-4`}>
            <h2
              className={`text-xs font-bold uppercase tracking-wider ${s.accent} mb-2`}
            >
              Análise de risco e impacto ecológico da proposta
            </h2>
            <p className="text-sm leading-relaxed">
              {labelFor(bill.classification)}
            </p>
          </div>
        </section>

        {/* STATUS */}
        {bill.status && (
          <div className="rounded-lg flex items-center gap-2 flex-rounded-lg bg-card border border-border p-3">
            {/* <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            Status
            </p> */}
            <h2 className="font-bold uppercase">Status:</h2>
            <p className="">{bill.status}</p>
          </div>
        )}

        {/* Metadata — colored chips (V2 style) */}
        <div className="flex flex-wrap gap-2 my-4">
          <span
            className={`flex gap-2 text-sm px-2.5 py-1 rounded-full border-foreground border ${s.border}`}
          >
            <h2 className="font-bold uppercase">Autor:</h2>
            <span className="">{bill.author}</span>
          </span>
          {/* <span
            className={`text-sm px-2.5 py-1 rounded-full border-foreground border ${s.border}`}
          >
            {bill.author} {bill.author_party && `(${bill.author_party})`}
          </span> */}
          <span className="text-sm px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
            {bill.source === "camara"
              ? "Câmara dos Deputados"
              : "Senado Federal"}
          </span>
          <span className="text-sm px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
            {formatDate(bill.presentation_date)}
          </span>
        </div>

        <Button
          variant="outline"
          className="w-full sm:w-auto mt-4"
          render={
            <a href={bill.link} target="_blank" rel="noopener noreferrer">
              Ver fonte original
              <span aria-hidden="true" className="ml-1">
                ↗
              </span>
            </a>
          }
        />
      </div>
    </article>
  );
}

// ═══════════════════════════════════════════════════════════════
//  VARIANT 7 — Compact Card (dashboard-style)
// ═══════════════════════════════════════════════════════════════

function Variant7({ bill }: { bill: BillData }) {
  const s = STYLES[bill.classification];
  return (
    <article
      className={`rounded-xl border ${s.border} overflow-hidden hover:shadow-lg transition-shadow`}
    >
      {/* Colored top stripe */}
      <div className={`h-1.5 w-full ${s.bar}`} />
      <div className="p-5">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <Badge classification={bill.classification} />
            <h3 className="text-sm font-bold truncate">
              {bill.bill_type} {bill.number}/{bill.year}
            </h3>
          </div>
          <span
            className={`text-lg font-mono font-bold flex-shrink-0 ${s.accent}`}
          >
            {Math.round(bill.final_score! * 100)}%
          </span>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed mb-3">
          {bill.ementa}
        </p>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span>
            {bill.author} ({bill.author_party}/{bill.author_state})
          </span>
          <span>·</span>
          <span>{formatDate(bill.presentation_date)}</span>
        </div>
      </div>
    </article>
  );
}

// ═══════════════════════════════════════════════════════════════
//  VARIANT 8 — Dark Emphasis (magazine/editorial)
// ═══════════════════════════════════════════════════════════════

function Variant8({ bill }: { bill: BillData }) {
  const s = STYLES[bill.classification];
  return (
    <article className="rounded-xl overflow-hidden bg-card border border-border">
      {/* Colored hero strip */}
      <div className={`${s.bar} px-6 py-4`}>
        <div className="flex items-center justify-between">
          <Badge classification={bill.classification} />
          <span className="text-3xl font-mono font-bold text-white">
            {Math.round(bill.final_score! * 100)}
            <span className="text-lg text-white/70">%</span>
          </span>
        </div>
      </div>
      <div className="p-6">
        <h2 className="text-xl font-bold mb-3">
          {bill.bill_type} {bill.number}/{bill.year}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          {bill.ementa}
        </p>
        <div className={`border-t ${s.border} pt-4`}>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-muted-foreground">Autor: </span>
              <span className="font-medium">{bill.author}</span>
              <span className="text-muted-foreground">
                {" "}
                ({bill.author_party}/{bill.author_state})
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Fonte: </span>
              <span className="font-medium">
                {bill.source === "camara"
                  ? "Câmara dos Deputados"
                  : "Senado Federal"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Data: </span>
              <span className="font-medium">
                {formatDate(bill.presentation_date)}
              </span>
            </div>
            {bill.status && (
              <div>
                <span className="text-muted-foreground">Status: </span>
                <span className="font-medium truncate block">
                  {bill.status}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

// ═══════════════════════════════════════════════════════════════
//  VARIANT 9 — Split Panel (two-column)
// ═══════════════════════════════════════════════════════════════

function Variant9({ bill }: { bill: BillData }) {
  const s = STYLES[bill.classification];
  return (
    <article className="grid grid-cols-1 md:grid-cols-5 gap-0 rounded-xl overflow-hidden border border-border">
      {/* Left: ementa + metadata */}
      <div className="md:col-span-3 p-6 bg-card">
        <Badge classification={bill.classification} />
        <h2 className="text-xl font-bold mt-3 mb-4">
          {bill.bill_type} {bill.number}/{bill.year}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-5">
          {bill.ementa}
        </p>
        <div className="space-y-2 text-xs">
          <div className="flex gap-2">
            <span className="text-muted-foreground w-12 flex-shrink-0">
              Autor
            </span>
            <span className="font-medium">
              {bill.author} ({bill.author_party}/{bill.author_state})
            </span>
          </div>
          <div className="flex gap-2">
            <span className="text-muted-foreground w-12 flex-shrink-0">
              Fonte
            </span>
            <span className="font-medium">
              {bill.source === "camara"
                ? "Câmara dos Deputados"
                : "Senado Federal"}
            </span>
          </div>
          <div className="flex gap-2">
            <span className="text-muted-foreground w-12 flex-shrink-0">
              Data
            </span>
            <span className="font-medium">
              {formatDate(bill.presentation_date)}
            </span>
          </div>
          {bill.status && (
            <div className="flex gap-2">
              <span className="text-muted-foreground w-12 flex-shrink-0">
                Status
              </span>
              <span className="font-medium">{bill.status}</span>
            </div>
          )}
        </div>
      </div>
      {/* Right: score panel */}
      <div
        className={`md:col-span-2 ${s.bg} border-t md:border-t-0 md:border-l ${s.border} p-6 flex flex-col justify-center`}
      >
        <p
          className={`text-xs uppercase tracking-wider font-semibold ${s.accent} mb-4`}
        >
          Risco Climático
        </p>
        <div className="text-center">
          <span className={`text-5xl font-mono font-bold ${s.accent}`}>
            {Math.round(bill.final_score! * 100)}
          </span>
          <span className={`text-2xl ${s.accent}`}>%</span>
        </div>
        <div className="mt-4">
          <div className="h-2 rounded-full bg-black/20 overflow-hidden">
            <div
              className={`h-full rounded-full ${s.bar}`}
              style={{ width: `${bill.final_score! * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>0</span>
            <span>100</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-4 text-center leading-relaxed">
          {labelFor(bill.classification)}
        </p>
      </div>
    </article>
  );
}

// ═══════════════════════════════════════════════════════════════
//  VARIANT 10 — Timeline Style
// ═══════════════════════════════════════════════════════════════

function Variant10({ bill }: { bill: BillData }) {
  const s = STYLES[bill.classification];
  return (
    <article className="relative pl-8">
      {/* Timeline vertical bar */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 rounded-full ${s.bar}`}
      />
      {/* Score circle node on timeline */}
      <div
        className={`absolute -left-3 top-0 w-7 h-7 rounded-full border-2 ${s.border} ${s.bar} flex items-center justify-center`}
      >
        <span className="text-[9px] font-mono font-bold text-white">
          {Math.round(bill.final_score! * 100)}
        </span>
      </div>
      <div className="mb-1">
        <Badge classification={bill.classification} />
      </div>
      <h2 className="text-xl font-bold mt-2 mb-3">
        {bill.bill_type} {bill.number}/{bill.year}
      </h2>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        {bill.ementa}
      </p>
      <div className={`rounded-lg ${s.bg} border ${s.border} p-4 mb-4`}>
        <div className="flex items-center gap-4">
          <div className={`text-2xl font-mono font-bold ${s.accent}`}>
            {Math.round(bill.final_score! * 100)}%
          </div>
          <div className="flex-1">
            <div className="h-1.5 rounded-full bg-black/20 overflow-hidden">
              <div
                className={`h-full rounded-full ${s.bar}`}
                style={{ width: `${bill.final_score! * 100}%` }}
              />
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          {labelFor(bill.classification)}
        </p>
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
        <span>
          {bill.author} ({bill.author_party}/{bill.author_state})
        </span>
        <span>{bill.source === "camara" ? "Câmara" : "Senado"}</span>
        <span>{formatDate(bill.presentation_date)}</span>
        {bill.status && <span className="truncate">{bill.status}</span>}
      </div>
    </article>
  );
}

// ═══════════════════════════════════════════════════════════════
//  VARIANT 11 — Dashboard Widget (ultra-compact)
// ═══════════════════════════════════════════════════════════════

function Variant11({ bill }: { bill: BillData }) {
  const s = STYLES[bill.classification];
  return (
    <article className={`rounded-lg ${s.bg} border ${s.border} p-4`}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-mono text-muted-foreground">
          {bill.bill_type} {bill.number}/{bill.year}
        </span>
        <Badge classification={bill.classification} />
      </div>
      <div className="flex items-end gap-3 mb-2">
        <span className={`text-3xl font-mono font-bold ${s.accent}`}>
          {Math.round(bill.final_score! * 100)}
        </span>
        <span className={`text-sm ${s.accent} pb-1`}>% risco</span>
      </div>
      <div className="h-1 rounded-full bg-black/20 overflow-hidden mb-2">
        <div
          className={`h-full rounded-full ${s.bar}`}
          style={{ width: `${bill.final_score! * 100}%` }}
        />
      </div>
      <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
        {bill.ementa}
      </p>
    </article>
  );
}

// ═══════════════════════════════════════════════════════════════
//  VARIANT 12 — Newspaper / Editorial
// ═══════════════════════════════════════════════════════════════

function Variant12({ bill }: { bill: BillData }) {
  const s = STYLES[bill.classification];
  return (
    <article className="max-w-2xl mx-auto">
      {/* Masthead-style header */}
      <div className="text-center mb-6">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
          {bill.source === "camara" ? "Câmara dos Deputados" : "Senado Federal"}{" "}
          · {formatDate(bill.presentation_date)}
        </p>
        <h2 className="text-2xl font-serif font-bold leading-tight">
          {bill.bill_type} {bill.number}/{bill.year}
        </h2>
        <div className="flex items-center justify-center gap-2 mt-2">
          <Badge classification={bill.classification} />
        </div>
      </div>

      {/* Ementa — first letter emphasis */}
      <div className={`border-t-2 border-b-2 ${s.border} py-5 mb-5`}>
        <p className="text-sm leading-relaxed text-foreground/90 first-letter:text-3xl first-letter:font-bold first-letter:font-serif first-letter:mr-1 first-letter:float-left first-letter:leading-none first-letter:pt-1">
          {bill.ementa}
        </p>
      </div>

      {/* Author byline */}
      <p className="text-xs text-muted-foreground text-center mb-6">
        Por {bill.author} ({bill.author_party}–{bill.author_state})
        {bill.status && <> · {bill.status}</>}
      </p>

      {/* Score — inline bar */}
      <div className={`rounded-lg ${s.bg} border ${s.border} px-5 py-4`}>
        <div className="flex items-center gap-3 mb-2">
          <span
            className={`text-xs font-semibold uppercase tracking-wider ${s.accent}`}
          >
            Índice de Risco Climático
          </span>
          <span className={`text-lg font-mono font-bold ml-auto ${s.accent}`}>
            {Math.round(bill.final_score! * 100)}%
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-black/20 overflow-hidden">
          <div
            className={`h-full rounded-full ${s.bar}`}
            style={{ width: `${bill.final_score! * 100}%` }}
          />
        </div>
        <p className="text-[11px] text-muted-foreground mt-2 italic">
          {labelFor(bill.classification)}
        </p>
      </div>
    </article>
  );
}

// ═══════════════════════════════════════════════════════════════
//  VARIANT 13 — Glassmorphism
// ═══════════════════════════════════════════════════════════════

function Variant13({ bill }: { bill: BillData }) {
  const s = STYLES[bill.classification];
  return (
    <article className="relative">
      {/* Decorative blurred circles in background */}
      <div
        className={`absolute -top-8 -right-8 w-32 h-32 rounded-full ${s.bar} opacity-20 blur-3xl pointer-events-none`}
      />
      <div
        className={`absolute -bottom-8 -left-8 w-24 h-24 rounded-full ${s.bar} opacity-10 blur-2xl pointer-events-none`}
      />

      {/* Glass card */}
      <div className="relative rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <Badge classification={bill.classification} />
            <h2 className="text-xl font-bold mt-2">
              {bill.bill_type} {bill.number}/{bill.year}
            </h2>
          </div>
          {/* Glass score circle */}
          <div
            className={`flex-shrink-0 w-20 h-20 rounded-full border ${s.border} bg-white/5 backdrop-blur flex flex-col items-center justify-center`}
          >
            <span className={`text-xl font-mono font-bold ${s.accent}`}>
              {Math.round(bill.final_score! * 100)}
            </span>
            <span className={`text-[10px] ${s.accent}`}>%</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed mb-5">
          {bill.ementa}
        </p>

        {/* Glass metadata chips */}
        <div className="flex flex-wrap gap-2 mb-5">
          {[
            `${bill.author} (${bill.author_party}/${bill.author_state})`,
            bill.source === "camara"
              ? "Câmara dos Deputados"
              : "Senado Federal",
            formatDate(bill.presentation_date),
            bill.status,
          ]
            .filter(Boolean)
            .map((text) => (
              <span
                key={text}
                className="text-[11px] px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur"
              >
                {text}
              </span>
            ))}
        </div>

        {/* Glass score bar */}
        <div className="rounded-lg border border-white/10 bg-white/5 backdrop-blur p-4">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-semibold ${s.accent}`}>
              Risco Climático
            </span>
            <span className={`text-sm font-mono font-bold ${s.accent}`}>
              {Math.round(bill.final_score! * 100)}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className={`h-full rounded-full ${s.bar}`}
              style={{ width: `${bill.final_score! * 100}%` }}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

// ═══════════════════════════════════════════════════════════════
//  VARIANT 14 — Radial Gauge
// ═══════════════════════════════════════════════════════════════

function RadialGauge({
  score,
  classification,
}: {
  score: number;
  classification: Classification;
}) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score);
  // Map classification to stroke color
  const strokeColor =
    classification === "favorable"
      ? "#10b981"
      : classification === "needs_review"
        ? "#f59e0b"
        : "#ef4444";
  const trackColor = "#1f2937"; // gray-800

  return (
    <div className="flex flex-col items-center">
      <svg width="110" height="110" viewBox="0 0 110 110">
        {/* Background track */}
        <circle
          cx="55"
          cy="55"
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth="8"
        />
        {/* Score arc */}
        <circle
          cx="55"
          cy="55"
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 55 55)"
          className="transition-all duration-700"
        />
        {/* Center text */}
        <text
          x="55"
          y="52"
          textAnchor="middle"
          className="fill-foreground"
          fontSize="18"
          fontFamily="monospace"
          fontWeight="bold"
        >
          {Math.round(score * 100)}
        </text>
        <text
          x="55"
          y="68"
          textAnchor="middle"
          className="fill-muted-foreground"
          fontSize="10"
        >
          %
        </text>
      </svg>
    </div>
  );
}

function Variant14({ bill }: { bill: BillData }) {
  return (
    <article className="rounded-xl border border-border bg-card p-6">
      <div className="flex flex-col items-center text-center mb-5">
        <Badge classification={bill.classification} />
        <h2 className="text-xl font-bold mt-3">
          {bill.bill_type} {bill.number}/{bill.year}
        </h2>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Radial gauge on the left */}
        <div className="flex-shrink-0">
          <RadialGauge
            score={bill.final_score!}
            classification={bill.classification}
          />
        </div>

        {/* Content on the right */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            {bill.ementa}
          </p>
          <p className="text-xs text-muted-foreground mb-3">
            {labelFor(bill.classification)}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
            <span className="font-medium text-foreground">{bill.author}</span>
            <span>
              {bill.author_party}/{bill.author_state}
            </span>
            <span>{bill.source === "camara" ? "Câmara" : "Senado"}</span>
            <span>{formatDate(bill.presentation_date)}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

// ═══════════════════════════════════════════════════════════════
//  VARIANT 15 — Linha do Tempo Legislativa
// ═══════════════════════════════════════════════════════════════

function Variant15({ bill }: { bill: BillData }) {
  const s = STYLES[bill.classification];
  const pct = Math.round(bill.final_score! * 100);
  return (
    <article className="relative pl-10">
      {/* Timeline spine */}
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-full bg-muted" />

      {/* Node 1: Classification */}
      <div className="relative mb-6">
        <div
          className={`absolute -left-[2.15rem] top-1 w-5 h-5 rounded-full border-2 border-background ${s.bar}`}
        />
        <Badge classification={bill.classification} />
        <h2 className={`text-sm font-bold mt-2 ${s.accent}`}>
          Classificação de Risco Climático — {pct}%
        </h2>
        <div className={`rounded-lg ${s.bg} border ${s.border} p-4 mt-2`}>
          <div className="h-2.5 rounded-full bg-black/30 overflow-hidden mb-2">
            <div
              className={`h-full rounded-full ${s.bar}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>0% — Favorável</span>
            <span>100% — Prejudicial</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
            {labelFor(bill.classification)}
          </p>
        </div>
      </div>

      {/* Node 2: Title + Ementa */}
      <div className="relative mb-6">
        <div className="absolute -left-[2.15rem] top-1 w-5 h-5 rounded-full border-2 border-background bg-muted" />
        <h1 className="text-xl font-bold">
          {bill.bill_type} {bill.number}/{bill.year}
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          {bill.source === "camara" ? "Câmara dos Deputados" : "Senado Federal"}{" "}
          · {formatDate(bill.presentation_date)}
        </p>
        <p className="text-sm leading-relaxed text-foreground/85 mt-3">
          {bill.ementa}
        </p>
      </div>

      {/* Node 3: Author */}
      <div className="relative mb-6">
        <div className="absolute -left-[2.15rem] top-1 w-5 h-5 rounded-full border-2 border-background bg-muted" />
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Autor
        </p>
        <p className="text-sm font-bold">{bill.author}</p>
        <p className="text-xs text-muted-foreground">
          {bill.author_party} · {bill.author_state}
        </p>
      </div>

      {/* Node 4: Status */}
      <div className="relative mb-6">
        <div
          className={`absolute -left-[2.15rem] top-1 w-5 h-5 rounded-full border-2 border-background ${s.bar}`}
        />
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Status
        </p>
        <p className={`text-sm font-semibold ${s.accent}`}>{bill.status}</p>
      </div>

      {/* Node 5: Source link */}
      <div className="relative">
        <div className="absolute -left-[2.15rem] top-1 w-5 h-5 rounded-full border-2 border-background bg-muted" />
        <Button
          variant="outline"
          className="w-full sm:w-auto"
          render={
            <a href={bill.link} target="_blank" rel="noopener noreferrer">
              Ver fonte original ↗
            </a>
          }
        />
      </div>
    </article>
  );
}

// ═══════════════════════════════════════════════════════════════
//  VARIANT 16 — Ficha Técnica (Technical Datasheet)
// ═══════════════════════════════════════════════════════════════

function Variant16({ bill }: { bill: BillData }) {
  const s = STYLES[bill.classification];
  const pct = Math.round(bill.final_score! * 100);
  return (
    <article className="rounded-xl border border-border overflow-hidden">
      {/* Datasheet header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
              Ficha Técnica ·{" "}
              {bill.source === "camara"
                ? "Câmara dos Deputados"
                : "Senado Federal"}
            </p>
            <h1 className="text-xl font-bold mt-1">
              {bill.bill_type} {bill.number}/{bill.year}
            </h1>
          </div>
          <Badge classification={bill.classification} />
        </div>
      </div>

      <div className="p-6">
        {/* Specification rows */}
        <dl className="divide-y divide-border">
          <div className="py-4 sm:grid sm:grid-cols-4 sm:gap-4">
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Ementa
            </dt>
            <dd className="mt-1 sm:mt-0 sm:col-span-3 text-sm leading-relaxed text-foreground/85">
              {bill.ementa}
            </dd>
          </div>

          <div className={`py-4 sm:grid sm:grid-cols-4 sm:gap-4 ${s.bg}`}>
            <dt
              className={`text-xs font-semibold uppercase tracking-wider ${s.accent}`}
            >
              Risco Climático
            </dt>
            <dd className="mt-2 sm:mt-0 sm:col-span-3">
              <div className="flex items-center gap-4 mb-2">
                <span className={`text-2xl font-mono font-bold ${s.accent}`}>
                  {pct}%
                </span>
                <div className="flex-1">
                  <div className="h-2.5 rounded-full bg-black/30 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${s.bar}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground mb-2">
                <span>Favorável</span>
                <span>Prejudicial</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {labelFor(bill.classification)}
              </p>
            </dd>
          </div>

          <div className="py-4 sm:grid sm:grid-cols-4 sm:gap-4">
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Autor
            </dt>
            <dd className="mt-1 sm:mt-0 sm:col-span-3">
              <span className="text-sm font-bold">{bill.author}</span>
              <span className="text-xs text-muted-foreground ml-2">
                {bill.author_party} / {bill.author_state}
              </span>
            </dd>
          </div>

          <div className={`py-4 sm:grid sm:grid-cols-4 sm:gap-4 ${s.bg}`}>
            <dt
              className={`text-xs font-semibold uppercase tracking-wider ${s.accent}`}
            >
              Status
            </dt>
            <dd
              className={`mt-1 sm:mt-0 sm:col-span-3 text-sm font-semibold ${s.accent}`}
            >
              <span className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${s.bar}`} />
                {bill.status}
              </span>
            </dd>
          </div>

          <div className="py-4 sm:grid sm:grid-cols-4 sm:gap-4">
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Datas
            </dt>
            <dd className="mt-1 sm:mt-0 sm:col-span-3 text-sm">
              <div className="flex flex-wrap gap-x-6 gap-y-1">
                <span>
                  <span className="text-muted-foreground">Apresentação:</span>{" "}
                  {formatDate(bill.presentation_date)}
                </span>
                <span>
                  <span className="text-muted-foreground">Classificação:</span>{" "}
                  {formatDate(bill.classified_at)}
                </span>
              </div>
            </dd>
          </div>
        </dl>

        <Button
          variant="outline"
          className="w-full sm:w-auto mt-4"
          render={
            <a href={bill.link} target="_blank" rel="noopener noreferrer">
              Ver fonte original ↗
            </a>
          }
        />
      </div>
    </article>
  );
}

// ═══════════════════════════════════════════════════════════════
//  VARIANT 17 — Resumo Executivo (Executive Brief)
// ═══════════════════════════════════════════════════════════════

function Variant17({ bill }: { bill: BillData }) {
  const s = STYLES[bill.classification];
  const pct = Math.round(bill.final_score! * 100);
  return (
    <article>
      {/* Header strip with key facts */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground mb-6 pb-4 border-b border-border">
        <span className="font-semibold text-foreground">
          {bill.source === "camara" ? "Câmara dos Deputados" : "Senado Federal"}
        </span>
        <span aria-hidden="true">|</span>
        <span>{formatDate(bill.presentation_date)}</span>
        <span aria-hidden="true">|</span>
        <span>
          {bill.bill_type} {bill.number}/{bill.year}
        </span>
      </div>

      {/* Title */}
      <Badge classification={bill.classification} />
      <h1 className="text-2xl font-bold mt-3 mb-6">
        {bill.bill_type} {bill.number}/{bill.year}
      </h1>

      {/* Ementa — large, readable */}
      <section className="mb-8">
        <p className="text-base leading-relaxed text-foreground/85">
          {bill.ementa}
        </p>
      </section>

      {/* Verdict box */}
      <section
        className={`rounded-xl border-2 ${s.border} p-6 mb-6`}
        style={{
          background: `linear-gradient(135deg, ${bill.classification === "favorable" ? "rgba(16,185,129,0.08)" : bill.classification === "needs_review" ? "rgba(245,158,11,0.08)" : "rgba(239,68,68,0.08)"}, transparent)`,
        }}
      >
        <div className="flex items-start gap-4">
          <div
            className={`flex-shrink-0 w-14 h-14 rounded-2xl ${s.bar} flex items-center justify-center`}
          >
            <span className="text-lg font-mono font-bold text-white">
              {pct}
            </span>
          </div>
          <div>
            <h2 className={`text-sm font-bold ${s.accent} mb-1`}>
              Classificação de Risco Climático
            </h2>
            <div className="h-2 rounded-full bg-black/20 overflow-hidden mb-2 max-w-xs">
              <div
                className={`h-full rounded-full ${s.bar}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {labelFor(bill.classification)}
            </p>
          </div>
        </div>
      </section>

      {/* Footer: author + status + link */}
      <footer className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border">
        <div className="space-y-2">
          <div>
            <span className="text-xs text-muted-foreground">Autor: </span>
            <span className="text-sm font-bold">{bill.author}</span>
            <span className="text-xs text-muted-foreground">
              {" "}
              ({bill.author_party}/{bill.author_state})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${s.bar}`} />
            <span className="text-xs text-muted-foreground">Status: </span>
            <span className={`text-xs font-semibold ${s.accent}`}>
              {bill.status}
            </span>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          render={
            <a href={bill.link} target="_blank" rel="noopener noreferrer">
              Fonte original ↗
            </a>
          }
        />
      </footer>
    </article>
  );
}

// ═══════════════════════════════════════════════════════════════
//  VARIANT 18 — Dossiê (Dossier / Folder)
// ═══════════════════════════════════════════════════════════════

function Variant18({ bill }: { bill: BillData }) {
  const s = STYLES[bill.classification];
  const pct = Math.round(bill.final_score! * 100);
  return (
    <article>
      {/* Folder tab */}
      <div className="flex">
        <div
          className={`inline-flex items-center gap-2 rounded-t-xl ${s.bar} px-5 py-2`}
        >
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            {bill.source === "camara"
              ? "Câmara dos Deputados"
              : "Senado Federal"}
          </span>
          <span className="text-[10px] text-white/70">
            {formatDate(bill.presentation_date)}
          </span>
        </div>
      </div>

      {/* Folder body */}
      <div className="rounded-xl rounded-tl-none border border-border bg-card p-6">
        {/* Stamp */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h1 className="text-2xl font-bold">
              {bill.bill_type} {bill.number}/{bill.year}
            </h1>
          </div>
          <div
            className={`flex-shrink-0 -rotate-6 border-2 ${s.border} rounded-lg px-4 py-2 ${s.bg}`}
          >
            <p
              className={`text-[9px] uppercase tracking-wider ${s.accent} text-center`}
            >
              Risco Climático
            </p>
            <p
              className={`text-xl font-mono font-bold ${s.accent} text-center`}
            >
              {pct}%
            </p>
          </div>
        </div>

        {/* Classification bar */}
        <div className="mb-5">
          <Badge classification={bill.classification} />
          <div className="h-2 rounded-full bg-muted overflow-hidden mt-3">
            <div
              className={`h-full rounded-full ${s.bar}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>Favorável</span>
            <span>Prejudicial</span>
          </div>
        </div>

        {/* Ementa */}
        <div className="mb-6">
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
            Ementa
          </h2>
          <p className="text-sm leading-relaxed text-foreground/85">
            {bill.ementa}
          </p>
        </div>

        {/* Prediction */}
        <div className={`rounded-lg ${s.bg} border ${s.border} p-4 mb-6`}>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {labelFor(bill.classification)}
          </p>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
            <span className="font-bold">{bill.author}</span>
            <span className="text-muted-foreground">
              {bill.author_party}/{bill.author_state}
            </span>
            <span aria-hidden="true" className="text-muted-foreground">
              ·
            </span>
            <span
              className={`font-semibold flex items-center gap-1.5 ${s.accent}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${s.bar}`} />
              {bill.status}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            render={
              <a href={bill.link} target="_blank" rel="noopener noreferrer">
                Fonte original ↗
              </a>
            }
          />
        </div>
      </div>
    </article>
  );
}

// ═══════════════════════════════════════════════════════════════
//  VARIANT 19 — Infográfico (Infographic Style)
// ═══════════════════════════════════════════════════════════════

function Variant19({ bill }: { bill: BillData }) {
  const s = STYLES[bill.classification];
  const pct = Math.round(bill.final_score! * 100);
  return (
    <article>
      {/* Large score visual */}
      <section className="text-center mb-8">
        <Badge classification={bill.classification} />
        <div className="mt-6 mb-4">
          {/* Gradient bar: green → yellow → red */}
          <div className="h-4 rounded-full overflow-hidden bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 relative">
            <div
              className="absolute top-0 -bottom-0 w-1 bg-white rounded-full shadow-lg shadow-white/50"
              style={{ left: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5">
            <span className="text-emerald-400">0%</span>
            <span className="text-amber-400">50%</span>
            <span className="text-red-400">100%</span>
          </div>
        </div>
        <span className={`text-5xl font-mono font-bold ${s.accent}`}>
          {pct}
          <span className="text-2xl">%</span>
        </span>
        <p className={`text-sm font-semibold mt-2 ${s.accent}`}>
          Classificação de Risco Climático
        </p>
        <p className="text-xs text-muted-foreground mt-2 max-w-md mx-auto leading-relaxed">
          {labelFor(bill.classification)}
        </p>
      </section>

      {/* Title + ementa */}
      <div className="rounded-xl bg-card border border-border p-6 mb-4">
        <h1 className="text-xl font-bold mb-3">
          {bill.bill_type} {bill.number}/{bill.year}
        </h1>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
          <span className="font-medium text-foreground">
            {bill.source === "camara"
              ? "Câmara dos Deputados"
              : "Senado Federal"}
          </span>
          <span>·</span>
          <span>{formatDate(bill.presentation_date)}</span>
        </div>
        <p className="text-sm leading-relaxed text-foreground/85">
          {bill.ementa}
        </p>
      </div>

      {/* Icon row: author + status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <div className="rounded-lg bg-card border border-border p-4 flex items-center gap-3">
          <span className="text-xl" aria-hidden="true">
            👤
          </span>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Autor
            </p>
            <p className="text-sm font-bold">{bill.author}</p>
            <p className="text-[11px] text-muted-foreground">
              {bill.author_party} · {bill.author_state}
            </p>
          </div>
        </div>
        <div
          className={`rounded-lg border-2 ${s.border} ${s.bg} p-4 flex items-center gap-3`}
        >
          <span className="text-xl" aria-hidden="true">
            📋
          </span>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Status
            </p>
            <p className={`text-sm font-semibold ${s.accent}`}>{bill.status}</p>
          </div>
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full sm:w-auto"
        render={
          <a href={bill.link} target="_blank" rel="noopener noreferrer">
            Ver fonte original ↗
          </a>
        }
      />
    </article>
  );
}

// ═══════════════════════════════════════════════════════════════
//  VARIANT 20 — Zonas de Impacto (Impact Zones)
// ═══════════════════════════════════════════════════════════════

function Variant20({ bill }: { bill: BillData }) {
  const s = STYLES[bill.classification];
  const pct = Math.round(bill.final_score! * 100);
  return (
    <article>
      {/* Title block */}
      <div className="mb-6">
        <Badge classification={bill.classification} />
        <h1 className="text-2xl font-bold mt-3">
          {bill.bill_type} {bill.number}/{bill.year}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {bill.source === "camara" ? "Câmara dos Deputados" : "Senado Federal"}{" "}
          · {formatDate(bill.presentation_date)}
        </p>
      </div>

      {/* Ementa */}
      <p className="text-sm leading-relaxed text-foreground/85 mb-8">
        {bill.ementa}
      </p>

      {/* Zone indicator — 3 colored zones */}
      <section className="mb-8">
        <h2 className={`text-sm font-bold mb-4 ${s.accent}`}>
          Onde este PL se situa?
        </h2>
        <div className="relative h-20 rounded-xl overflow-hidden flex">
          {/* Green zone */}
          <div
            className="bg-emerald-950/60 flex items-center justify-center text-[10px] text-emerald-400 font-semibold border-r border-border"
            style={{ width: "30%" }}
          >
            <div className="text-center">
              <p>0–30%</p>
              <p className="opacity-70">Favorável</p>
            </div>
          </div>
          {/* Yellow zone */}
          <div
            className="bg-amber-950/40 flex items-center justify-center text-[10px] text-amber-400 font-semibold border-r border-border"
            style={{ width: "30%" }}
          >
            <div className="text-center">
              <p>30–60%</p>
              <p className="opacity-70">Revisão</p>
            </div>
          </div>
          {/* Red zone */}
          <div
            className="bg-red-950/40 flex items-center justify-center text-[10px] text-red-400 font-semibold"
            style={{ width: "40%" }}
          >
            <div className="text-center">
              <p>60–100%</p>
              <p className="opacity-70">Prejudicial</p>
            </div>
          </div>

          {/* Position marker */}
          <div
            className="absolute top-1 bottom-1 w-0.5 bg-white rounded-full shadow-lg"
            style={{ left: `${pct}%` }}
          />
          <div
            className="absolute -top-1 rounded-full bg-white text-black text-[10px] font-bold px-1.5 py-0.5 shadow-lg"
            style={{ left: `calc(${pct}% - 16px)` }}
          >
            {pct}%
          </div>
        </div>
      </section>

      {/* Prediction */}
      <section className={`rounded-xl ${s.bg} border ${s.border} p-5 mb-8`}>
        <h2
          className={`text-xs font-bold uppercase tracking-wider ${s.accent} mb-2`}
        >
          Interpretação
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {labelFor(bill.classification)}
        </p>
      </section>

      {/* Author + Status row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            Autor
          </p>
          <p className="text-sm font-bold">{bill.author}</p>
          <p className="text-xs text-muted-foreground">
            {bill.author_party} · {bill.author_state}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            Status
          </p>
          <p
            className={`text-sm font-semibold flex items-center gap-2 ${s.accent}`}
          >
            <span className={`w-2 h-2 rounded-full ${s.bar}`} />
            {bill.status}
          </p>
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full sm:w-auto"
        render={
          <a href={bill.link} target="_blank" rel="noopener noreferrer">
            Ver fonte original ↗
          </a>
        }
      />
    </article>
  );
}

// ═══════════════════════════════════════════════════════════════
//  VARIANT 21 — Cartão de Impacto (Impact Card)
// ═══════════════════════════════════════════════════════════════

function Variant21({ bill }: { bill: BillData }) {
  const s = STYLES[bill.classification];
  const pct = Math.round(bill.final_score! * 100);
  // Determine impact level label
  const impactLabel =
    bill.classification === "favorable"
      ? "BAIXO IMPACTO NEGATIVO"
      : bill.classification === "unfavorable"
        ? "ALTO IMPACTO NEGATIVO"
        : "IMPACTO INCERTO";
  return (
    <article className="rounded-xl overflow-hidden border border-border">
      {/* Impact banner */}
      <div className={`${s.bar} px-6 py-8 text-center`}>
        <p className="text-xs font-bold text-white/80 uppercase tracking-[0.2em] mb-2">
          {impactLabel}
        </p>
        <span className="text-5xl font-mono font-bold text-white">
          {pct}
          <span className="text-2xl text-white/70">%</span>
        </span>
        <p className="text-sm text-white/80 mt-2">
          Classificação de Risco Climático
        </p>
      </div>

      <div className="bg-card p-6">
        {/* Title */}
        <Badge classification={bill.classification} />
        <h1 className="text-xl font-bold mt-3 mb-1">
          {bill.bill_type} {bill.number}/{bill.year}
        </h1>
        <p className="text-xs text-muted-foreground mb-4">
          {bill.source === "camara" ? "Câmara dos Deputados" : "Senado Federal"}{" "}
          · {formatDate(bill.presentation_date)}
        </p>

        {/* Ementa */}
        <p className="text-sm leading-relaxed text-foreground/85 mb-6">
          {bill.ementa}
        </p>

        {/* Prediction */}
        <div className={`rounded-lg ${s.bg} border ${s.border} p-4 mb-6`}>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {labelFor(bill.classification)}
          </p>
        </div>

        {/* Author + Status side by side */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 rounded-lg bg-muted/30 p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              Autor
            </p>
            <p className="text-sm font-bold">{bill.author}</p>
            <p className="text-[11px] text-muted-foreground">
              {bill.author_party} · {bill.author_state}
            </p>
          </div>
          <div className={`flex-1 rounded-lg border-2 ${s.border} ${s.bg} p-4`}>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              Status
            </p>
            <p className={`text-sm font-semibold ${s.accent}`}>{bill.status}</p>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full sm:w-auto"
          render={
            <a href={bill.link} target="_blank" rel="noopener noreferrer">
              Ver fonte original ↗
            </a>
          }
        />
      </div>
    </article>
  );
}

// ═══════════════════════════════════════════════════════════════
//  VARIANT 22 — Destaque Legislativo (Legislative Highlight)
// ═══════════════════════════════════════════════════════════════

function Variant22({ bill }: { bill: BillData }) {
  const s = STYLES[bill.classification];
  const pct = Math.round(bill.final_score! * 100);
  return (
    <article className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Left: Score panel (1 col) */}
      <section
        className={`lg:col-span-1 rounded-xl ${s.bg} border ${s.border} p-6 flex flex-col items-center justify-center text-center`}
      >
        <p className={`text-[10px] uppercase tracking-wider ${s.accent} mb-3`}>
          Risco
        </p>
        <div
          className={`w-24 h-24 rounded-full border-4 ${s.border} flex items-center justify-center mb-4`}
        >
          <span className={`text-2xl font-mono font-bold ${s.accent}`}>
            {pct}%
          </span>
        </div>
        <div className="w-full">
          <div className="h-2 rounded-full bg-black/30 overflow-hidden">
            <div
              className={`h-full rounded-full ${s.bar}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
            <span>0</span>
            <span>100</span>
          </div>
        </div>
        <p className={`text-[11px] ${s.accent} mt-4 leading-relaxed`}>
          {labelFor(bill.classification)}
        </p>
      </section>

      {/* Right: Content (3 cols) */}
      <div className="lg:col-span-3 space-y-6">
        {/* Title */}
        <div>
          <Badge classification={bill.classification} />
          <h1 className="text-2xl font-bold mt-3">
            {bill.bill_type} {bill.number}/{bill.year}
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">
              {bill.source === "camara"
                ? "Câmara dos Deputados"
                : "Senado Federal"}
            </span>
            <span aria-hidden="true">·</span>
            <span>{formatDate(bill.presentation_date)}</span>
          </div>
        </div>

        {/* Ementa */}
        <div className={`border-l-2 ${s.border} pl-4`}>
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
            Ementa
          </h2>
          <p className="text-sm leading-relaxed text-foreground/85">
            {bill.ementa}
          </p>
        </div>

        {/* Author card */}
        <div className="rounded-lg bg-card border border-border p-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full ${s.bg} border ${s.border} flex items-center justify-center text-lg font-bold ${s.accent}`}
            >
              {bill.author.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-bold">{bill.author}</p>
              <p className="text-xs text-muted-foreground">
                {bill.author_party} · {bill.author_state}
              </p>
            </div>
          </div>
        </div>

        {/* Status + link row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border">
          <div className="flex items-center gap-3">
            <span
              className={`w-2.5 h-2.5 rounded-full ${s.bar} animate-pulse`}
            />
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Status
              </p>
              <p className={`text-sm font-semibold ${s.accent}`}>
                {bill.status}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            render={
              <a href={bill.link} target="_blank" rel="noopener noreferrer">
                Ver fonte original ↗
              </a>
            }
          />
        </div>
      </div>
    </article>
  );
}

// ═══════════════════════════════════════════════════════════════
//  VARIANT 0a — Status Banner (full-width colored alert row)
// ═══════════════════════════════════════════════════════════════

function Variant0a({ bill }: { bill: BillData }) {
  const s = STYLES[bill.classification];
  const pct = Math.round(bill.final_score! * 100);
  return (
    <article
      className={`rounded-xl border ${s.border} overflow-hidden hover:shadow-lg transition-shadow`}
    >
      <div className={`h-1.5 w-full ${s.bar}`} />
      <div className="p-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {bill.bill_type} {bill.number}/{bill.year}
          </h1>
        </div>

        {/* Classification bar */}
        <div className="mb-5">
          <Badge classification={bill.classification} size="text-md" />
          <div aria-hidden="true">
            <div className="h-2 rounded-full bg-muted overflow-hidden mt-5">
              <div
                className={`h-full rounded-full ${s.bar}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-muted-foreground mt-1">
              <span>Favorável</span>
              <span>Prejudicial</span>
            </div>
          </div>
        </div>

        {/* Analysis box */}
        <div className={`mt-5 rounded-lg ${s.bg} border ${s.border} p-4`}>
          <h2
            className={`text-xs font-bold uppercase tracking-wider ${s.accent} mb-2`}
          >
            Análise de risco e impacto ecológico da proposta
          </h2>
          <p className="text-sm leading-relaxed">
            {labelFor(bill.classification)}
          </p>
        </div>

        {/* Ementa */}
        <section className="my-6">
          <h2 className="text-xl font-bold mt-4 mb-2">Ementa</h2>
          <div className={`border-l-2 ${s.border} pl-4 mb-5`}>
            <p className="text-md text-muted-foreground leading-relaxed">
              {bill.ementa}
            </p>
          </div>
        </section>

        {/* STATUS — full-width colored banner */}
        <div className={`rounded-lg ${s.bar} px-5 py-3 mb-4`}>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-white/80">
              Status
            </span>
            <span className="text-sm font-bold text-white">{bill.status}</span>
          </div>
        </div>

        {/* Meta row: author / source / date inline */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm mb-4">
          <span>
            <span className="text-muted-foreground">Autor: </span>
            <span className="font-bold">{bill.author}</span>
            <span className="text-muted-foreground text-xs">
              {" "}
              ({bill.author_party}/{bill.author_state})
            </span>
          </span>
          <span aria-hidden="true" className="text-muted-foreground">
            ·
          </span>
          <span className="text-muted-foreground">
            {bill.source === "camara"
              ? "Câmara dos Deputados"
              : "Senado Federal"}
          </span>
          <span aria-hidden="true" className="text-muted-foreground">
            ·
          </span>
          <span className="text-muted-foreground">
            {formatDate(bill.presentation_date)}
          </span>
        </div>

        <Button
          variant="outline"
          className="w-full sm:w-auto"
          render={
            <a href={bill.link} target="_blank" rel="noopener noreferrer">
              Ver fonte original ↗
            </a>
          }
        />
      </div>
    </article>
  );
}

// ═══════════════════════════════════════════════════════════════
//  VARIANT 0b — Status + Author Split Cards
// ═══════════════════════════════════════════════════════════════

function Variant0b({ bill }: { bill: BillData }) {
  const s = STYLES[bill.classification];
  const pct = Math.round(bill.final_score! * 100);
  return (
    <article
      className={`rounded-xl border ${s.border} overflow-hidden hover:shadow-lg transition-shadow`}
    >
      <div className={`h-1.5 w-full ${s.bar}`} />
      <div className="p-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {bill.bill_type} {bill.number}/{bill.year}
          </h1>
        </div>

        <div className="mb-5">
          <Badge classification={bill.classification} size="text-md" />
          <div aria-hidden="true">
            <div className="h-2 rounded-full bg-muted overflow-hidden mt-5">
              <div
                className={`h-full rounded-full ${s.bar}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-muted-foreground mt-1">
              <span>Favorável</span>
              <span>Prejudicial</span>
            </div>
          </div>
        </div>

        <div className={`mt-5 rounded-lg ${s.bg} border ${s.border} p-4`}>
          <h2
            className={`text-xs font-bold uppercase tracking-wider ${s.accent} mb-2`}
          >
            Análise de risco e impacto ecológico da proposta
          </h2>
          <p className="text-sm leading-relaxed">
            {labelFor(bill.classification)}
          </p>
        </div>

        <section className="my-6">
          <h2 className="text-xl font-bold mt-4 mb-2">Ementa</h2>
          <div className={`border-l-2 ${s.border} pl-4 mb-5`}>
            <p className="text-md text-muted-foreground leading-relaxed">
              {bill.ementa}
            </p>
          </div>
        </section>

        {/* STATUS + AUTHOR — two cards side by side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div
            className={`rounded-lg border-2 ${s.border} ${s.bg} p-4 flex items-center gap-3`}
          >
            <span
              className={`flex-shrink-0 w-3 h-3 rounded-full ${s.bar} animate-pulse`}
            />
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Status
              </p>
              <p className={`text-sm font-bold ${s.accent}`}>{bill.status}</p>
            </div>
          </div>
          <div className="rounded-lg bg-card border border-border p-4 flex items-center gap-3">
            <div
              className={`flex-shrink-0 w-9 h-9 rounded-full ${s.bg} border ${s.border} flex items-center justify-center text-sm font-bold ${s.accent}`}
            >
              {bill.author.charAt(bill.author.indexOf(".") + 1 || 0)}
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Autor
              </p>
              <p className="text-sm font-bold">{bill.author}</p>
              <p className="text-[11px] text-muted-foreground">
                {bill.author_party}/{bill.author_state}
              </p>
            </div>
          </div>
        </div>

        {/* Source + date tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
            {bill.source === "camara"
              ? "Câmara dos Deputados"
              : "Senado Federal"}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
            {formatDate(bill.presentation_date)}
          </span>
        </div>

        <Button
          variant="outline"
          className="w-full sm:w-auto"
          render={
            <a href={bill.link} target="_blank" rel="noopener noreferrer">
              Ver fonte original ↗
            </a>
          }
        />
      </div>
    </article>
  );
}

// ═══════════════════════════════════════════════════════════════
//  VARIANT 0c — Status Accent Bar + Labeled Rows
// ═══════════════════════════════════════════════════════════════

function Variant0c({ bill }: { bill: BillData }) {
  const s = STYLES[bill.classification];
  const pct = Math.round(bill.final_score! * 100);
  return (
    <article
      className={`rounded-xl border ${s.border} overflow-hidden hover:shadow-lg transition-shadow`}
    >
      <div className={`h-1.5 w-full ${s.bar}`} />
      <div className="p-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {bill.bill_type} {bill.number}/{bill.year}
          </h1>
        </div>

        <div className="mb-5">
          <Badge classification={bill.classification} size="text-md" />
          <div aria-hidden="true">
            <div className="h-2 rounded-full bg-muted overflow-hidden mt-5">
              <div
                className={`h-full rounded-full ${s.bar}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-muted-foreground mt-1">
              <span>Favorável</span>
              <span>Prejudicial</span>
            </div>
          </div>
        </div>

        <div className={`mt-5 rounded-lg ${s.bg} border ${s.border} p-4`}>
          <h2
            className={`text-xs font-bold uppercase tracking-wider ${s.accent} mb-2`}
          >
            Análise de risco e impacto ecológico da proposta
          </h2>
          <p className="text-sm leading-relaxed">
            {labelFor(bill.classification)}
          </p>
        </div>

        <section className="my-6">
          <h2 className="text-xl font-bold mt-4 mb-2">Ementa</h2>
          <div className={`border-l-2 ${s.border} pl-4 mb-5`}>
            <p className="text-md text-muted-foreground leading-relaxed">
              {bill.ementa}
            </p>
          </div>
        </section>

        {/* STATUS — left accent bar style */}
        <div
          className={`border-l-4 ${s.border} pl-4 py-2 mb-5`}
          style={{ borderLeftColor: "currentColor" }}
        >
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
            Status
          </p>
          <p className={`text-base font-bold ${s.accent}`}>{bill.status}</p>
        </div>

        {/* Labeled rows for author, source, date */}
        <div className="space-y-3 mb-5">
          <div className="flex items-baseline gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground w-16 flex-shrink-0">
              Autor
            </span>
            <span className="text-sm font-bold">{bill.author}</span>
            <span className="text-xs text-muted-foreground">
              ({bill.author_party}/{bill.author_state})
            </span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground w-16 flex-shrink-0">
              Fonte
            </span>
            <span className="text-sm">
              {bill.source === "camara"
                ? "Câmara dos Deputados"
                : "Senado Federal"}
            </span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground w-16 flex-shrink-0">
              Data
            </span>
            <span className="text-sm">
              {formatDate(bill.presentation_date)}
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full sm:w-auto"
          render={
            <a href={bill.link} target="_blank" rel="noopener noreferrer">
              Ver fonte original ↗
            </a>
          }
        />
      </div>
    </article>
  );
}

// ═══════════════════════════════════════════════════════════════
//  VARIANT 0d — Compact Footer Bar (single row)
// ═══════════════════════════════════════════════════════════════

function Variant0d({ bill }: { bill: BillData }) {
  const s = STYLES[bill.classification];
  const pct = Math.round(bill.final_score! * 100);
  return (
    <article
      className={`rounded-xl border ${s.border} overflow-hidden hover:shadow-lg transition-shadow`}
    >
      <div className={`h-1.5 w-full ${s.bar}`} />
      <div className="p-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {bill.bill_type} {bill.number}/{bill.year}
          </h1>
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            render={
              <a href={bill.link} target="_blank" rel="noopener noreferrer">
                Ver fonte original ↗
              </a>
            }
          />
        </div>

        <div className="mb-5">
          <Badge classification={bill.classification} size="text-md" />
          <div aria-hidden="true">
            <div className="h-2 rounded-full bg-muted overflow-hidden mt-5">
              <div
                className={`h-full rounded-full ${s.bar}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-muted-foreground mt-1">
              <span>Favorável</span>
              <span>Prejudicial</span>
            </div>
          </div>
        </div>

        <section className="mt-7">
          <h2 className="text-xl font-bold mt-3 mb-2">Ementa</h2>
          <div className={`border-l-2 ${s.border} pl-4`}>
            <p className="text-md text-muted-foreground leading-relaxed">
              {bill.ementa}
            </p>
          </div>
        </section>

        <div className={`mt-4 rounded-lg ${s.bg} border ${s.border} p-4`}>
          <h2
            className={`text-xs font-bold uppercase tracking-wider ${s.accent} mb-2`}
          >
            Análise de risco e impacto ecológico da proposta
          </h2>
          <p className="text-sm leading-relaxed">
            {labelFor(bill.classification)}
          </p>
        </div>

        {/* NEW SECTION ------- */}
        <section className="mt-7">
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Status card — same border as old section, no bg, SyncIcon */}
            {bill.status && (
              <div className="col-span-2 flex gap-2 border border-foreground p-4 rounded-lg">
                <div>
                  <h2 className="font-bold mb-1 uppercase">
                    <SyncIcon /> Status
                  </h2>
                  <p>{bill.status}</p>
                </div>
              </div>
            )}

            {/* Author card */}
            {bill.author && (
              <div
                className={`${bill.author_party ? "sm:col-span-1" : "sm:col-span-2"} col-span-2 rounded-lg bg-card p-4`}
              >
                <h2 className="font-bold mb-1 text-lg">
                  <PersonIcon /> Autor
                </h2>
                <p className="text-md">
                  <span className="mr-2">{bill.author}</span>
                </p>
              </div>
            )}
            {bill.author_party && (
              <div
                className={`col-span-2 ${bill.author ? "sm:col-span-1" : "sm:col-span-2"} rounded-lg bg-card p-4`}
              >
                <h2 className="font-bold mb-1 text-lg">
                  <HowToVoteIcon /> Partido
                </h2>
                <p className="text-md">
                  <span>
                    {bill.author_party}
                    {bill.author_state && `/${bill.author_state}`}
                  </span>
                </p>
              </div>
            )}

            {/* Source card — with SourceIcon */}
            {bill.source && (
              <div
                className={`${bill.presentation_date ? "sm:col-span-1" : "sm:col-span-2"} rounded-lg bg-card p-4 flex gap-2`}
              >
                <div>
                  <h2 className="font-bold mb-1 text-lg">
                    <SourceIcon /> Fonte do projeto
                  </h2>

                  <p className="text-md">
                    {bill.source === "camara"
                      ? "Câmara dos Deputados"
                      : "Senado Federal"}
                  </p>
                </div>
              </div>
            )}

            {/* Date card — with CalendarMonthIcon */}
            {bill.presentation_date && (
              <div
                className={`${bill.source ? "sm:col-span-1" : "sm:col-span-2"} rounded-lg bg-card p-4 flex gap-2`}
              >
                <div>
                  <h2 className="font-bold mb-1 text-lg">
                    <CalendarMonthIcon /> Data de apresentação
                  </h2>
                  <p className="md">{formatDate(bill.presentation_date)}</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/*END  NEW SECTION ------- */}
      </div>
    </article>
  );
}

// ═══════════════════════════════════════════════════════════════
//  VARIANT 0e — Status Top Prominence (above ementa)
// ═══════════════════════════════════════════════════════════════

function Variant0e({ bill }: { bill: BillData }) {
  const s = STYLES[bill.classification];
  const pct = Math.round(bill.final_score! * 100);
  return (
    <article
      className={`rounded-xl border ${s.border} overflow-hidden hover:shadow-lg transition-shadow`}
    >
      <div className={`h-1.5 w-full ${s.bar}`} />
      <div className="p-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {bill.bill_type} {bill.number}/{bill.year}
          </h1>
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            render={
              <a href={bill.link} target="_blank" rel="noopener noreferrer">
                Ver fonte original ↗
              </a>
            }
          />
        </div>

        <div className="mb-5">
          <Badge classification={bill.classification} size="text-md" />
          <div aria-hidden="true">
            <div className="h-2 rounded-full bg-muted overflow-hidden mt-5">
              <div
                className={`h-full rounded-full ${s.bar}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-muted-foreground mt-1">
              <span>Favorável</span>
              <span>Prejudicial</span>
            </div>
          </div>
        </div>

        <section className="mt-7">
          <h2 className="text-xl font-bold mt-3 mb-2">Ementa</h2>
          <div className={`border-l-2 ${s.border} pl-4`}>
            <p className="text-md text-muted-foreground leading-relaxed">
              {bill.ementa}
            </p>
          </div>
        </section>

        <div className={`mt-4 rounded-lg ${s.bg} border ${s.border} p-4`}>
          <h2
            className={`text-xs font-bold uppercase tracking-wider ${s.accent} mb-2`}
          >
            Análise de risco e impacto ecológico da proposta
          </h2>
          <p className="text-sm leading-relaxed">
            {labelFor(bill.classification)}
          </p>
        </div>

        <section className="mt-7">
          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <div className="w-full flex gap-2 bg-card mr-2 p-4 rounded-lg">
              <PersonIcon /> <h2 className="font-bold uppercase">Autor:</h2>
              <span>{bill.author}</span>
            </div>
            {bill.author_party && (
              <div className="w-full flex gap-2 bg-card mr-2 p-4 rounded-lg">
                {/* <span className="bg-card mr-2 border border-foreground p-2 rounded-full"> */}
                <HowToVoteIcon />
                <h2 className="font-bold uppercase">Partido:</h2>
                <span>
                  {bill.author_party}
                  {bill.author_state && `/${bill.author_state}`}
                </span>
              </div>
            )}
          </div>
          {bill.source && (
            <div className="mt-4 w-full flex gap-2 bg-card mr-2 p-4 rounded-lg">
              <SourceIcon />
              <h2 className="font-bold uppercase">Fonte do projeto:</h2>
              <span>
                {bill.source === "camara"
                  ? "Câmara dos Deputados"
                  : "Senado Federal"}
              </span>
            </div>
          )}
          {bill.presentation_date && (
            <div className="mt-4 w-full flex gap-2 bg-card mr-2 p-4 rounded-lg">
              <CalendarIcon />
              <h2 className="font-bold uppercase">Data de apresentação:</h2>
              <span>{formatDate(bill.presentation_date)}</span>
            </div>
          )}

          {bill.status && (
            <div className="mt-4 flex gap-2 border border-foreground mr-2 p-4 rounded-lg">
              <SyncIcon /> <h2 className="font-bold uppercase">Status:</h2>
              <span>{bill.status}</span>
            </div>
          )}
        </section>
      </div>
    </article>
  );
}

// ═══════════════════════════════════════════════════════════════
//  VARIANT 0f — Metadata Cards Grid (4 cards)
// ═══════════════════════════════════════════════════════════════

function Variant0f({ bill }: { bill: BillData }) {
  const s = STYLES[bill.classification];
  const pct = Math.round(bill.final_score! * 100);
  return (
    <article
      className={`rounded-xl border ${s.border} overflow-hidden hover:shadow-lg transition-shadow`}
    >
      <div className={`h-1.5 w-full ${s.bar}`} />
      <div className="p-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            {bill.bill_type} {bill.number}/{bill.year}
          </h1>
        </div>

        <div className="mb-5">
          <Badge classification={bill.classification} size="text-md" />
          <div aria-hidden="true">
            <div className="h-2 rounded-full bg-muted overflow-hidden mt-5">
              <div
                className={`h-full rounded-full ${s.bar}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-muted-foreground mt-1">
              <span>Favorável</span>
              <span>Prejudicial</span>
            </div>
          </div>
        </div>

        <div className={`mt-5 rounded-lg ${s.bg} border ${s.border} p-4`}>
          <h2
            className={`text-xs font-bold uppercase tracking-wider ${s.accent} mb-2`}
          >
            Análise de risco e impacto ecológico da proposta
          </h2>
          <p className="text-sm leading-relaxed">
            {labelFor(bill.classification)}
          </p>
        </div>

        <section className="my-6">
          <h2 className="text-xl font-bold mt-4 mb-2">Ementa</h2>
          <div className={`border-l-2 ${s.border} pl-4 mb-5`}>
            <p className="text-md text-muted-foreground leading-relaxed">
              {bill.ementa}
            </p>
          </div>
        </section>

        {/* METADATA CARDS GRID — 4 cards in 2×2 */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Status card — highlighted with full color */}
          <div className={`col-span-2 sm:col-span-1 rounded-lg bg-card p-4`}>
            <p className="text-[10px] uppercase tracking-wider text-white/80 mb-1 font-bold">
              Status
            </p>
            <p className="text-sm font-bold text-white">{bill.status}</p>
          </div>

          {/* Author card */}
          <div className="col-span-2 sm:col-span-1 rounded-lg bg-card p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              Autor
            </p>
            <p className="text-sm font-bold">{bill.author}</p>
            <p className="text-[11px] text-muted-foreground">
              {bill.author_party} · {bill.author_state}
            </p>
          </div>

          {/* Source card */}
          <div className="rounded-lg bg-card p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              Fonte
            </p>
            <p className="text-sm font-medium">
              {bill.source === "camara"
                ? "Câmara dos Deputados"
                : "Senado Federal"}
            </p>
          </div>

          {/* Date card */}
          <div className="rounded-lg bg-card p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              Data
            </p>
            <p className="text-sm font-medium">
              {formatDate(bill.presentation_date)}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full sm:w-auto"
          render={
            <a href={bill.link} target="_blank" rel="noopener noreferrer">
              Ver fonte original ↗
            </a>
          }
        />
      </div>
    </article>
  );
}

// ═══════════════════════════════════════════════════════════════
//  CAROUSEL
// ═══════════════════════════════════════════════════════════════

import { useState, type ReactNode } from "react";
import { CalendarIcon } from "lucide-react";

function Carousel({ items }: { items: { key: string; node: ReactNode }[] }) {
  const [idx, setIdx] = useState(0);

  return (
    <div>
      {/* Slide */}
      <div className="min-h-[300px]">{items[idx]?.node}</div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 mt-5">
        <button
          onClick={() => setIdx((i) => (i > 0 ? i - 1 : items.length - 1))}
          className="text-xs px-3 py-1.5 rounded-md border border-border hover:bg-muted transition-colors"
          aria-label="Anterior"
        >
          ← Anterior
        </button>

        <div className="flex gap-1.5">
          {items.map((item, i) => {
            const bill = BILLS[i]!;
            const s = STYLES[bill.classification];
            return (
              <button
                key={item.key}
                onClick={() => setIdx(i)}
                className={`w-7 h-7 rounded-full text-[10px] font-mono font-bold border transition-colors ${
                  i === idx
                    ? `${s.bar} text-white border-transparent`
                    : "border-border text-muted-foreground hover:border-muted-foreground"
                }`}
                aria-label={`Exemplo ${i + 1}: ${s.label}`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setIdx((i) => (i < items.length - 1 ? i + 1 : 0))}
          className="text-xs px-3 py-1.5 rounded-md border border-border hover:bg-muted transition-colors"
          aria-label="Próximo"
        >
          Próximo →
        </button>
      </div>

      {/* Label */}
      <p
        className={`text-center text-xs mt-2 ${STYLES[BILLS[idx]!.classification].accent}`}
      >
        {STYLES[BILLS[idx]!.classification].label}
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  PAGE
// ═══════════════════════════════════════════════════════════════

const BILLS = [
  FAVORABLE,
  NEEDS_REVIEW,
  UNFAVORABLE,
] as const satisfies BillData[];

export default function DesignExplorePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <nav className="mb-8">
        <Link
          href="/bills"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Voltar para a lista
        </Link>
        <h1 className="text-2xl font-bold mt-2">
          Explorar Layouts — Detalhe do PL
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Use as setas para alternar entre classificações. Cada variante mostra
          uma classificação por vez (como seria na página real).
        </p>
      </nav>

      {/* Variant 0 */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
            Variante 0
          </span>
          <h2 className="text-lg font-semibold">V4 + Horizontal Stat Bar</h2>
        </div>
        <div className="max-w-4xl mx-auto">
          <Carousel
            items={BILLS.map((b) => ({
              key: b.id,
              node: <Variant0 bill={b} />,
            }))}
          />
        </div>
      </section>

      <hr className="border-border mb-12" />

      {/* Variant 0a */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
            Variante 0a
          </span>
          <h2 className="text-lg font-semibold">
            Status Banner (full-width alert)
          </h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Status como banner colorido full-width. Autor, fonte e data em linha
          separada por ·
        </p>
        <div className="max-w-3xl mx-auto">
          <Carousel
            items={BILLS.map((b) => ({
              key: b.id,
              node: <Variant0a bill={b} />,
            }))}
          />
        </div>
      </section>

      <hr className="border-border mb-12" />

      {/* Variant 0b */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
            Variante 0b
          </span>
          <h2 className="text-lg font-semibold">
            Status + Autor — Cards Lado a Lado
          </h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Dois cards: Status (com pulsante + cor) e Autor (com avatar). Fonte e
          data como pills abaixo.
        </p>
        <div className="max-w-3xl mx-auto">
          <Carousel
            items={BILLS.map((b) => ({
              key: b.id,
              node: <Variant0b bill={b} />,
            }))}
          />
        </div>
      </section>

      <hr className="border-border mb-12" />

      {/* Variant 0c */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
            Variante 0c
          </span>
          <h2 className="text-lg font-semibold">
            Status com Barra de Acento + Linhas Rotuladas
          </h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Status com borda esquerda colorida (estilo ementa). Dados em linhas
          com labels fixos: AUTOR, FONTE, DATA.
        </p>
        <div className="max-w-3xl mx-auto">
          <Carousel
            items={BILLS.map((b) => ({
              key: b.id,
              node: <Variant0c bill={b} />,
            }))}
          />
        </div>
      </section>

      <hr className="border-border mb-12" />

      {/* Variant 0d */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
            Variante 0d
          </span>
          <h2 className="text-lg font-semibold">
            Footer Compacto (barra única)
          </h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Tudo numa barra horizontal: status pill colorido · autor · fonte ·
          data · botão link.
        </p>
        <div className="max-w-3xl mx-auto">
          <Carousel
            items={BILLS.map((b) => ({
              key: b.id,
              node: <Variant0d bill={b} />,
            }))}
          />
        </div>
      </section>

      <hr className="border-border mb-12" />

      {/* Variant 0e */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
            Variante 0e
          </span>
          <h2 className="text-lg font-semibold">
            Status em Destaque (antes da ementa)
          </h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Status movido para cima, logo após a classificação, com fundo
          gradiente e indicador pulsante.
        </p>
        <div className="max-w-3xl mx-auto">
          <Carousel
            items={BILLS.map((b) => ({
              key: b.id,
              node: <Variant0e bill={b} />,
            }))}
          />
        </div>
      </section>

      <hr className="border-border mb-12" />

      {/* Variant 0f */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
            Variante 0f
          </span>
          <h2 className="text-lg font-semibold">
            Grid de Cards (2×2 metadados)
          </h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Status, Autor, Fonte e Data em cards separados num grid 2×2. Card de
          Status com fundo sólido colorido.
        </p>
        <div className="max-w-3xl mx-auto">
          <Carousel
            items={BILLS.map((b) => ({
              key: b.id,
              node: <Variant0f bill={b} />,
            }))}
          />
        </div>
      </section>

      {/* Variant 1 */}
      {/* <section className="mb-12">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
            Variante 1
          </span>
          <h2 className="text-lg font-semibold">Gradient Hero</h2>
        </div>
        <div className="max-w-4xl mx-auto">
          <Carousel
            items={BILLS.map((b) => ({
              key: b.id,
              node: <Variant1 bill={b} />,
            }))}
          />
        </div>
      </section>

      <hr className="border-border mb-12" /> */}

      {/* Variant 2 */}
      {/* <section className="mb-12">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
            Variante 2
          </span>
          <h2 className="text-lg font-semibold">Vibrant Accents</h2>
        </div>
        <div className="max-w-4xl mx-auto">
          <Carousel
            items={BILLS.map((b) => ({
              key: b.id,
              node: <Variant2 bill={b} />,
            }))}
          />
        </div>
      </section>

      <hr className="border-border mb-12" /> */}

      {/* Variant 3 */}
      {/* <section className="mb-12">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
            Variante 3
          </span>
          <h2 className="text-lg font-semibold">Immersive Color Blocks</h2>
        </div>
        <div className="max-w-4xl mx-auto">
          <Carousel
            items={BILLS.map((b) => ({
              key: b.id,
              node: <Variant3 bill={b} />,
            }))}
          />
        </div>
      </section>

      <hr className="border-border mb-12" /> */}

      {/* Variant 4 */}
      {/* <section className="mb-12">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
            Variante 4
          </span>
          <h2 className="text-lg font-semibold">
            V2 Header + V3 Score + Inline Meta
          </h2>
        </div>
        <div className="max-w-4xl mx-auto">
          <Carousel
            items={BILLS.map((b) => ({
              key: b.id,
              node: <Variant4 bill={b} />,
            }))}
          />
        </div>
      </section>

      <hr className="border-border mb-12" /> */}

      {/* Variant 5 */}
      {/* <section className="mb-12">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
            Variante 5
          </span>
          <h2 className="text-lg font-semibold">
            V4 + Metadata Grid (2×2 cards)
          </h2>
        </div>
        <div className="max-w-4xl mx-auto">
          <Carousel
            items={BILLS.map((b) => ({
              key: b.id,
              node: <Variant5 bill={b} />,
            }))}
          />
        </div>
      </section>

      <hr className="border-border mb-12" /> */}

      {/* Variant 7 */}
      {/* <section className="mb-12">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
            Variante 7
          </span>
          <h2 className="text-lg font-semibold">Classificação em Destaque</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Hero da classificação no topo, seguido de título, ementa, e grid com
          autor e status.
        </p>
        <div className="max-w-3xl mx-auto">
          <Carousel
            items={BILLS.map((b) => ({
              key: b.id,
              node: <Variant7 bill={b} />,
            }))}
          />
        </div>
      </section>

      <hr className="border-border mb-12" /> */}

      {/* Variant 8 */}
      {/* <section className="mb-12">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
            Variante 8
          </span>
          <h2 className="text-lg font-semibold">Cartões Empilhados</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Cada seção em seu próprio cartão: identificação, ementa, classificação
          e metadados.
        </p>
        <div className="max-w-3xl mx-auto">
          <Carousel
            items={BILLS.map((b) => ({
              key: b.id,
              node: <Variant8 bill={b} />,
            }))}
          />
        </div>
      </section>

      <hr className="border-border mb-12" /> */}

      {/* Variant 9 */}
      {/* <section className="mb-12">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
            Variante 9
          </span>
          <h2 className="text-lg font-semibold">Layout com Sidebar</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Conteúdo principal à esquerda, sidebar à direita com autor, status,
          fonte e link.
        </p>
        <div className="max-w-5xl mx-auto">
          <Carousel
            items={BILLS.map((b) => ({
              key: b.id,
              node: <Variant9 bill={b} />,
            }))}
          />
        </div>
      </section>

      <hr className="border-border mb-12" /> */}

      {/* Variant 10 */}
      {/* <section className="mb-12">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
            Variante 10
          </span>
          <h2 className="text-lg font-semibold">Hero com Métricas</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Banner colorido com título + percentual, ementa, barra de
          classificação e grid de métricas.
        </p>
        <div className="max-w-3xl mx-auto">
          <Carousel
            items={BILLS.map((b) => ({
              key: b.id,
              node: <Variant10 bill={b} />,
            }))}
          />
        </div>
      </section>

      <hr className="border-border mb-12" /> */}

      {/* Variant 11 */}
      {/* <section className="mb-12">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
            Variante 11
          </span>
          <h2 className="text-lg font-semibold">Destaque Tipográfico</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Foco na tipografia: título grande, ementa com borda lateral, status
          destacado e classificação.
        </p>
        <div className="max-w-3xl mx-auto">
          <Carousel
            items={BILLS.map((b) => ({
              key: b.id,
              node: <Variant11 bill={b} />,
            }))}
          />
        </div>
      </section>

      <hr className="border-border mb-12" /> */}

      {/* Variant 12 */}
      {/* <section className="mb-12">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
            Variante 12
          </span>
          <h2 className="text-lg font-semibold">Tela Dividida</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Classificação gigante à esquerda, conteúdo (ementa + metadados) à
          direita.
        </p>
        <div className="max-w-5xl mx-auto">
          <Carousel
            items={BILLS.map((b) => ({
              key: b.id,
              node: <Variant12 bill={b} />,
            }))}
          />
        </div>
      </section>

      <hr className="border-border mb-12" /> */}

      {/* Variant 13 */}
      {/* <section className="mb-12">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
            Variante 13
          </span>
          <h2 className="text-lg font-semibold">Cartão Expandido</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Cartão único com header colorido, barra de classificação, ementa e
          grid de metadados.
        </p>
        <div className="max-w-3xl mx-auto">
          <Carousel
            items={BILLS.map((b) => ({
              key: b.id,
              node: <Variant13 bill={b} />,
            }))}
          />
        </div>
      </section> */}

      {/* <hr className="border-border mb-12" /> */}

      {/* Variant 14 */}
      {/* <section className="mb-12">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
            Variante 14
          </span>
          <h2 className="text-lg font-semibold">Painel Completo</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Dashboard completo: ementa + classificação lado a lado, métricas em
          grid abaixo.
        </p>
        <div className="max-w-5xl mx-auto">
          <Carousel
            items={BILLS.map((b) => ({
              key: b.id,
              node: <Variant14 bill={b} />,
            }))}
          />
        </div>
      </section>

      <hr className="border-border mb-12" /> */}

      {/* Variant 15 */}
      {/* <section className="mb-12">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
            Variante 15
          </span>
          <h2 className="text-lg font-semibold">Linha do Tempo Legislativa</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Timeline vertical: classificação → título/ementa → autor → status →
          link. Nós coloridos marcam os pontos críticos.
        </p>
        <div className="max-w-3xl mx-auto">
          <Carousel
            items={BILLS.map((b) => ({
              key: b.id,
              node: <Variant15 bill={b} />,
            }))}
          />
        </div>
      </section>

      <hr className="border-border mb-12" /> */}

      {/* Variant 16 */}
      {/* <section className="mb-12">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
            Variante 16
          </span>
          <h2 className="text-lg font-semibold">Ficha Técnica</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Estilo &ldquo;datasheet&rdquo;: header institucional, linhas de
          especificação com labels, classificação e status com cor de fundo.
        </p>
        <div className="max-w-3xl mx-auto">
          <Carousel
            items={BILLS.map((b) => ({
              key: b.id,
              node: <Variant16 bill={b} />,
            }))}
          />
        </div>
      </section>

      <hr className="border-border mb-12" /> */}

      {/* Variant 17 */}
      {/* <section className="mb-12">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
            Variante 17
          </span>
          <h2 className="text-lg font-semibold">Resumo Executivo</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Briefing executivo: faixa superior com facts, em seguida ementa, caixa
          de veredito com score e footer com autor + status.
        </p>
        <div className="max-w-3xl mx-auto">
          <Carousel
            items={BILLS.map((b) => ({
              key: b.id,
              node: <Variant17 bill={b} />,
            }))}
          />
        </div>
      </section>

      <hr className="border-border mb-12" /> */}

      {/* Variant 18 */}
      {/* <section className="mb-12">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
            Variante 18
          </span>
          <h2 className="text-lg font-semibold">Dossiê</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Estilo pasta/dossiê: aba colorida com fonte + data, selo de
          classificação rotacionado, ementa como documento.
        </p>
        <div className="max-w-3xl mx-auto">
          <Carousel
            items={BILLS.map((b) => ({
              key: b.id,
              node: <Variant18 bill={b} />,
            }))}
          />
        </div>
      </section>

      <hr className="border-border mb-12" />

      {/* Variant 19 */}
      {/* <section className="mb-12">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
            Variante 19
          </span>
          <h2 className="text-lg font-semibold">Infográfico</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Estilo infográfico: barra gradiente com indicador de posição,
          percentual grande, cards com ícones para autor e status.
        </p>
        <div className="max-w-3xl mx-auto">
          <Carousel
            items={BILLS.map((b) => ({
              key: b.id,
              node: <Variant19 bill={b} />,
            }))}
          />
        </div>
      </section>

      <hr className="border-border mb-12" /> */}

      {/* Variant 20 */}
      {/* <section className="mb-12">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
            Variante 20
          </span>
          <h2 className="text-lg font-semibold">Zonas de Impacto</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          &ldquo;Onde este PL se situa?&rdquo; — 3 zonas coloridas
          (favorável/revisão/prejudicial) com marcador de posição preciso.
        </p>
        <div className="max-w-3xl mx-auto">
          <Carousel
            items={BILLS.map((b) => ({
              key: b.id,
              node: <Variant20 bill={b} />,
            }))}
          />
        </div>
      </section>

      <hr className="border-border mb-12" />

      {/* Variant 21 */}
      {/* <section className="mb-12">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
            Variante 21
          </span>
          <h2 className="text-lg font-semibold">Cartão de Impacto</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Banner de impacto colorido com label (BAIXO/ALTO IMPACTO), percentual,
          ementa, autor e status lado a lado.
        </p>
        <div className="max-w-3xl mx-auto">
          <Carousel
            items={BILLS.map((b) => ({
              key: b.id,
              node: <Variant21 bill={b} />,
            }))}
          />
        </div>
      </section>

      <hr className="border-border mb-12" />

      {/* Variant 22 */}
      {/* <section className="mb-12">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
            Variante 22
          </span>
          <h2 className="text-lg font-semibold">Destaque Legislativo</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Painel lateral com score circular + conteúdo principal. Avatar do
          autor, status com indicador pulsante, link.
        </p>
        <div className="max-w-5xl mx-auto">
          <Carousel
            items={BILLS.map((b) => ({
              key: b.id,
              node: <Variant22 bill={b} />,
            }))}
          />
        </div>
      </section> */}
    </div>
  );
}
