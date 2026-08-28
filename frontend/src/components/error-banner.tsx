import { TriangleAlert } from "lucide-react";

interface ErrorBannerProps {
  /** User-facing message. Defaults to a generic server error message. */
  message?: string;
  /** Optional technical detail (e.g. the raw error) shown below the message. */
  detail?: string | null;
  /** Extra classes for layout (e.g. margins). */
  className?: string;
}

const DEFAULT_MESSAGE =
  "Não foi possível carregar essa página devido a um erro no servidor. Tente novamente mais tarde.";

export function ErrorBanner({
  message = DEFAULT_MESSAGE,
  detail,
  className = "",
}: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className={`flex w-fit items-start gap-3 rounded-lg bg-pink-950/70 p-3 text-foreground ${className}`}
    >
      <TriangleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
      <div>
        <p>{message}</p>
        {detail && (
          <p className="mt-1 text-sm text-foreground/80 italic">{detail}</p>
        )}
      </div>
    </div>
  );
}
