import DetailProduct from "./detail-product";
import { Suspense } from "react";
import LoadingPage from "../loading";

type Props = {
  params: { uid: string };
};

export default async function ProductPage({ params }: Props) {
  const { uid } = await params;

  return (
    <Suspense fallback={<LoadingPage />}>
      <DetailProduct productId={uid} />
    </Suspense>
  );
}
