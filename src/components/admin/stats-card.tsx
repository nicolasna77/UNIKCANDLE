import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Minus, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  badge?: {
    text: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
  };
  className?: string;
  loading?: boolean;
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  loading = false,
}: StatsCardProps) {
  if (loading) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
          <Skeleton className="h-7 w-20 mb-1.5" />
          <Skeleton className="h-3 w-28" />
        </CardContent>
      </Card>
    );
  }

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value > 0)
      return <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />;
    if (trend.value < 0)
      return <TrendingDown className="h-3.5 w-3.5 text-destructive" />;
    return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
  };

  const getTrendColor = () => {
    if (!trend) return "";
    if (trend.value > 0) return "text-emerald-600";
    if (trend.value < 0) return "text-destructive";
    return "text-muted-foreground";
  };

  return (
    <Card
      className={cn(
        "overflow-hidden border border-border transition-shadow hover:shadow-sm",
        className
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <p className="text-sm font-medium text-muted-foreground leading-none">
            {title}
          </p>
          {Icon && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 shrink-0">
              <Icon className="h-4 w-4 text-primary" />
            </div>
          )}
        </div>

        <div className="space-y-1">
          <div className="text-2xl font-bold tracking-tight text-foreground">
            {value}
          </div>

          <div className="flex items-center gap-1.5">
            {trend && (
              <div className="flex items-center gap-1">
                {getTrendIcon()}
                <span className={cn("text-xs font-medium", getTrendColor())}>
                  {trend.value > 0 ? "+" : ""}
                  {trend.value}%
                </span>
              </div>
            )}
            {description && (
              <p className="text-xs text-muted-foreground">
                {trend ? `· ${description}` : description}
              </p>
            )}
          </div>

          {trend && (
            <p className="text-xs text-muted-foreground">{trend.label}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
