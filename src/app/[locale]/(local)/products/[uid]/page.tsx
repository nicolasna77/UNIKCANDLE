import DetailProduct from "./detail-product";
import { Suspense } from "react";
import LoadingPage from "./loading";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

type Props = {
  params: Promise<{ uid: string; locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { uid, locale } = await params;
  const t = await getTranslations({ locale, namespace: "products.detail.metadata" });

  const product = await prisma.product.findFirst({
    where: {
      id: uid,
      deletedAt: null,
    },
    include: {
      category: true,
      images: {
        orderBy: { createdAt: "asc" },
        take: 1,
      },
    },
  });

  if (!product) {
    return {
      title: t("notFound"),
    };
  }

  const imageUrl = product.images[0]?.url || "/og-product-default.png";
  const price = typeof product.price === 'number' ? product.price : Number(product.price);

  const description = product.description || t("descriptionTemplate", { productName: product.name, price: price.toString() });
  const ogDescription = product.description || t("ogDescriptionTemplate", { price: price.toString() });

  return {
    title: `${product.name} - ${t("titleSuffix")}`,
    description,
    keywords: [
      product.name,
      product.category.name,
      t("keywords.personalized"),
      t("keywords.artisanal"),
      t("keywords.audioMessage"),
      t("keywords.uniqueGift"),
    ],
    openGraph: {
      title: `${product.name} - UNIKCANDLE`,
      description: ogDescription,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} - UNIKCANDLE`,
      description: ogDescription,
      images: [imageUrl],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { uid } = await params;

  return (
    <Suspense fallback={<LoadingPage />}>
      <DetailProduct productId={uid} />
    </Suspense>
  );
}
