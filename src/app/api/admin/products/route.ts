import { NextResponse } from "next/server";
import { auth } from "@/lib/auth"; // path to your Better Auth server instance
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Schéma de validation pour la création d'un produit
const createProductSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().min(1, "La description est requise"),
  price: z.number().positive("Le prix doit être positif"),
  subTitle: z.string().min(1, "Le sous-titre est requis"),
  slogan: z.string().min(1, "Le slogan est requis"),
  category: z.string().min(1, "La catégorie est requise"),
  arAnimation: z.string().min(1, "L'animation AR est requise"),
  scentId: z.string().min(1, "Le parfum est requis"),
  imageUrl: z.string().url("L'URL de l'image doit être valide"),
});

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const products = await prisma.product.findMany({
      include: {
        scent: true,
        category: true,
        images: true,
      },
      orderBy: {
        name: "asc",
      },
    });
    revalidatePath("/admin/products");
    return NextResponse.json(products);
  } catch (error) {
    console.error("Erreur lors de la récupération des produits:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des produits" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const data = await request.json();
    console.log("Données reçues:", data);

    // Validation des données avec Zod
    const validationResult = createProductSchema.safeParse(data);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Données invalides",
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    // Vérification que le parfum existe
    const existingScent = await prisma.scent.findUnique({
      where: { id: data.scentId },
    });

    if (!existingScent) {
      return NextResponse.json(
        { error: "Le parfum sélectionné n'existe pas" },
        { status: 400 }
      );
    }

    // Création du produit
    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        subTitle: data.subTitle,
        slogan: data.slogan,
        category: data.category,
        arAnimation: data.arAnimation,
        scent: {
          connect: { id: data.scentId },
        },
        images: {
          create: {
            url: data.imageUrl,
          },
        },
      },
      include: {
        scent: true,
        images: true,
      },
    });

    console.log("Produit créé:", product);

    revalidatePath("/admin/products");
    return NextResponse.json(product);
  } catch (error) {
    console.error("Erreur lors de la création du produit:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du produit" },
      { status: 500 }
    );
  }
}
