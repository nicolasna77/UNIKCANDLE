"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { categoryUpdateSchema } from "@/lib/admin-schemas";
import {
  type ActionResponse,
  requireAdmin,
  validationError,
  errorResponse,
  successResponse,
} from "@/lib/action-helpers";

/**
 * Mettre à jour une catégorie via FormData
 */
export async function updateCategory(
  formData: FormData
): Promise<ActionResponse> {
  try {
    const authResult = await requireAdmin();
    if (!authResult.success) return authResult.error;

    const categoryId = formData.get("id") as string;

    if (!categoryId) {
      return errorResponse("ID de la catégorie manquant");
    }

    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      return errorResponse("Catégorie introuvable");
    }

    const rawData = {
      id: categoryId,
      name: formData.get("name"),
      nameEN: formData.get("nameEN") || "",
      description: formData.get("description"),
      descriptionEN: formData.get("descriptionEN") || "",
      icon: formData.get("icon"),
      color: formData.get("color"),
      imageUrl: formData.get("imageUrl") || "",
    };

    const validatedFields = categoryUpdateSchema.safeParse(rawData);

    if (!validatedFields.success) {
      return validationError(validatedFields.error.flatten().fieldErrors);
    }

    const data = validatedFields.data;

    // Vérifier l'unicité du nom si modifié
    if (data.name && data.name !== existingCategory.name) {
      const duplicateCategory = await prisma.category.findFirst({
        where: {
          name: { equals: data.name, mode: "insensitive" },
          id: { not: categoryId },
        },
      });

      if (duplicateCategory) {
        return validationError(
          { name: ["Ce nom est déjà utilisé"] },
          "Une catégorie avec ce nom existe déjà"
        );
      }
    }

    const category = await prisma.category.update({
      where: { id: categoryId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.nameEN !== undefined && { nameEN: data.nameEN || null }),
        ...(data.description && { description: data.description }),
        ...(data.descriptionEN !== undefined && {
          descriptionEN: data.descriptionEN || null,
        }),
        ...(data.icon && { icon: data.icon }),
        ...(data.color && { color: data.color }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl || null }),
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/products");
    revalidatePath("/");

    return successResponse(category);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la catégorie:", error);
    return errorResponse(
      "Une erreur est survenue lors de la mise à jour de la catégorie"
    );
  }
}

/**
 * Mettre à jour une catégorie via JSON (pour React Query)
 */
export async function updateCategoryFromJSON(
  id: string,
  data: unknown
): Promise<ActionResponse> {
  try {
    const authResult = await requireAdmin();
    if (!authResult.success) return authResult.error;

    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return errorResponse("Catégorie introuvable");
    }

    const validatedFields = categoryUpdateSchema.safeParse({
      id,
      ...(data as Record<string, unknown>),
    });

    if (!validatedFields.success) {
      return validationError(validatedFields.error.flatten().fieldErrors);
    }

    const validData = validatedFields.data;

    // Vérifier unicité du nom si modifié
    if (validData.name && validData.name !== existingCategory.name) {
      const duplicateCategory = await prisma.category.findFirst({
        where: {
          name: { equals: validData.name, mode: "insensitive" },
          id: { not: id },
        },
      });

      if (duplicateCategory) {
        return validationError(
          { name: ["Ce nom est déjà utilisé"] },
          "Une catégorie avec ce nom existe déjà"
        );
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(validData.name && { name: validData.name }),
        ...(validData.nameEN !== undefined && {
          nameEN: validData.nameEN || null,
        }),
        ...(validData.description && { description: validData.description }),
        ...(validData.descriptionEN !== undefined && {
          descriptionEN: validData.descriptionEN || null,
        }),
        ...(validData.icon && { icon: validData.icon }),
        ...(validData.color && { color: validData.color }),
        ...(validData.imageUrl !== undefined && {
          imageUrl: validData.imageUrl || null,
        }),
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/products");
    revalidatePath("/");

    return successResponse(category);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la catégorie:", error);
    return errorResponse(
      "Une erreur est survenue lors de la mise à jour de la catégorie"
    );
  }
}
