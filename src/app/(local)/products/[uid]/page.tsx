import DetailProduct from "./detail-product";
import { Suspense } from "react";
import LoadingPage from "../loading";
import { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = {
  params: { uid: string };
};

class ProductNotFoundError extends Error {
  constructor() {
    super("Produit non trouvé");
    this.name = "ProductNotFoundError";
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/products/${params.uid}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new ProductNotFoundError();
    }

    const product = await response.json();

    return {
      title: product.name,
      description: product.description,
    };
  } catch {
    return {
      title: "Produit non trouvé",
      description: "Le produit que vous recherchez n'existe pas.",
    };
  }
}

export default async function ProductPage({ params }: Props) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/products/${params.uid}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new ProductNotFoundError();
    }

    const product = await response.json();

    if (!product) {
      notFound();
    }

    return (
      <Suspense fallback={<LoadingPage />}>
        <DetailProduct productId={params.uid} />
      </Suspense>
    );
  } catch (error) {
    console.error("Erreur lors de la récupération du produit:", error);
    notFound();
  }
}
