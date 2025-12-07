"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { scentSchema, scentUpdateSchema } from "@/lib/admin-schemas";

// Types pour les réponses
type ActionResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

/**
 * Créer une nouvelle senteur
 * Server Action avec validation Zod et progressive enhancement
 */
export async function createScent(formData: FormData): Promise<ActionResponse> {
  try {
    // Vérification de l'authentification
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        success: false,
        error: "Non autorisé. Veuillez vous connecter.",
      };
    }

    // Vérification du rôle admin
    if (session.user.role !== "admin") {
      return {
        success: false,
        error: "Accès refusé. Droits administrateur requis.",
      };
    }

    // Extraction des données du FormData
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

    // Validation avec Zod (sécurité serveur primaire)
    const validatedFields = scentSchema.safeParse(rawData);

    if (!validatedFields.success) {
      return {
        success: false,
        error: "Données invalides",
        fieldErrors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const data = validatedFields.data;

    // Vérifier si une senteur avec le même nom existe déjà
    const existingScent = await prisma.scent.findFirst({
      where: {
        name: {
          equals: data.name,
          mode: "insensitive",
        },
      },
    });

    if (existingScent) {
      return {
        success: false,
        error: "Une senteur avec ce nom existe déjà",
        fieldErrors: { name: ["Ce nom est déjà utilisé"] },
      };
    }

    // Création de la senteur
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

    // Revalidation des pages affectées
    revalidatePath("/admin/scents");
    revalidatePath("/products");
    revalidatePath("/");

    return {
      success: true,
      data: scent,
    };
  } catch (error) {
    console.error("Erreur lors de la création de la senteur:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors de la création de la senteur",
    };
  }
}

/**
 * Mettre à jour une senteur existante
 * Server Action avec validation Zod
 */
export async function updateScent(formData: FormData): Promise<ActionResponse> {
  try {
    // Vérification de l'authentification
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        success: false,
        error: "Non autorisé. Veuillez vous connecter.",
      };
    }

    // Vérification du rôle admin
    if (session.user.role !== "admin") {
      return {
        success: false,
        error: "Accès refusé. Droits administrateur requis.",
      };
    }

    // Extraction de l'ID et des données
    const scentId = formData.get("id") as string;

    if (!scentId) {
      return {
        success: false,
        error: "ID de la senteur manquant",
      };
    }

    // Vérifier que la senteur existe
    const existingScent = await prisma.scent.findUnique({
      where: { id: scentId },
    });

    if (!existingScent) {
      return {
        success: false,
        error: "Senteur introuvable",
      };
    }

    // Extraction des données du FormData
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

    // Validation avec Zod
    const validatedFields = scentUpdateSchema.safeParse(rawData);

    if (!validatedFields.success) {
      return {
        success: false,
        error: "Données invalides",
        fieldErrors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const data = validatedFields.data;

    // Vérifier l'unicité du nom si modifié
    if (data.name && data.name !== existingScent.name) {
      const duplicateScent = await prisma.scent.findFirst({
        where: {
          name: {
            equals: data.name,
            mode: "insensitive",
          },
          id: {
            not: scentId,
          },
        },
      });

      if (duplicateScent) {
        return {
          success: false,
          error: "Une senteur avec ce nom existe déjà",
          fieldErrors: { name: ["Ce nom est déjà utilisé"] },
        };
      }
    }

    // Mise à jour de la senteur
    const scent = await prisma.scent.update({
      where: { id: scentId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.nameEN !== undefined && { nameEN: data.nameEN || null }),
        ...(data.description && { description: data.description }),
        ...(data.descriptionEN !== undefined && { descriptionEN: data.descriptionEN || null }),
        ...(data.icon && { icon: data.icon }),
        ...(data.color && { color: data.color }),
        ...(data.notes && { notes: data.notes }),
      },
    });

    // Revalidation des pages affectées
    revalidatePath("/admin/scents");
    revalidatePath("/products");
    revalidatePath("/");

    return {
      success: true,
      data: scent,
    };
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la senteur:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors de la mise à jour de la senteur",
    };
  }
}

/**
 * Supprimer une senteur
 * Server Action avec validation
 */
export async function deleteScent(formData: FormData): Promise<ActionResponse> {
  try {
    // Vérification de l'authentification
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        success: false,
        error: "Non autorisé. Veuillez vous connecter.",
      };
    }

    // Vérification du rôle admin
    if (session.user.role !== "admin") {
      return {
        success: false,
        error: "Accès refusé. Droits administrateur requis.",
      };
    }

    const scentId = formData.get("id") as string;

    if (!scentId) {
      return {
        success: false,
        error: "ID de la senteur manquant",
      };
    }

    // Vérifier que la senteur existe
    const existingScent = await prisma.scent.findUnique({
      where: { id: scentId },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!existingScent) {
      return {
        success: false,
        error: "Senteur introuvable",
      };
    }

    // Vérifier qu'aucun produit n'utilise cette senteur
    if (existingScent._count.products > 0) {
      return {
        success: false,
        error: `Impossible de supprimer cette senteur car ${existingScent._count.products} produit(s) l'utilisent`,
      };
    }

    // Suppression de la senteur
    await prisma.scent.delete({
      where: { id: scentId },
    });

    // Revalidation des pages affectées
    revalidatePath("/admin/scents");
    revalidatePath("/products");
    revalidatePath("/");

    return {
      success: true,
      data: { id: scentId },
    };
  } catch (error) {
    console.error("Erreur lors de la suppression de la senteur:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors de la suppression de la senteur",
    };
  }
}

/**
 * Version alternative pour utilisation programmatique (sans FormData)
 * Utile pour les mutations React Query
 */
export async function createScentFromJSON(
  data: unknown
): Promise<ActionResponse> {
  try {
    // Vérification de l'authentification
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "admin") {
      return {
        success: false,
        error: "Non autorisé",
      };
    }

    // Validation avec Zod
    const validatedFields = scentSchema.safeParse(data);

    if (!validatedFields.success) {
      return {
        success: false,
        error: "Données invalides",
        fieldErrors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const validData = validatedFields.data;

    // Vérifier unicité du nom
    const existingScent = await prisma.scent.findFirst({
      where: {
        name: {
          equals: validData.name,
          mode: "insensitive",
        },
      },
    });

    if (existingScent) {
      return {
        success: false,
        error: "Une senteur avec ce nom existe déjà",
        fieldErrors: { name: ["Ce nom est déjà utilisé"] },
      };
    }

    // Création
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

    // Revalidation
    revalidatePath("/admin/scents");
    revalidatePath("/products");
    revalidatePath("/");

    return {
      success: true,
      data: scent,
    };
  } catch (error) {
    console.error("Erreur lors de la création de la senteur:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors de la création de la senteur",
    };
  }
}

/**
 * Version alternative pour mise à jour programmatique
 */
export async function updateScentFromJSON(
  id: string,
  data: unknown
): Promise<ActionResponse> {
  try {
    // Vérification de l'authentification
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "admin") {
      return {
        success: false,
        error: "Non autorisé",
      };
    }

    // Vérifier existence
    const existingScent = await prisma.scent.findUnique({
      where: { id },
    });

    if (!existingScent) {
      return {
        success: false,
        error: "Senteur introuvable",
      };
    }

    // Préparer le payload en s'assurant que `data` est un objet (évite l'erreur de spread sur unknown)
    const payload: Record<string, unknown> =
      typeof data === "object" && data !== null ? (data as Record<string, unknown>) : {};

    // Validation
    const validatedFields = scentUpdateSchema.safeParse({ id, ...payload });

    if (!validatedFields.success) {
      return {
        success: false,
        error: "Données invalides",
        fieldErrors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const validData = validatedFields.data;

    // Vérifier unicité du nom si modifié
    if (validData.name && validData.name !== existingScent.name) {
      const duplicateScent = await prisma.scent.findFirst({
        where: {
          name: {
            equals: validData.name,
            mode: "insensitive",
          },
          id: {
            not: id,
          },
        },
      });

      if (duplicateScent) {
        return {
          success: false,
          error: "Une senteur avec ce nom existe déjà",
          fieldErrors: { name: ["Ce nom est déjà utilisé"] },
        };
      }
    }

    // Mise à jour
    const scent = await prisma.scent.update({
      where: { id },
      data: {
        ...(validData.name && { name: validData.name }),
        ...(validData.nameEN !== undefined && { nameEN: validData.nameEN || null }),
        ...(validData.description && { description: validData.description }),
        ...(validData.descriptionEN !== undefined && { descriptionEN: validData.descriptionEN || null }),
        ...(validData.icon && { icon: validData.icon }),
        ...(validData.color && { color: validData.color }),
        ...(validData.notes && { notes: validData.notes }),
      },
    });

    // Revalidation
    revalidatePath("/admin/scents");
    revalidatePath("/products");
    revalidatePath("/");

    return {
      success: true,
      data: scent,
    };
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la senteur:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors de la mise à jour de la senteur",
    };
  }
}

/**
 * Version alternative pour suppression programmatique
 */
export async function deleteScentById(id: string): Promise<ActionResponse> {
  try {
    // Vérification de l'authentification
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "admin") {
      return {
        success: false,
        error: "Non autorisé",
      };
    }

    // Vérifier existence
    const existingScent = await prisma.scent.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!existingScent) {
      return {
        success: false,
        error: "Senteur introuvable",
      };
    }

    // Vérifier qu'aucun produit n'utilise cette senteur
    if (existingScent._count.products > 0) {
      return {
        success: false,
        error: `Impossible de supprimer cette senteur car ${existingScent._count.products} produit(s) l'utilisent`,
      };
    }

    // Suppression
    await prisma.scent.delete({
      where: { id },
    });

    // Revalidation
    revalidatePath("/admin/scents");
    revalidatePath("/products");
    revalidatePath("/");

    return {
      success: true,
      data: { id },
    };
  } catch (error) {
    console.error("Erreur lors de la suppression de la senteur:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors de la suppression de la senteur",
    };
  }
}
