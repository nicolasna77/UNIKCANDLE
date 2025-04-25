"use client";

import { Suspense, useState } from "react";
import ProductCard from "./product-card";
import LoadingPage from "./loading";
import { useProducts } from "@/hooks/useProducts";
import { ProductWithDetails } from "../../../types/types";
import CardSkeleton from "@/components/skeleton/card-skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Filter } from "lucide-react";

const ProductsList = () => {
  const { data: products, isLoading, error } = useProducts();
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-destructive text-lg">
          Erreur lors du chargement des produits
        </div>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Réessayer
        </Button>
      </div>
    );
  }

  if (!products || !Array.isArray(products)) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-destructive text-lg">
          Format de données inattendu
        </div>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Réessayer
        </Button>
      </div>
    );
  }

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === "name") {
      return sortOrder === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }
    if (sortBy === "price") {
      return sortOrder === "asc" ? a.price - b.price : b.price - a.price;
    }
    return 0;
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Nom</SelectItem>
              <SelectItem value="price">Prix</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          >
            <Filter
              className={cn(
                "h-4 w-4 transition-transform",
                sortOrder === "desc" && "rotate-180"
              )}
            />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sortedProducts.map((product: ProductWithDetails) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

const ProductsPage = () => {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Nos produits</h1>
        <p className="text-muted-foreground">
          Découvrez notre collection de bougies artisanales
        </p>
      </div>
      <Suspense fallback={<LoadingPage />}>
        <ProductsList />
      </Suspense>
    </div>
  );
};

export default ProductsPage;
