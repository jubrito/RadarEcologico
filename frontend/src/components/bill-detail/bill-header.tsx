import { Button } from "@/components/ui/button";
import type { Bill } from "@/lib/api";

export function BillHeader({ bill }: { bill: Bill }) {
  return (
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <h1 className="text-2xl font-bold">
        {bill.bill_type} {bill.number}/{bill.year}
      </h1>
      <Button
        variant="outline"
        size="sm"
        className="order-first flex-shrink-0 sm:order-none"
        render={
          <a href={bill.link} target="_blank" rel="noopener noreferrer">
            Ver fonte original ↗
          </a>
        }
      />
    </header>
  );
}
