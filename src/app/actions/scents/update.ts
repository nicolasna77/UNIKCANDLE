"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { scentUpdateSchema } from "@/lib/admin-schemas";
import {
  type ActionResponse,
  requireAdmin,
  validationError,
  errorResponse,
  successResponse,
} from "@/lib/action-helpers";

/**
 * Mettre à jour une senteur via FormData
 */
export async function updateScent(formData: FormData): Promise<ActionResponse> {
  try {
    const authResult = await requireAdmin();
    if (!authResult.success) return authResult.error;

    const scentId = formData.get("id") as string;

    if (!scentId) {
      return errorResponse("ID de la senteur manquant");
    }

    const existingScent = await prisma.scent.findUnique({
      where: { id: scentId },
    });

    if (!existingScent) {
      return errorResponse("Senteur introuvable");
    }

    const rawData = {
      id: scentId,
      name: formData.get("name"),
      nameEN: formData.get("nameEN") || "",
      description: formData.get("description"),
      descriptionEN: formData.get("descriptionEN") || "",
      icon: formData.get("icon"),
      color: formData.get("color"),
      notes: formData.get("notes")
        ? JSON.parse(formData.get("notes") as string)
        : undefined,
    };

    const validatedFields = scentUpdateSchema.safeParse(rawData);

    if (!validatedFields.success) {
      return validationError(validatedFields.error.flatten().fieldErrors);
    }

    const data = validatedFields.data;

    // Vérifier l'unicité du nom si modifié
    if (data.name && data.name !== existingScent.name) {
      const duplicateScent = await prisma.scent.findFirst({
        where: {
          name: { equals: data.name, mode: "insensitive" },
          id: { not: scentId },
        },
      });

      if (duplicateScent) {
        return validationError(
          { name: ["Ce nom est déjà utilisé"] },
          "Une senteur avec ce nom existe déjà"
        );
      }
    }

    const scent = await prisma.scent.update({
      where: { id: scentId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.nameEN !== undefined && { nameEN: data.nameEN || null }),
        ...(data.description && { description: data.description }),
        ...(data.descriptionEN !== undefined && {
          descriptionEN: data.descriptionEN || null,
        }),
        ...(data.icon && { icon: data.icon }),
        ...(data.color && { color: data.color }),
        ...(data.notes && { notes: data.notes }),
      },
    });

    revalidatePath("/admin/scents");
    revalidatePath("/products");
    revalidatePath("/");

    return successResponse(scent);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la senteur:", error);
    return errorResponse(
      "Une erreur est survenue lors de la mise à jour de la senteur"
    );
  }
}

/**
 * Mettre à jour une senteur via JSON (pour React Query)
 */
export async function updateScentFromJSON(
  id: string,
  data: unknown
): Promise<ActionResponse> {
  try {
    const authResult = await requireAdmin();
    if (!authResult.success) return authResult.error;

    const existingScent = await prisma.scent.findUnique({
      where: { id },
    });

    if (!existingScent) {
      return errorResponse("Senteur introuvable");
    }

    const payload: Record<string, unknown> =
      typeof data === "object" && data !== null
        ? (data as Record<string, unknown>)
        : {};

    const validatedFields = scentUpdateSchema.safeParse({ id, ...payload });

    if (!validatedFields.success) {
      return validationError(validatedFields.error.flatten().fieldErrors);
    }

    const validData = validatedFields.data;

    // Vérifier unicité du nom si modifié
    if (validData.name && validData.name !== existingScent.name) {
      const duplicateScent = await prisma.scent.findFirst({
        where: {
          name: { equals: validData.name, mode: "insensitive" },
          id: { not: id },
        },
      });

      if (duplicateScent) {
        return validationError(
          { name: ["Ce nom est déjà utilisé"] },
          "Une senteur avec ce nom existe déjà"
        );
      }
    }

    const scent = await prisma.scent.update({
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
        ...(validData.notes && { notes: validData.notes }),
      },
    });

    revalidatePath("/admin/scents");
    revalidatePath("/products");
    revalidatePath("/");

    return successResponse(scent);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la senteur:", error);
    return errorResponse(
      "Une erreur est survenue lors de la mise à jour de la senteur"
    );
  }
}
