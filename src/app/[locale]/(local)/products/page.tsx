import { Suspense } from "react";
import LoadingPage from "./loading";
import ProductsList from "./products-list";
import { PageHeader } from "@/components/page-header";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "products.metadata" });

  const keywords = t("keywords").split(", ");

  return {
    title: t("title"),
    description: t("description"),
    keywords,
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      images: [
        {
          url: "/og-products.png",
          width: 1200,
          height: 630,
          alt: t("ogAlt"),
        },
      ],
    },
  };
}

async function ProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "products.pageHeader" });

  return (
    <div className="container mx-auto  ">
      <PageHeader title={t("title")} description={t("description")} />

      <Suspense fallback={<LoadingPage />}>
        <ProductsList />
      </Suspense>
    </div>
  );
}

export default ProductsPage;
