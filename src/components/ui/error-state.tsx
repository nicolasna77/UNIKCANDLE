import { AlertCircle } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  /** Error title */
  title?: string;
  /** Error description/message */
  message: string;
  /** Retry button callback */
  onRetry?: () => void;
  /** Retry button label */
  retryLabel?: string;
  /** Custom icon */
  icon?: React.ReactNode;
  /** Custom className for the container */
  className?: string;
}

/**
 * Reusable error state component
 * @example
 * <ErrorState
 *   message="Failed to load products"
 *   onRetry={() => refetch()}
 *   retryLabel="Try again"
 * />
 */
export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  retryLabel = "Retry",
  icon,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center h-64 space-y-4 text-center px-4",
        className
      )}
    >
      {icon || <AlertCircle className="h-12 w-12 text-destructive" />}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-muted-foreground max-w-md">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
