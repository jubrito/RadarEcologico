import type { TramitacaoEvent } from "@/lib/api";
import { formatDate } from "@/lib/utils/utils";

interface TimelineProps {
  events: TramitacaoEvent[];
}

export function Timeline({ events }: TimelineProps) {
  if (events.length === 0) return null;

  return (
    <section aria-label="Linha do tempo da tramitação" className="mt-7">
      <h2 className="text-xl font-bold mb-4">Tramitação</h2>
      <ol className="relative space-y-5 border-l border-border pl-5">
        {events.map((event, index) => (
          <li key={`${event.date}-${index}`} className="relative">
            <span
              aria-hidden="true"
              className="absolute -left-[27px] top-1.5 h-2.5 w-2.5 rounded-full bg-muted-foreground"
            />
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
          </li>
        ))}
      </ol>
    </section>
  );
}
