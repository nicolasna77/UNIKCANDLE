"use client";

import { Suspense } from "react";
import LoadingPage from "./loading";
import ProductsList from "./products-list";
import { PageHeader } from "@/components/page-header";

const ProductsPage = () => {
  return (
    <div className="container mx-auto  ">
      <PageHeader
        title="Nos produits"
        description="Découvrez notre collection de bougies artisanales"
      />

      <Suspense fallback={<LoadingPage />}>
        <ProductsList />
      </Suspense>
    </div>
  );
};

export default ProductsPage;
