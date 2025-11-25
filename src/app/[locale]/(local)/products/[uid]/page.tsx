import DetailProduct from "./detail-product";
import { Suspense } from "react";
import LoadingPage from "./loading";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

type Props = {
  params: { uid: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { uid } = await params;

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
      title: "Produit non trouvé",
    };
  }

  const imageUrl = product.images[0]?.url || "/og-product-default.png";
  const price = typeof product.price === 'number' ? product.price : Number(product.price);

  return {
    title: `${product.name} - Bougie personnalisée`,
    description:
      product.description ||
      `Découvrez ${product.name}, une bougie artisanale personnalisable avec message audio intégré. ${price}€ - Fabrication française, matériaux recyclés.`,
    keywords: [
      product.name,
      product.category.name,
      "bougie personnalisée",
      "bougie artisanale",
      "message audio",
      "cadeau unique",
    ],
    openGraph: {
      title: `${product.name} - UNIKCANDLE`,
      description:
        product.description ||
        `Bougie artisanale personnalisable avec message audio. ${price}€`,
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
      description:
        product.description ||
        `Bougie artisanale personnalisable avec message audio. ${price}€`,
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
