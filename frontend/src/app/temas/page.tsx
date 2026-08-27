import Link from "next/link";
import {
  CAMARA_TEMA_REFERENCE_URL,
  SENADO_CLASSES_URL,
  THEME_DESCRIPTIONS,
  sortedThemeEntries,
} from "@/lib/themes";

export default function TemasPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-5xl font-bold">Temas climáticos</h1>
      <p className="text-foreground/80 my-2 text-xl max-w-4xl">
        Como classificamos os projetos de lei por tema
      </p>
      <p className="text-muted-foreground max-w-3xl mb-6">
        Cada PL é associado a um ou mais temas climáticos. Os temas são uma
        reconciliação entre a
        <a
          href={CAMARA_TEMA_REFERENCE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mr-1 text-muted-foreground hover:text-foreground underline underline-offset-2"
        >
          referência de temas da Câmara dos Deputados ↗
        </a>
        e a &ldquo;Classificação Temática Unificada&rdquo; do Senado Federal.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedThemeEntries().map(([id, name]) => (
          <Link
            key={id}
            href={`/bills?theme=${id}`}
            className="group rounded-xl border border-border bg-card p-5 transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            <h2 className="font-bold mb-2 group-hover:text-primary">{name}</h2>
            <p className="text-sm text-muted-foreground">
              {THEME_DESCRIPTIONS[id] ?? "Sem descrição."}
            </p>
            <span className="inline-block text-xs text-muted-foreground mt-3 group-hover:text-foreground">
              Ver projetos →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
