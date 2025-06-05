import { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = {
  params: { uid: string };
  children: React.ReactNode;
};

class ProductNotFoundError extends Error {
  constructor() {
    super("Produit non trouvé");
    this.name = "ProductNotFoundError";
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/products/${params.uid}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new ProductNotFoundError();
    }

    const product = await response.json();

    return {
      title: product.name,
      description: product.description,
      openGraph: {
        title: product.name,
        description: product.description,
        images: product.images?.[0]?.url,
      },
    };
  } catch {
    notFound();
    return {
      title: "Produit non trouvé",
      description: "Le produit que vous recherchez n'existe pas.",
    };
  }
}

export default async function ProductLayout({ children }: Props) {
  return <>{children}</>;
}
