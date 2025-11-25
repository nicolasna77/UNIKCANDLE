"use client";

import { useRouter } from "next/navigation";
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
    <Card className="text-center p-8 md:p-16 border-dashed">
      <div className="mx-auto max-w-lg space-y-6">
        <div className="relative mx-auto w-20 h-20 rounded-full bg-muted flex items-center justify-center">
          <Package className="h-10 w-10 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold">Aucune commande trouvée</h3>
          <p className="text-muted-foreground leading-relaxed">
            {hasFilters
              ? "Aucune commande ne correspond à vos critères de recherche. Essayez de modifier les filtres."
              : "Vous n'avez pas encore passé de commande. Découvrez nos produits pour commencer votre shopping."}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Button onClick={() => router.push("/products")} size="lg">
            <Package className="mr-2 h-4 w-4" />
            Découvrir nos produits
          </Button>
          {hasFilters && (
            <Button variant="outline" size="lg" onClick={onReset}>
              Effacer les filtres
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
