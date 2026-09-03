import type { VotacaoEvent } from "@/lib/api";
import { formatDate } from "@/lib/utils/utils";
import {
  CalendarDaysIcon,
  CheckCircle2Icon,
  LandmarkIcon,
  XCircleIcon,
} from "lucide-react";

function voteStyle(voto: string): string {
  if (voto === "Sim") return "text-foreground";
  if (voto === "Não") return "text-muted-foreground";
  return "text-muted-foreground/70";
}

interface VotacoesProps {
  votacoes: VotacaoEvent[];
}

export function Votacoes({ votacoes }: VotacoesProps) {
  if (votacoes.length === 0) return null;
  const ordered = [...votacoes].reverse();
  return (
    <section
      aria-label="Votações"
      className="overflow-hidden rounded-xl border border-border"
    >
      <header className="flex items-center justify-between gap-4 border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-foreground/10 text-foreground">
            <LandmarkIcon size={16} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-base font-bold leading-tight">Votações</h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Registro das deliberações
            </p>
          </div>
        </div>
        <span className="rounded-full border border-border px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
          {votacoes.length} {votacoes.length === 1 ? "votação" : "votações"}
        </span>
      </header>

      <ul className="flex items-start overflow-x-auto p-4 pl-3 pb-5">
        {ordered.map((votacao, index) => {
          const isLast = index === votacoes.length - 1;

          return (
            <li
              key={`${votacao.date}-${index}`}
              className="flex max-w-fit min-w-fit flex-1 flex-col"
            >
              <div aria-hidden="true" className="flex items-center">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-around rounded-full bg-background text-muted-foreground"}`}
                >
                  {votacao.aprovado && (
                    <CheckCircle2Icon size={17} aria-hidden="true" />
                  )}
                  {!votacao.aprovado && (
                    <XCircleIcon size={17} aria-hidden="true" />
                  )}
                </span>
                <span className="text-sm">
                  {votacao.aprovado ? "Aprovado" : "Rejeitado"}
                </span>
                {!isLast && <span className="h-px flex-1 bg-border" />}
              </div>

              <article
                className="pr-10 ml-3"
                aria-label={votacao.aprovado ? "Aprovado" : "Rejeitado"}
              >
                <time
                  dateTime={votacao.date}
                  className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground"
                >
                  <CalendarDaysIcon size={13} aria-hidden="true" />
                  {formatDate(votacao.date)}
                </time>

                {(votacao.orgao || votacao.description) && (
                  <div className="mt-2 space-y-1">
                    {votacao.orgao && (
                      <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {votacao.orgao}
                      </p>
                    )}
                    {votacao.description && (
                      <p className="text-xs leading-relaxed text-foreground/80">
                        {votacao.description}
                      </p>
                    )}
                  </div>
                )}

                {votacao.orientacoes.length > 0 && (
                  <ul
                    className="mt-3 flex flex-wrap gap-1.5"
                    aria-label="Orientação por partido"
                  >
                    {votacao.orientacoes.map((o) => (
                      <li
                        key={o.partido}
                        className="rounded border border-border bg-background/50 px-2 py-0.5 text-[11px]"
                      >
                        <span className="font-bold">{o.partido}</span>
                        <span className={`ml-1.5 ${voteStyle(o.voto)}`}>
                          {o.voto}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
