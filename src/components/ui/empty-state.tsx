import { PackageOpen } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface EmptyStateProps {
  /** Title */
  title: string;
  /** Description */
  description?: string;
  /** Action button callback */
  onAction?: () => void;
  /** Action button label */
  actionLabel?: string;
  /** Custom icon */
  icon?: ReactNode;
  /** Custom className for the container */
  className?: string;
}

/**
 * Reusable empty state component
 * @example
 * <EmptyState
 *   title="No products found"
 *   description="Try adjusting your filters"
 *   onAction={() => resetFilters()}
 *   actionLabel="Clear filters"
 * />
 */
export function EmptyState({
  title,
  description,
  onAction,
  actionLabel = "Go back",
  icon,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center h-64 space-y-4 text-center px-4",
        className
      )}
    >
      {icon || (
        <PackageOpen className="h-16 w-16 text-muted-foreground/50" />
      )}
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">{title}</h3>
        {description && (
          <p className="text-muted-foreground max-w-md">{description}</p>
        )}
      </div>
      {onAction && (
        <Button variant="outline" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
