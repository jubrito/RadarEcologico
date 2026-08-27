import type { TramitacaoEvent } from "@/lib/api";
import { formatDate } from "@/lib/utils/utils";

interface TimelineProps {
  events: TramitacaoEvent[];
}

export function Timeline({ events }: TimelineProps) {
  if (events.length === 0) return null;

  const ordered = [...events].reverse();

  return (
    <section aria-label="Linha do tempo da tramitação" className="mt-7">
      <h2 className="text-xl font-bold mb-4">Tramitação</h2>
      <ol>
        {ordered.map((event, index) => {
          const isCurrent = index === 0;
          const isLast = index === ordered.length - 1;
          return (
            <li key={`${event.date}-${index}`} className="flex gap-4">
              <div aria-hidden="true" className="flex flex-col items-center">
                <span
                  className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                    isCurrent
                      ? "bg-foreground ring-4 ring-foreground/20"
                      : "bg-muted-foreground/50"
                  }`}
                />
                {!isLast && <span className="w-px flex-1 bg-border" />}
              </div>
              <div className={isLast ? "" : "pb-6"}>
                {isCurrent && (
                  <p className="text-xs font-bold uppercase tracking-wide text-blue-400">
                    Situação atual
                  </p>
                )}
                <time
                  dateTime={event.date}
                  className="block text-xs font-bold uppercase tracking-wide text-foreground"
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
