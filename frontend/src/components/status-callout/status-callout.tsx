import {
  ArrowRightIcon,
  CheckIcon,
  InfoIcon,
  LoaderIcon,
  RefreshCw,
} from "lucide-react";
import { getStatusInfo, type TramitacaoPhase } from "@/lib/status";

const PHASES: { key: TramitacaoPhase; label: string }[] = [
  { key: "apresentacao", label: "Apresentação" },
  { key: "comissao", label: "Comissão" },
  { key: "plenario", label: "Plenário" },
  { key: "sancao", label: "Sanção" },
];

function phaseIndex(phase: TramitacaoPhase): number {
  return PHASES.findIndex((p) => p.key === phase);
}

function chipStyle(status: "done" | "current" | "future") {
  if (status === "done") {
    return "text-xs font-semibold text-foreground border border-foreground py-0.5 px-2 rounded-xl flex items-center gap-1";
  }
  if (status === "current") {
    return "text-xs font-extrabold text-foreground border border-foreground py-0.5 px-2 rounded-xl flex items-center gap-1";
  }
  return "text-xs font-semibold text-muted-foreground border border-muted-foreground py-0.5 px-2 rounded-xl flex items-center gap-1";
}

function PhaseChip({
  label,
  status,
}: {
  label: string;
  status: "done" | "current" | "future";
}) {
  return (
    <span className={chipStyle(status)}>
      {status === "done" && <CheckIcon size={12} className="text-foreground" />}
      {status === "current" && (
        <LoaderIcon size={12} className="text-foreground" />
      )}
      {label}
    </span>
  );
}

interface StatusCalloutProps {
  status: string;
}

export function StatusCallout({ status }: StatusCalloutProps) {
  const info = getStatusInfo(status);
  const currentIdx = info ? phaseIndex(info.phase) : -1;

  return (
    <div className="flex gap-3 p-4 rounded-l-lg rounded-lg bg-card/50">
      <RefreshCw className="w-5 h-5 mt-0.5 text-muted-foreground shrink-0" />
      <div className="w-full">
        <h2 className="font-bold uppercase text-sm">Status do projeto</h2>
        <p className="text-sm mt-0.5 text-muted-foreground">{status}</p>

        <div className="my-3 mb-4 flex items-center gap-1 text-sm text-muted-foreground">
          {PHASES.map((p, i) => (
            <span key={p.key} className="flex items-center gap-1">
              <PhaseChip
                label={p.label}
                status={
                  currentIdx < 0
                    ? "future"
                    : i < currentIdx
                      ? "done"
                      : i === currentIdx
                        ? "current"
                        : "future"
                }
              />
              {i < PHASES.length - 1 && (
                <span className="text-muted-foreground px-1">
                  <ArrowRightIcon
                    size={20}
                    className={
                      i < currentIdx
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }
                  />
                </span>
              )}
            </span>
          ))}
        </div>

        {info && (
          <div className="flex flex-row px-4 py-3 rounded text-xs bg-card text-muted-foreground bg-foreground/6 rounded-lg">
            <InfoIcon size={16} className="mr-2 shrink-0" />
            <div>
              <span className="font-bold mr-1 inline-block">
                Interpretação:
              </span>
              {info.explanation}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
