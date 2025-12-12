"use client";

import { useRouter } from "@/i18n/routing";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";

interface EmptyOrdersStateProps {
  hasFilters: boolean;
  onReset: () => void;
}

export function EmptyOrdersState({
  hasFilters,
  onReset,
}: EmptyOrdersStateProps) {
  const router = useRouter();

  return (
    <Card className="text-center p-10 md:p-20 border-2 border-dashed border-border/50 bg-muted/20">
      <div className="mx-auto max-w-lg space-y-8">
        <div className="relative mx-auto w-24 h-24 rounded-2xl bg-muted/50 border-2 border-border/50 flex items-center justify-center shadow-sm">
          <Package className="h-12 w-12 text-muted-foreground/70" />
        </div>
        <div className="space-y-3">
          <h3 className="text-2xl font-black tracking-tight">
            Aucune commande trouvée
          </h3>
          <p className="text-base font-medium text-muted-foreground leading-relaxed">
            {hasFilters
              ? "Aucune commande ne correspond à vos critères de recherche. Essayez de modifier les filtres."
              : "Vous n'avez pas encore passé de commande. Découvrez nos produits pour commencer votre shopping."}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-6">
          <Button
            onClick={() => router.push("/products")}
            size="lg"
            className="gap-2 font-bold shadow-sm hover:shadow transition-all"
          >
            <Package className="h-4 w-4" />
            <span>Découvrir nos produits</span>
          </Button>
          {hasFilters && (
            <Button
              variant="outline"
              size="lg"
              onClick={onReset}
              className="font-bold hover:bg-muted/50"
            >
              Effacer les filtres
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
