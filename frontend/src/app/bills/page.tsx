import { Suspense } from "react";
import { BillsContent } from "./bills-content";
import { Skeleton } from "@/components/ui/skeleton";

export default function BillsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 font-boring-time">
        Projetos de Lei
      </h1>
      <Suspense
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        }
      >
        <BillsContent />
      </Suspense>
    </div>
  );
}
