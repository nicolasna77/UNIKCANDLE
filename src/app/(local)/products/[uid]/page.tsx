import DetailProduct from "./detail-product";
import { Suspense } from "react";
import LoadingPage from "../loading";
import { Metadata } from "next";
type Props = {
  params: Promise<{ uid: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // read route params
  const { uid } = await params;

  const product = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/products/${uid}`
  ).then((res) => res.json());

  return {
    title: product.title,
    description: product.description,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ uid: string }>;
}) {
  const { uid } = await params;
  return (
    <Suspense fallback={<LoadingPage />}>
      <DetailProduct productId={uid} />
    </Suspense>
  );
}
