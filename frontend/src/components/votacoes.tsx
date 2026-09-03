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

  return (
    <section
      aria-label="Votações"
      className="overflow-hidden rounded-xl border border-border bg-card/40"
    >
      <header className="flex items-center justify-between gap-4 border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground/10 text-foreground">
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

      <ul className="space-y-2 p-3">
        {[votacoes[0], votacoes[0]].map((votacao, index) => {
          const statusTextColor = votacao.aprovado
            ? "text-foreground"
            : "text-muted-foreground";

          return (
            <li key={`${votacao.date}-${index}`}>
              <article className="rounded-md border border-border/80 bg-background/30 px-3 py-2.5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {votacao.aprovado ? (
                      <CheckCircle2Icon
                        size={17}
                        className={statusTextColor}
                        aria-hidden="true"
                      />
                    ) : (
                      <XCircleIcon
                        size={17}
                        className={statusTextColor}
                        aria-hidden="true"
                      />
                    )}
                    <span className={`text-sm font-bold ${statusTextColor}`}>
                      {votacao.aprovado ? "Aprovado" : "Rejeitado"}
                    </span>
                  </div>

                  <time
                    dateTime={votacao.date}
                    className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground"
                  >
                    <CalendarDaysIcon size={13} aria-hidden="true" />
                    {formatDate(votacao.date)}
                  </time>
                </div>

                {(votacao.orgao || votacao.description) && (
                  <div className="mt-2 border-t border-border/70 pt-2">
                    {votacao.orgao && (
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {votacao.orgao}
                      </p>
                    )}
                    {votacao.description && (
                      <p className="mt-1 text-xs leading-relaxed text-foreground/80">
                        {votacao.description}
                      </p>
                    )}
                  </div>
                )}

                {votacao.orientacoes.length > 0 && (
                  <ul
                    className="mt-2 flex flex-wrap gap-1.5 border-t border-border/70 pt-2"
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
