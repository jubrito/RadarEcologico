import type { VotacaoEvent } from "@/lib/api";
import { formatDate } from "@/lib/utils/utils";

function voteStyle(voto: string): string {
  if (voto === "Sim") return "text-emerald-400";
  if (voto === "Não") return "text-red-400";
  return "text-muted-foreground";
}

interface VotacoesProps {
  votacoes: VotacaoEvent[];
}

export function Votacoes({ votacoes }: VotacoesProps) {
  if (votacoes.length === 0) return null;

  return (
    <section aria-label="Votações" className="mt-7">
      <h2 className="text-xl font-bold mb-4">Votações</h2>
      <div className="space-y-5">
        {votacoes.map((votacao, index) => (
          <div
            key={`${votacao.date}-${index}`}
            className="rounded-lg border border-border p-4"
          >
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <time
                dateTime={votacao.date}
                className="text-xs font-bold uppercase tracking-wide text-foreground"
              >
                {formatDate(votacao.date)}
              </time>
              {votacao.orgao && (
                <span className="text-xs text-muted-foreground">
                  {votacao.orgao}
                </span>
              )}
              <span
                className={`text-xs font-semibold ${
                  votacao.aprovado ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {votacao.aprovado ? "Aprovado" : "Rejeitado"}
              </span>
            </div>

            {votacao.description && (
              <p className="text-sm text-muted-foreground mb-3">
                {votacao.description}
              </p>
            )}

            {votacao.orientacoes.length > 0 && (
              <ul className="flex flex-wrap gap-2" aria-label="Orientação por partido">
                {votacao.orientacoes.map((o) => (
                  <li
                    key={o.partido}
                    className="rounded-full border border-border px-2 py-0.5 text-xs"
                  >
                    <span className="font-semibold">{o.partido}</span>
                    <span className={`ml-1 ${voteStyle(o.voto)}`}>{o.voto}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
