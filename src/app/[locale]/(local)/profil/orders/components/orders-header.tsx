"use client";

import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { Package } from "lucide-react";

export function OrdersHeader() {
  const router = useRouter();

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
      <PageHeader
        title="Mes commandes"
        description="Consultez et gérez vos commandes."
      />

      <Button
        variant="outline"
        onClick={() => router.push("/products")}
        className="gap-2 w-full lg:w-auto"
      >
        <Package className="h-4 w-4" />
        Découvrir nos produits
      </Button>
    </div>
  );
}
