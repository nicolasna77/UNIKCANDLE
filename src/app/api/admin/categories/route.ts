import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { categorySchema } from "@/lib/admin-schemas";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validation avec Zod - Sécurité primaire
    const validatedFields = categorySchema.safeParse(body);

    if (!validatedFields.success) {
      return NextResponse.json(
        {
          error: "Données invalides",
          details: validatedFields.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const { name, description, color, icon, imageUrl } = validatedFields.data;

    const category = await prisma.category.create({
      data: {
        name,
        description,
        color,
        icon,
        imageUrl: imageUrl || undefined,
      },
    });

    // Revalidation des pages affectées
    revalidatePath("/admin/categories");
    revalidatePath("/products");
    revalidatePath("/");

    return NextResponse.json(category);
  } catch (error) {
    console.error("Erreur lors de la création de la catégorie:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la catégorie" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const categories = await prisma.category.findMany();
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des catégories" },
      { status: 500 }
    );
  }
}
