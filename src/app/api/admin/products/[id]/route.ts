import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updateProductSchema = z.object({
  name: z.string().min(1, "Le nom est requis").optional(),
  description: z.string().min(1, "La description est requise").optional(),
  price: z.number().min(0, "Le prix doit être positif").optional(),
  subTitle: z.string().min(1, "Le sous-titre est requis").optional(),
  categoryId: z.string().optional(),
  scentId: z.string().optional(),
  images: z.array(z.object({ url: z.string().url() })).optional(),
});

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    revalidatePath("/admin/products");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression du produit:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du produit" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    const data = await request.json();

    // Validation des données
    const validatedData = updateProductSchema.parse(data);

    const product = await prisma.$transaction(async (tx) => {
      // Mise à jour du produit avec les nouvelles données
      return tx.product.update({
        where: { id },
        data: {
          name: validatedData.name,
          description: validatedData.description,
          price: validatedData.price,
          subTitle: validatedData.subTitle,
          categoryId: validatedData.categoryId,
          scentId: validatedData.scentId,
          images: {
            deleteMany: {},
            create: validatedData.images?.map((image) => ({ url: image.url })) || [],
          },
        },
        include: {
          scent: true,
          category: true,
          images: true,
        },
      });
    });

    revalidatePath("/admin/products");
    return NextResponse.json(product);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du produit:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du produit" },
      { status: 500 }
    );
  }
}
