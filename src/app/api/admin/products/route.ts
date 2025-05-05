import { NextResponse } from "next/server";
import { auth } from "@/lib/auth"; // path to your Better Auth server instance
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
        variants: {
          include: {
            scent: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
          },
        },
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

export async function DELETE(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await request.json();

  const product = await prisma.product.delete({
    where: { id },
  });
  revalidatePath("/admin/products");
  return NextResponse.json(product);
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

    // Validation des données
    if (
      !data.name ||
      !data.description ||
      !data.price ||
      !data.imageUrl ||
      !data.subTitle
    ) {
      console.log("Validation échouée:", {
        name: !!data.name,
        description: !!data.description,
        price: !!data.price,
        imageUrl: !!data.imageUrl,
        subTitle: !!data.subTitle,
      });
      return NextResponse.json(
        { error: "Tous les champs sont obligatoires" },
        { status: 400 }
      );
    }

    if (typeof data.price !== "number" || data.price <= 0) {
      console.log("Prix invalide:", data.price);
      return NextResponse.json(
        { error: "Le prix doit être un nombre positif" },
        { status: 400 }
      );
    }

    if (!Array.isArray(data.selectedScents)) {
      console.log("Senteurs invalides:", data.selectedScents);
      return NextResponse.json(
        { error: "Les senteurs doivent être un tableau" },
        { status: 400 }
      );
    }

    // Vérification que les senteurs existent
    const existingScents = await prisma.scent.findMany({
      where: {
        id: {
          in: data.selectedScents,
        },
      },
    });

    console.log("Senteurs trouvées:", existingScents);

    if (existingScents.length !== data.selectedScents.length) {
      console.log("Certaines senteurs n'existent pas:", {
        requested: data.selectedScents,
        found: existingScents.map((s) => s.id),
      });
      return NextResponse.json(
        { error: "Certaines senteurs n'existent pas" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        imageUrl: data.imageUrl,
        subTitle: data.subTitle,
        variants: {
          create: data.selectedScents.map((scentId: string) => ({
            scentId,
            imageUrl: data.imageUrl,
          })),
        },
      },
      include: {
        variants: {
          include: {
            scent: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
          },
        },
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
