import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STYLE_MAP } from "@/lib/style";
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
  const style = STYLE_MAP[variant];

  return (
    <Card className={style.fadedBg}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <span
          className={`text-3xl font-bold tabular-nums ${style.textAccent}`}
          aria-label={`${value} ${description}`}
        >
          {value}
        </span>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}
