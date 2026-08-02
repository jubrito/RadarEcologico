import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { COLORS, shade } from "@/lib/style";
import type { Classification } from "@/lib/api";

interface StatCardProps {
  title: string;
  value: number;
  description: string;
  variant: Classification;
}

export function StatCard({
  title,
  value,
  description,
  variant,
}: StatCardProps) {
  const c = COLORS[variant];

  return (
    <Card
      className={cn(`border-${shade(c, 600)}/30`, `bg-${shade(c, 950)}/30`)}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <span
          className={`text-3xl font-bold tabular-nums text-${shade(c, 400)}`}
          aria-label={`${value} ${description}`}
        >
          {value}
        </span>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}
