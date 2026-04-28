import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Plus, RefreshCw, Loader2 } from "lucide-react";
import { useRouter } from "@/i18n/routing";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BreadcrumbItemType {
  label: string;
  href?: string;
}

interface AdminHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItemType[];
  badge?: {
    text: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
  };
  actions?: ReactNode;
  showBack?: boolean;
  onBack?: () => void;
  className?: string;
}

export function AdminHeader({
  title,
  description,
  breadcrumbs = [],
  badge,
  actions,
  showBack = false,
  onBack,
  className,
}: AdminHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <div className={cn("space-y-3 pb-4", className)}>
      {breadcrumbs.length > 0 && (
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((item, index) => (
              <div key={index} className="flex items-center">
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {item.href ? (
                    <BreadcrumbLink href={item.href} className="text-xs text-muted-foreground hover:text-foreground">
                      {item.label}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage className="text-xs font-medium">
                      {item.label}
                    </BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3 min-w-0">
          {showBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="h-8 w-8 p-0 shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Retour</span>
            </Button>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                {title}
              </h1>
              {badge && (
                <Badge
                  variant={badge.variant || "secondary"}
                  className="text-xs font-medium"
                >
                  {badge.text}
                </Badge>
              )}
            </div>
            {description && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {description}
              </p>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex items-center gap-2 shrink-0 sm:self-start">{actions}</div>
        )}
      </div>

      <Separator />
    </div>
  );
}

interface AdminHeaderActionsProps {
  onRefresh?: () => void;
  onAdd?: () => void;
  addLabel?: string;
  isLoading?: boolean;
  customActions?: ReactNode;
}

export function AdminHeaderActions({
  onRefresh,
  onAdd,
  addLabel = "Ajouter",
  isLoading = false,
  customActions,
}: AdminHeaderActionsProps) {
  return (
    <div className="flex items-center gap-2">
      {customActions}

      {onRefresh && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
          className="h-8"
        >
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          <span className="hidden sm:inline ml-1.5">Actualiser</span>
        </Button>
      )}

      {onAdd && (
        <Button onClick={onAdd} size="sm" className="h-8">
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          {addLabel}
        </Button>
      )}
    </div>
  );
}
