import { Suspense } from "react";
import LoadingPage from "./loading";
import ProductsList from "./products-list";
import { PageHeader } from "@/components/page-header";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nos Produits - Bougies personnalisées artisanales",
  description:
    "Découvrez notre collection de bougies artisanales personnalisables avec messages audio. Choisissez parmi nos différentes catégories, parfums et designs. Fabrication française, matériaux recyclés, expérience AR unique.",
  keywords: [
    "acheter bougie personnalisée",
    "collection bougies artisanales",
    "bougie parfumée personnalisable",
    "catalogue bougies",
    "bougies françaises",
    "bougies écologiques boutique",
  ],
  openGraph: {
    title: "Nos Bougies Personnalisées - Collection UNIKCANDLE",
    description:
      "Explorez notre collection de bougies artisanales personnalisables avec messages audio intégrés. Chaque bougie est unique.",
    images: [
      {
        url: "/og-products.png",
        width: 1200,
        height: 630,
        alt: "Collection de bougies UNIKCANDLE",
      },
    ],
  },
};

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
