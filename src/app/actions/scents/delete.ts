"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  type ActionResponse,
  requireAdmin,
  errorResponse,
  successResponse,
} from "@/lib/action-helpers";

/**
 * Supprimer une senteur via FormData
 * Vérifie qu'aucun produit n'utilise cette senteur
 */
export async function deleteScent(formData: FormData): Promise<ActionResponse> {
  try {
    const authResult = await requireAdmin();
    if (!authResult.success) return authResult.error;

    const scentId = formData.get("id") as string;

    if (!scentId) {
      return errorResponse("ID de la senteur manquant");
    }

    const existingScent = await prisma.scent.findUnique({
      where: { id: scentId },
      include: {
        _count: { select: { products: true } },
      },
    });

    if (!existingScent) {
      return errorResponse("Senteur introuvable");
    }

    // Vérifier qu'aucun produit n'utilise cette senteur
    if (existingScent._count.products > 0) {
      return errorResponse(
        `Impossible de supprimer cette senteur car ${existingScent._count.products} produit(s) l'utilisent`
      );
    }

    await prisma.scent.delete({
      where: { id: scentId },
    });

    revalidatePath("/admin/scents");
    revalidatePath("/products");
    revalidatePath("/");

    return successResponse({ id: scentId });
  } catch (error) {
    console.error("Erreur lors de la suppression de la senteur:", error);
    return errorResponse(
      "Une erreur est survenue lors de la suppression de la senteur"
    );
  }
}

/**
 * Supprimer une senteur par ID (pour React Query)
 */
export async function deleteScentById(id: string): Promise<ActionResponse> {
  try {
    const authResult = await requireAdmin();
    if (!authResult.success) return authResult.error;

    const existingScent = await prisma.scent.findUnique({
      where: { id },
      include: {
        _count: { select: { products: true } },
      },
    });

    if (!existingScent) {
      return errorResponse("Senteur introuvable");
    }

    // Vérifier qu'aucun produit n'utilise cette senteur
    if (existingScent._count.products > 0) {
      return errorResponse(
        `Impossible de supprimer cette senteur car ${existingScent._count.products} produit(s) l'utilisent`
      );
    }

    await prisma.scent.delete({
      where: { id },
    });

    revalidatePath("/admin/scents");
    revalidatePath("/products");
    revalidatePath("/");

    return successResponse({ id });
  } catch (error) {
    console.error("Erreur lors de la suppression de la senteur:", error);
    return errorResponse(
      "Une erreur est survenue lors de la suppression de la senteur"
    );
  }
}
