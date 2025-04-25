import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        variants: {
          include: {
            scent: true,
          },
        },

        reviews: {
          include: {
            user: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    // Calcul de la moyenne des avis pour chaque produit
    const productsWithRating = products.map((product) => {
      const averageRating =
        product.reviews.length > 0
          ? product.reviews.reduce((acc, review) => acc + review.rating, 0) /
            product.reviews.length
          : 0;

      return {
        ...product,
        variants: product.variants || [],
        reviews: product.reviews || [],
        averageRating: Number(averageRating.toFixed(1)),
        reviewCount: product.reviews.length,
      };
    });

    return NextResponse.json(productsWithRating);
  } catch (error) {
    console.error("Erreur lors de la récupération des produits:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des produits" },
      { status: 500 }
    );
  }
}
