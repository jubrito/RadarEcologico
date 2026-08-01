import { SITE_TITLE, SITE_SUBTITLE, SITE_DESCRIPTION } from "@/lib/content";

type HeroProps = {
  /** Tamanho do título — "lg" (dashboard) ou "sm" (erro). Default: "lg". */
  size?: "lg" | "sm";
  className?: string;
};

export function Hero({ size = "lg", className = "" }: HeroProps) {
  const isLg = size === "lg";

  return (
    <section className={className}>
      <h1
        className={`font-bold mb-3 font-boring-time ${
          isLg ? "text-5xl" : "text-3xl"
        }`}
      >
        {SITE_TITLE}
      </h1>
      <p
        className={`text-foreground/80 mb-2 ${
          isLg ? "text-xl max-w-3xl" : "text-lg"
        }`}
      >
        {SITE_SUBTITLE}
      </p>
      <p className="text-muted-foreground max-w-2xl">{SITE_DESCRIPTION}</p>
    </section>
  );
}
