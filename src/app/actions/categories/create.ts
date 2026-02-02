"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { categorySchema } from "@/lib/admin-schemas";
import {
  type ActionResponse,
  requireAdmin,
  validationError,
  errorResponse,
  successResponse,
} from "@/lib/action-helpers";

/**
 * Créer une nouvelle catégorie via FormData
 */
export async function createCategory(
  formData: FormData
): Promise<ActionResponse> {
  try {
    const authResult = await requireAdmin();
    if (!authResult.success) return authResult.error;

    const rawData = {
      name: formData.get("name"),
      nameEN: formData.get("nameEN") || "",
      description: formData.get("description"),
      descriptionEN: formData.get("descriptionEN") || "",
      icon: formData.get("icon"),
      color: formData.get("color"),
      imageUrl: formData.get("imageUrl") || "",
    };

    const validatedFields = categorySchema.safeParse(rawData);

    if (!validatedFields.success) {
      return validationError(validatedFields.error.flatten().fieldErrors);
    }

    const data = validatedFields.data;

    // Vérifier l'unicité du nom
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: { equals: data.name, mode: "insensitive" },
      },
    });

    if (existingCategory) {
      return validationError(
        { name: ["Ce nom est déjà utilisé"] },
        "Une catégorie avec ce nom existe déjà"
      );
    }

    const category = await prisma.category.create({
      data: {
        name: data.name,
        nameEN: data.nameEN || undefined,
        description: data.description,
        descriptionEN: data.descriptionEN || undefined,
        icon: data.icon,
        color: data.color,
        imageUrl: data.imageUrl || undefined,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/products");
    revalidatePath("/");

    return successResponse(category);
  } catch (error) {
    console.error("Erreur lors de la création de la catégorie:", error);
    return errorResponse(
      "Une erreur est survenue lors de la création de la catégorie"
    );
  }
}

/**
 * Créer une nouvelle catégorie via JSON (pour React Query)
 */
export async function createCategoryFromJSON(
  data: unknown
): Promise<ActionResponse> {
  try {
    const authResult = await requireAdmin();
    if (!authResult.success) return authResult.error;

    const validatedFields = categorySchema.safeParse(data);

    if (!validatedFields.success) {
      return validationError(validatedFields.error.flatten().fieldErrors);
    }

    const validData = validatedFields.data;

    // Vérifier unicité du nom
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: { equals: validData.name, mode: "insensitive" },
      },
    });

    if (existingCategory) {
      return validationError(
        { name: ["Ce nom est déjà utilisé"] },
        "Une catégorie avec ce nom existe déjà"
      );
    }

    const category = await prisma.category.create({
      data: {
        name: validData.name,
        nameEN: validData.nameEN || undefined,
        description: validData.description,
        descriptionEN: validData.descriptionEN || undefined,
        icon: validData.icon,
        color: validData.color,
        imageUrl: validData.imageUrl || undefined,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/products");
    revalidatePath("/");

    return successResponse(category);
  } catch (error) {
    console.error("Erreur lors de la création de la catégorie:", error);
    return errorResponse(
      "Une erreur est survenue lors de la création de la catégorie"
    );
  }
}
