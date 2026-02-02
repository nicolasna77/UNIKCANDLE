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
 * Type de réponse pour la suppression de catégorie
 */
export type DeleteCategoryResponse = {
  id: string;
  deletedProductsCount?: number;
};

/**
 * Supprimer une catégorie via FormData (soft delete)
 * Supprime également tous les produits associés
 */
export async function deleteCategory(
  formData: FormData
): Promise<ActionResponse<DeleteCategoryResponse>> {
  try {
    const authResult = await requireAdmin();
    if (!authResult.success) return authResult.error;

    const categoryId = formData.get("id") as string;

    if (!categoryId) {
      return errorResponse("ID de la catégorie manquant");
    }

    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        products: {
          where: { deletedAt: null },
          select: { id: true },
        },
      },
    });

    if (!existingCategory) {
      return errorResponse("Catégorie introuvable");
    }

    if (existingCategory.deletedAt) {
      return errorResponse("Cette catégorie est déjà supprimée");
    }

    const activeProductsCount = existingCategory.products.length;

    // Soft delete tous les produits actifs de cette catégorie
    if (activeProductsCount > 0) {
      await prisma.product.updateMany({
        where: { categoryId, deletedAt: null },
        data: { deletedAt: new Date() },
      });
    }

    // Soft delete de la catégorie
    await prisma.category.update({
      where: { id: categoryId },
      data: { deletedAt: new Date() },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/");

    return successResponse({
      id: categoryId,
      deletedProductsCount: activeProductsCount,
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de la catégorie:", error);
    return errorResponse(
      "Une erreur est survenue lors de la suppression de la catégorie"
    );
  }
}

/**
 * Supprimer une catégorie par ID (soft delete, pour React Query)
 */
export async function deleteCategoryById(
  id: string
): Promise<ActionResponse<DeleteCategoryResponse>> {
  try {
    const authResult = await requireAdmin();
    if (!authResult.success) return authResult.error;

    const existingCategory = await prisma.category.findUnique({
      where: { id },
      include: {
        products: {
          where: { deletedAt: null },
          select: { id: true },
        },
      },
    });

    if (!existingCategory) {
      return errorResponse("Catégorie introuvable");
    }

    if (existingCategory.deletedAt) {
      return errorResponse("Cette catégorie est déjà supprimée");
    }

    const activeProductsCount = existingCategory.products.length;

    // Soft delete tous les produits actifs de cette catégorie
    if (activeProductsCount > 0) {
      await prisma.product.updateMany({
        where: { categoryId: id, deletedAt: null },
        data: { deletedAt: new Date() },
      });
    }

    // Soft delete la catégorie
    await prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/");

    return successResponse({
      id,
      deletedProductsCount: activeProductsCount,
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de la catégorie:", error);
    return errorResponse(
      "Une erreur est survenue lors de la suppression de la catégorie"
    );
  }
}
