import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: number;
  description: string;
  variant: "favorable" | "needs_review" | "unfavorable";
}

const variantClasses: Record<StatCardProps["variant"], string> = {
  favorable: "border-emerald-600/30 bg-emerald-950/30",
  needs_review: "border-amber-500/30 bg-amber-950/30",
  unfavorable: "border-red-600/30 bg-red-950/30",
};

const variantTextClasses: Record<StatCardProps["variant"], string> = {
  favorable: "text-emerald-400",
  needs_review: "text-amber-400",
  unfavorable: "text-red-400",
};

export function StatCard({ title, value, description, variant }: StatCardProps) {
  return (
    <Card className={variantClasses[variant]}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <span
          className={`text-3xl font-bold tabular-nums ${variantTextClasses[variant]}`}
          aria-label={`${value} ${description}`}
        >
          {value}
        </span>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}
