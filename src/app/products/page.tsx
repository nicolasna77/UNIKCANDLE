"use client";

import { Suspense } from "react";
import ProductCard from "./product-card";
import LoadingPage from "./loading";
import { useProducts } from "@/hooks/useProducts";
import { ProductWithDetails } from "./[uid]/types";
import CardSkeleton from "@/components/skeleton/card-skeleton";

const ProductsList = () => {
  const { data: products, isLoading, error } = useProducts();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        {Array.from({ length: 3 }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return <div>Erreur lors du chargement des produits</div>;
  }

  if (!products || !Array.isArray(products)) {
    return <div>Erreur: format de données inattendu</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product: ProductWithDetails) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

const ProductsPage = () => {
  return (
    <div className="flex flex-col gap-4">
      <Suspense fallback={<LoadingPage />}>
        <ProductsList />
      </Suspense>
    </div>
  );
};

export default ProductsPage;
