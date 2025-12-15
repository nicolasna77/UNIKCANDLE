import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        deletedAt: null, // Exclure les catégories supprimées
      },
      orderBy: {
        name: "asc",
      },
      include: {
        products: {
          where: {
            deletedAt: null, // Exclure les produits supprimés
          },
        },
        _count: {
          select: {
            products: {
              where: {
                deletedAt: null, // Compter seulement les produits actifs
              },
            },
          },
        },
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("[CATEGORIES_GET]", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, icon, color } = body;

    if (!name || !description || !icon || !color) {
      return new NextResponse("Données manquantes", { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        name,
        description,
        icon,
        color,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("[CATEGORIES_POST]", error);
    return new NextResponse("Erreur interne", { status: 500 });
  }
}
