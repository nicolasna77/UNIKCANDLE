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
    const product = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/products/${params.uid}`
    ).then((res) => {
      if (!res.ok) throw new ProductNotFoundError();
      return res.json();
    });

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
    const product = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/products/${params.uid}`
    ).then((res) => {
      if (!res.ok) throw new ProductNotFoundError();
      return res.json();
    });

    if (!product) {
      notFound();
    }

    return (
      <Suspense fallback={<LoadingPage />}>
        <DetailProduct productId={params.uid} />
      </Suspense>
    );
  } catch {
    notFound();
  }
}
