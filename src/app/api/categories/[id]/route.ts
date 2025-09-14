import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Vérifier si la catégorie est utilisée par des produits
    const productsWithCategory = await prisma.product.findFirst({
      where: {
        categoryId: id,
      },
    });

    if (productsWithCategory) {
      return new NextResponse(
        "Impossible de supprimer cette catégorie car elle est utilisée par des produits",
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: {
        id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Erreur lors de la suppression de la catégorie:", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}
