import DetailProduct from "./detail-product";
import { Suspense } from "react";
import LoadingPage from "../loading";
import { notFound } from "next/navigation";

type Props = {
  params: { uid: string };
};

export default async function ProductPage({ params }: Props) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/products/${params.uid}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      notFound();
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
