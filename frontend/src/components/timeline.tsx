import type { TramitacaoEvent } from "@/lib/api";
import { formatDate } from "@/lib/utils/utils";
import { RotateCcwClockIcon } from "lucide-react";

interface TimelineProps {
  events: TramitacaoEvent[];
}

export function Timeline({ events }: TimelineProps) {
  if (events.length === 0) return null;

  const ordered = [...events].reverse();

  return (
    <section
      aria-label="Linha do tempo da tramitação"
      className="rounded-lg border border-border"
    >
      <header className="flex items-center justify-between gap-4 border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-foreground/10 text-foreground">
            <RotateCcwClockIcon size={16} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-base font-bold leading-tight">Tramitação</h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Caminho que a proposta percorre dentro do poder legislativo até
              virar lei ou ser arquivada.
            </p>
          </div>
        </div>
      </header>

      <ol className="flex items-start overflow-x-auto p-5 scroll-smooth scrollbar-thumb-muted-foreground scrollbar-track-transparent scrollbar-thin ">
        {ordered.map((event, index) => {
          const isCurrent = index === 0;
          const isLast = index === ordered.length - 1;
          return (
            <li
              key={`${event.date}-${index}`}
              className="min-w-[220px] flex-1 flex flex-col"
            >
              <div aria-hidden="true" className="flex items-center">
                <span
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                    isCurrent
                      ? "bg-foreground ring-4 ring-foreground/20"
                      : "bg-muted-foreground/50"
                  }`}
                />
                {!isLast && <span className="h-px flex-1 bg-border" />}
              </div>
              <div className="mt-3 pr-4">
                {isCurrent && (
                  <p className="text-sm font-bold uppercase tracking-wide text-white mb-1">
                    Situação atual
                  </p>
                )}
                <time
                  dateTime={event.date}
                  className="block text-xs font-bold uppercase tracking-wide text-muted-foreground"
                >
                  {formatDate(event.date)}
                </time>
                <p className="text-sm text-muted-foreground mt-1">
                  {event.description}
                </p>
                {event.orgao && (
                  <p className="text-xs text-muted-foreground/70 mt-0.5">
                    {event.orgao}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
