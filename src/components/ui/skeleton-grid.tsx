import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface SkeletonGridProps {
  /** Number of skeleton items to display */
  count?: number;
  /** Grid columns configuration (Tailwind classes) */
  columns?: string;
  /** Gap between grid items (Tailwind classes) */
  gap?: string;
  /** Custom skeleton component to render */
  skeleton?: ReactNode;
  /** Custom className for the grid container */
  className?: string;
}

/**
 * Reusable skeleton grid component for loading states
 * @example
 * <SkeletonGrid count={6} columns="grid-cols-1 md:grid-cols-3" />
 * <SkeletonGrid count={4} skeleton={<CustomSkeleton />} />
 */
export function SkeletonGrid({
  count = 6,
  columns = "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  gap = "gap-8",
  skeleton,
  className,
}: SkeletonGridProps) {
  const defaultSkeleton = (
    <div className="space-y-4 animate-pulse">
      <div className="aspect-square bg-muted rounded-lg" />
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-1/2" />
      </div>
    </div>
  );

  return (
    <div className={cn("grid", columns, gap, className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>{skeleton || defaultSkeleton}</div>
      ))}
    </div>
  );
}
