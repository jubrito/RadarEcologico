import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ClassificationBadge } from "@/components/classification-badge";
import { Bill } from "@/lib/api";
import { formatSource, formatDate } from "@/lib/utils";

export function BillCard({ bill }: { bill: Bill }) {
  return (
    <Link href={`/bills/${bill.id}`}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base font-medium leading-snug">
              {bill.bill_type} {bill.number}/{bill.year}
            </CardTitle>
            {bill.classification && (
              <ClassificationBadge
                classification={bill.classification}
                score={bill.final_score}
              />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-3 mb-2">
            {bill.ementa}
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{formatSource(bill.source)}</span>
            {bill.author && (
              <>
                <span aria-hidden="true">·</span>
                <span>{bill.author}</span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <time dateTime={bill.presentation_date || undefined}>
              {formatDate(bill.presentation_date)}
            </time>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
