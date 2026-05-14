import { Metadata } from "next";
import prisma from "@/lib/prisma";

type Props = {
  params: Promise<{ uid: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { uid } = await params;

  try {
    const product = await prisma.product.findUnique({
      where: { id: uid, deletedAt: null },
      select: { name: true, description: true, images: { take: 1, select: { url: true } } },
    });

    if (!product) {
      return { title: "Produit non trouvé", description: "Le produit que vous recherchez n'existe pas." };
    }

    return {
      title: product.name,
      description: product.description,
      openGraph: {
        title: product.name,
        description: product.description,
        images: product.images[0]?.url,
      },
    };
  } catch {
    return { title: "Produit non trouvé", description: "Le produit que vous recherchez n'existe pas." };
  }
}

export default async function ProductLayout({ children }: Props) {
  return <>{children}</>;
}
