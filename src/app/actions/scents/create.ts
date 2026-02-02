"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { scentSchema } from "@/lib/admin-schemas";
import {
  type ActionResponse,
  requireAdmin,
  validationError,
  errorResponse,
  successResponse,
} from "@/lib/action-helpers";

/**
 * Créer une nouvelle senteur via FormData
 */
export async function createScent(formData: FormData): Promise<ActionResponse> {
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
      notes: formData.get("notes")
        ? JSON.parse(formData.get("notes") as string)
        : [],
    };

    const validatedFields = scentSchema.safeParse(rawData);

    if (!validatedFields.success) {
      return validationError(validatedFields.error.flatten().fieldErrors);
    }

    const data = validatedFields.data;

    // Vérifier l'unicité du nom
    const existingScent = await prisma.scent.findFirst({
      where: {
        name: { equals: data.name, mode: "insensitive" },
      },
    });

    if (existingScent) {
      return validationError(
        { name: ["Ce nom est déjà utilisé"] },
        "Une senteur avec ce nom existe déjà"
      );
    }

    const scent = await prisma.scent.create({
      data: {
        name: data.name,
        nameEN: data.nameEN || undefined,
        description: data.description,
        descriptionEN: data.descriptionEN || undefined,
        icon: data.icon,
        color: data.color,
        notes: data.notes || [],
      },
    });

    revalidatePath("/admin/scents");
    revalidatePath("/products");
    revalidatePath("/");

    return successResponse(scent);
  } catch (error) {
    console.error("Erreur lors de la création de la senteur:", error);
    return errorResponse(
      "Une erreur est survenue lors de la création de la senteur"
    );
  }
}

/**
 * Créer une nouvelle senteur via JSON (pour React Query)
 */
export async function createScentFromJSON(
  data: unknown
): Promise<ActionResponse> {
  try {
    const authResult = await requireAdmin();
    if (!authResult.success) return authResult.error;

    const validatedFields = scentSchema.safeParse(data);

    if (!validatedFields.success) {
      return validationError(validatedFields.error.flatten().fieldErrors);
    }

    const validData = validatedFields.data;

    // Vérifier unicité du nom
    const existingScent = await prisma.scent.findFirst({
      where: {
        name: { equals: validData.name, mode: "insensitive" },
      },
    });

    if (existingScent) {
      return validationError(
        { name: ["Ce nom est déjà utilisé"] },
        "Une senteur avec ce nom existe déjà"
      );
    }

    const scent = await prisma.scent.create({
      data: {
        name: validData.name,
        nameEN: validData.nameEN || undefined,
        description: validData.description,
        descriptionEN: validData.descriptionEN || undefined,
        icon: validData.icon,
        color: validData.color,
        notes: validData.notes || [],
      },
    });

    revalidatePath("/admin/scents");
    revalidatePath("/products");
    revalidatePath("/");

    return successResponse(scent);
  } catch (error) {
    console.error("Erreur lors de la création de la senteur:", error);
    return errorResponse(
      "Une erreur est survenue lors de la création de la senteur"
    );
  }
}
