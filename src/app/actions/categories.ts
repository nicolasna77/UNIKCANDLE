"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { categorySchema, categoryUpdateSchema } from "@/lib/admin-schemas";

// Types pour les réponses
type ActionResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

// Type spécifique pour la suppression de catégorie
export type DeleteCategoryResponse = {
  id: string;
  deletedProductsCount?: number;
};

/**
 * Créer une nouvelle catégorie
 * Server Action avec validation Zod et progressive enhancement
 */
export async function createCategory(formData: FormData): Promise<ActionResponse> {
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
      imageUrl: formData.get("imageUrl") || "",
    };

    // Validation avec Zod (sécurité serveur primaire)
    const validatedFields = categorySchema.safeParse(rawData);

    if (!validatedFields.success) {
      return {
        success: false,
        error: "Données invalides",
        fieldErrors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const data = validatedFields.data;

    // Vérifier si une catégorie avec le même nom existe déjà
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: {
          equals: data.name,
          mode: "insensitive",
        },
      },
    });

    if (existingCategory) {
      return {
        success: false,
        error: "Une catégorie avec ce nom existe déjà",
        fieldErrors: { name: ["Ce nom est déjà utilisé"] },
      };
    }

    // Création de la catégorie
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

    // Revalidation des pages affectées
    revalidatePath("/admin/categories");
    revalidatePath("/products");
    revalidatePath("/");

    return {
      success: true,
      data: category,
    };
  } catch (error) {
    console.error("Erreur lors de la création de la catégorie:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors de la création de la catégorie",
    };
  }
}

/**
 * Mettre à jour une catégorie existante
 * Server Action avec validation Zod
 */
export async function updateCategory(formData: FormData): Promise<ActionResponse> {
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
    const categoryId = formData.get("id") as string;

    if (!categoryId) {
      return {
        success: false,
        error: "ID de la catégorie manquant",
      };
    }

    // Vérifier que la catégorie existe
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      return {
        success: false,
        error: "Catégorie introuvable",
      };
    }

    // Extraction des données du FormData
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

    // Validation avec Zod
    const validatedFields = categoryUpdateSchema.safeParse(rawData);

    if (!validatedFields.success) {
      return {
        success: false,
        error: "Données invalides",
        fieldErrors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const data = validatedFields.data;

    // Vérifier l'unicité du nom si modifié
    if (data.name && data.name !== existingCategory.name) {
      const duplicateCategory = await prisma.category.findFirst({
        where: {
          name: {
            equals: data.name,
            mode: "insensitive",
          },
          id: {
            not: categoryId,
          },
        },
      });

      if (duplicateCategory) {
        return {
          success: false,
          error: "Une catégorie avec ce nom existe déjà",
          fieldErrors: { name: ["Ce nom est déjà utilisé"] },
        };
      }
    }

    // Mise à jour de la catégorie
    const category = await prisma.category.update({
      where: { id: categoryId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.nameEN !== undefined && { nameEN: data.nameEN || null }),
        ...(data.description && { description: data.description }),
        ...(data.descriptionEN !== undefined && { descriptionEN: data.descriptionEN || null }),
        ...(data.icon && { icon: data.icon }),
        ...(data.color && { color: data.color }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl || null }),
      },
    });

    // Revalidation des pages affectées
    revalidatePath("/admin/categories");
    revalidatePath("/products");
    revalidatePath("/");

    return {
      success: true,
      data: category,
    };
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la catégorie:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors de la mise à jour de la catégorie",
    };
  }
}

/**
 * Supprimer une catégorie
 * Server Action avec validation
 * Supprime la catégorie et soft delete tous les produits associés
 */
export async function deleteCategory(formData: FormData): Promise<ActionResponse<DeleteCategoryResponse>> {
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

    const categoryId = formData.get("id") as string;

    if (!categoryId) {
      return {
        success: false,
        error: "ID de la catégorie manquant",
      };
    }

    // Vérifier existence et compter les produits actifs (non soft deleted)
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        products: {
          where: {
            deletedAt: null, // Seulement les produits actifs
          },
          select: {
            id: true,
          },
        },
      },
    });

    if (!existingCategory) {
      return {
        success: false,
        error: "Catégorie introuvable",
      };
    }

    const activeProductsCount = existingCategory.products.length;

    // Soft delete tous les produits actifs de cette catégorie
    if (activeProductsCount > 0) {
      await prisma.product.updateMany({
        where: {
          categoryId: categoryId,
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
        },
      });
    }

    // Suppression de la catégorie
    await prisma.category.delete({
      where: { id: categoryId },
    });

    // Revalidation des pages affectées
    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/");

    return {
      success: true,
      data: {
        id: categoryId,
        deletedProductsCount: activeProductsCount,
      },
    };
  } catch (error) {
    console.error("Erreur lors de la suppression de la catégorie:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors de la suppression de la catégorie",
    };
  }
}

/**
 * Version alternative pour utilisation programmatique (sans FormData)
 * Utile pour les mutations React Query
 */
export async function createCategoryFromJSON(data: unknown): Promise<ActionResponse> {
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
    const validatedFields = categorySchema.safeParse(data);

    if (!validatedFields.success) {
      return {
        success: false,
        error: "Données invalides",
        fieldErrors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const validData = validatedFields.data;

    // Vérifier unicité du nom
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: {
          equals: validData.name,
          mode: "insensitive",
        },
      },
    });

    if (existingCategory) {
      return {
        success: false,
        error: "Une catégorie avec ce nom existe déjà",
        fieldErrors: { name: ["Ce nom est déjà utilisé"] },
      };
    }

    // Création
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

    // Revalidation
    revalidatePath("/admin/categories");
    revalidatePath("/products");
    revalidatePath("/");

    return {
      success: true,
      data: category,
    };
  } catch (error) {
    console.error("Erreur lors de la création de la catégorie:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors de la création de la catégorie",
    };
  }
}

/**
 * Version alternative pour mise à jour programmatique
 */
export async function updateCategoryFromJSON(id: string, data: unknown): Promise<ActionResponse> {
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
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return {
        success: false,
        error: "Catégorie introuvable",
      };
    }

    // Validation
    const validatedFields = categoryUpdateSchema.safeParse({ id, ...(data as Record<string, unknown>) });

    if (!validatedFields.success) {
      return {
        success: false,
        error: "Données invalides",
        fieldErrors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const validData = validatedFields.data;

    // Vérifier unicité du nom si modifié
    if (validData.name && validData.name !== existingCategory.name) {
      const duplicateCategory = await prisma.category.findFirst({
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

      if (duplicateCategory) {
        return {
          success: false,
          error: "Une catégorie avec ce nom existe déjà",
          fieldErrors: { name: ["Ce nom est déjà utilisé"] },
        };
      }
    }

    // Mise à jour
    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(validData.name && { name: validData.name }),
        ...(validData.nameEN !== undefined && { nameEN: validData.nameEN || null }),
        ...(validData.description && { description: validData.description }),
        ...(validData.descriptionEN !== undefined && { descriptionEN: validData.descriptionEN || null }),
        ...(validData.icon && { icon: validData.icon }),
        ...(validData.color && { color: validData.color }),
        ...(validData.imageUrl !== undefined && { imageUrl: validData.imageUrl || null }),
      },
    });

    // Revalidation
    revalidatePath("/admin/categories");
    revalidatePath("/products");
    revalidatePath("/");

    return {
      success: true,
      data: category,
    };
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la catégorie:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors de la mise à jour de la catégorie",
    };
  }
}

/**
 * Version alternative pour suppression programmatique
 * Supprime la catégorie et soft delete tous les produits associés
 */
export async function deleteCategoryById(id: string): Promise<ActionResponse<DeleteCategoryResponse>> {
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

    // Vérifier existence et compter les produits actifs (non soft deleted)
    const existingCategory = await prisma.category.findUnique({
      where: { id },
      include: {
        products: {
          where: {
            deletedAt: null, // Seulement les produits actifs
          },
          select: {
            id: true,
          },
        },
      },
    });

    if (!existingCategory) {
      return {
        success: false,
        error: "Catégorie introuvable",
      };
    }

    const activeProductsCount = existingCategory.products.length;

    // Soft delete tous les produits actifs de cette catégorie
    if (activeProductsCount > 0) {
      await prisma.product.updateMany({
        where: {
          categoryId: id,
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
        },
      });
    }

    // Suppression de la catégorie
    await prisma.category.delete({
      where: { id },
    });

    // Revalidation
    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/");

    return {
      success: true,
      data: {
        id,
        deletedProductsCount: activeProductsCount,
      },
    };
  } catch (error) {
    console.error("Erreur lors de la suppression de la catégorie:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors de la suppression de la catégorie",
    };
  }
}
