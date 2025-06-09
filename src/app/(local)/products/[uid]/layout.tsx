import { Metadata } from "next";

type Props = {
  params: { uid: string };
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const uid = (await params).uid;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/products/${uid}`,
      {
        cache: "no-store",
        next: { revalidate: 0 },
      }
    );

    if (!response.ok) {
      return {
        title: "Produit non trouvé",
        description: "Le produit que vous recherchez n'existe pas.",
      };
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
  } catch (error) {
    console.error("Erreur lors de la récupération des métadonnées:", error);
    return {
      title: "Produit non trouvé",
      description: "Le produit que vous recherchez n'existe pas.",
    };
  }
}

export default async function ProductLayout({ children }: Props) {
  return <>{children}</>;
}
