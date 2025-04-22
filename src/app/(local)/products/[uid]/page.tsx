import DetailProduct from "./detail-product";
import { Suspense } from "react";
import LoadingPage from "../loading";

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
