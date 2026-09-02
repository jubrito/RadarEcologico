import type { TramitacaoEvent } from "@/lib/api";
import { formatDate } from "@/lib/utils/utils";

interface TimelineProps {
  events: TramitacaoEvent[];
}

export function Timeline({ events }: TimelineProps) {
  if (events.length === 0) return null;

  const ordered = [...events].reverse();

  return (
    <section
      aria-label="Linha do tempo da tramitação"
      className="rounded-lg border border-border p-5"
    >
      <h2 className="text-xl font-bold mb-3">Tramitação</h2>
      <ol className="flex items-start overflow-x-auto pb-4">
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
