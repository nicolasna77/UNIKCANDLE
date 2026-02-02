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
 * Supprimer un produit via FormData (soft delete)
 */
export async function deleteProduct(
  formData: FormData
): Promise<ActionResponse> {
  try {
    const authResult = await requireAdmin();
    if (!authResult.success) return authResult.error;

    const productId = formData.get("id") as string;

    if (!productId) {
      return errorResponse("ID du produit manquant");
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return errorResponse("Produit introuvable");
    }

    await prisma.product.update({
      where: { id: productId },
      data: { deletedAt: new Date() },
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/");

    return successResponse({ id: productId });
  } catch (error) {
    console.error("Erreur lors de la suppression du produit:", error);
    return errorResponse(
      "Une erreur est survenue lors de la suppression du produit"
    );
  }
}

/**
 * Supprimer un produit par ID (soft delete, pour React Query)
 */
export async function deleteProductById(id: string): Promise<ActionResponse> {
  try {
    const authResult = await requireAdmin();
    if (!authResult.success) return authResult.error;

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return errorResponse("Produit introuvable");
    }

    await prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/");

    return successResponse({ id });
  } catch (error) {
    console.error("Erreur lors de la suppression du produit:", error);
    return errorResponse(
      "Une erreur est survenue lors de la suppression du produit"
    );
  }
}
