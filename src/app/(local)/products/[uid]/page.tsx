import DetailProduct from "./detail-product";
import { Suspense } from "react";
import LoadingPage from "../loading";
import { notFound } from "next/navigation";

type Props = {
  params: { uid: string };
};

export default async function ProductPage({ params }: Props) {
  const uid = await params.uid;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/products/${uid}`,
      {
        cache: "no-store",
        next: { revalidate: 0 },
      }
    );

    if (!response.ok) {
      console.error(
        `Erreur ${response.status} lors de la récupération du produit`
      );
      notFound();
    }

    const product = await response.json();

    if (!product || !product.id) {
      console.error("Produit non trouvé ou invalide:", product);
      notFound();
    }

    return (
      <Suspense fallback={<LoadingPage />}>
        <DetailProduct productId={uid} />
      </Suspense>
    );
  } catch (error) {
    console.error("Erreur lors de la récupération du produit:", error);
    notFound();
  }
}
