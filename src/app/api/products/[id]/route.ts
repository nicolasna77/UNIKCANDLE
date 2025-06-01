import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log("Recherche du produit avec l'ID:", id);

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        scent: true,
        category: true,
        reviews: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    console.log("Produit trouvé:", product);

    if (!product) {
      console.log("Produit non trouvé");
      return NextResponse.json(
        { error: "Produit non trouvé" },
        { status: 404 }
      );
    }

    // Calcul de la moyenne des avis
    const averageRating =
      product.reviews?.length > 0
        ? product.reviews.reduce((acc, review) => acc + review.rating, 0) /
          product.reviews.length
        : 0;

    // Vérification des données requises
    if (!product.category || !product.scent || !product.images) {
      console.error("Données manquantes pour le produit:", {
        id: product.id,
        category: product.category,
        scent: product.scent,
        images: product.images,
      });
      return NextResponse.json(
        { error: "Données du produit incomplètes" },
        { status: 500 }
      );
    }

    const response = {
      ...product,
      averageRating: Number(averageRating.toFixed(1)),
      reviewCount: product.reviews?.length || 0,
    };

    console.log("Réponse finale:", response);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Erreur lors de la récupération du produit:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du produit" },
      { status: 500 }
    );
  }
}
