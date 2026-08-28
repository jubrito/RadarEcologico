import { Suspense } from "react";
import { BillsContent } from "./bills-content";
import { Skeleton } from "@/components/ui/skeleton";

export default function BillsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-5xl font-bold">Projetos de Lei</h1>
      <p className="text-foreground/80 my-2 text-xl max-w-4xl">
        PLs da Câmara dos Deputados e do Senado Federal
      </p>
      <p className="text-muted-foreground max-w-3xl mb-6">
        Dashboard de projetos de 2026: encontre um PL ao buscar o seu conteúdo
        ou filtrá-lo por classificação, fonte ou tema.
      </p>
      <Suspense
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-xl bg-foreground/10" />
            ))}
          </div>
        }
      >
        <BillsContent />
      </Suspense>
    </div>
  );
}
