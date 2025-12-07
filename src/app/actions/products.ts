"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { productSchema, productUpdateSchema } from "@/lib/admin-schemas";

// Types pour les réponses
type ActionResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

/**
 * Créer un nouveau produit
 * Server Action avec validation Zod et progressive enhancement
 */
export async function createProduct(
  formData: FormData
): Promise<ActionResponse> {
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
        error: "Accès refusé. ",
      };
    }

    // Extraction des données du FormData
    const rawData = {
      name: formData.get("name"),
      nameEN: formData.get("nameEN") || "",
      description: formData.get("description"),
      descriptionEN: formData.get("descriptionEN") || "",
      price: formData.get("price"),
      subTitle: formData.get("subTitle"),
      subTitleEN: formData.get("subTitleEN") || "",
      slogan: formData.get("slogan"),
      sloganEN: formData.get("sloganEN") || "",
      categoryId: formData.get("categoryId"),
      scentId: formData.get("scentId"),
      arAnimation: formData.get("arAnimation") || "default",
      messageType: formData.get("messageType") || "audio",
      imageUrl: formData.get("imageUrl") || "",
      images: formData.get("images")
        ? JSON.parse(formData.get("images") as string)
        : undefined,
    };

    // Validation avec Zod (sécurité serveur primaire)
    const validatedFields = productSchema.safeParse(rawData);

    if (!validatedFields.success) {
      return {
        success: false,
        error: "Données invalides",
        fieldErrors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const data = validatedFields.data;

    // Vérification que le parfum existe
    const existingScent = await prisma.scent.findUnique({
      where: { id: data.scentId },
    });

    if (!existingScent) {
      return {
        success: false,
        error: "Le parfum sélectionné n'existe pas",
        fieldErrors: { scentId: ["Parfum invalide"] },
      };
    }

    // Vérification que la catégorie existe
    const existingCategory = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!existingCategory) {
      return {
        success: false,
        error: "La catégorie sélectionnée n'existe pas",
        fieldErrors: { categoryId: ["Catégorie invalide"] },
      };
    }

    // Création du produit
    const product = await prisma.product.create({
      data: {
        name: data.name,
        nameEN: data.nameEN || undefined,
        description: data.description,
        descriptionEN: data.descriptionEN || undefined,
        price: data.price,
        subTitle: data.subTitle,
        subTitleEN: data.subTitleEN || undefined,
        slogan: data.slogan,
        sloganEN: data.sloganEN || undefined,
        arAnimation: data.arAnimation || "default",
        category: {
          connect: { id: data.categoryId },
        },
        scent: {
          connect: { id: data.scentId },
        },
        images: data.images?.length
          ? {
              create: data.images,
            }
          : data.imageUrl
            ? {
                create: {
                  url: data.imageUrl,
                },
              }
            : undefined,
      },
      include: {
        scent: true,
        category: true,
        images: true,
      },
    });

    // Revalidation des pages affectées
    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/");

    return {
      success: true,
      data: product,
    };
  } catch (error) {
    console.error("Erreur lors de la création du produit:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors de la création du produit",
    };
  }
}

/**
 * Mettre à jour un produit existant
 * Server Action avec validation Zod
 */
export async function updateProduct(
  formData: FormData
): Promise<ActionResponse> {
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
    const productId = formData.get("id") as string;

    if (!productId) {
      return {
        success: false,
        error: "ID du produit manquant",
      };
    }

    // Vérifier que le produit existe
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return {
        success: false,
        error: "Produit introuvable",
      };
    }

    // Extraction des données du FormData
    const rawData = {
      id: productId,
      name: formData.get("name"),
      nameEN: formData.get("nameEN") || "",
      description: formData.get("description"),
      descriptionEN: formData.get("descriptionEN") || "",
      price: formData.get("price"),
      subTitle: formData.get("subTitle"),
      subTitleEN: formData.get("subTitleEN") || "",
      slogan: formData.get("slogan"),
      sloganEN: formData.get("sloganEN") || "",
      categoryId: formData.get("categoryId"),
      scentId: formData.get("scentId"),
      arAnimation: formData.get("arAnimation"),
      messageType: formData.get("messageType"),
      imageUrl: formData.get("imageUrl") || "",
      images: formData.get("images")
        ? JSON.parse(formData.get("images") as string)
        : undefined,
    };

    // Validation avec Zod
    const validatedFields = productUpdateSchema.safeParse(rawData);

    if (!validatedFields.success) {
      return {
        success: false,
        error: "Données invalides",
        fieldErrors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const data = validatedFields.data;

    // Vérifications des relations si elles sont modifiées
    if (data.scentId) {
      const existingScent = await prisma.scent.findUnique({
        where: { id: data.scentId },
      });

      if (!existingScent) {
        return {
          success: false,
          error: "Le parfum sélectionné n'existe pas",
          fieldErrors: { scentId: ["Parfum invalide"] },
        };
      }
    }

    if (data.categoryId) {
      const existingCategory = await prisma.category.findUnique({
        where: { id: data.categoryId },
      });

      if (!existingCategory) {
        return {
          success: false,
          error: "La catégorie sélectionnée n'existe pas",
          fieldErrors: { categoryId: ["Catégorie invalide"] },
        };
      }
    }

    // Gestion des images si fournies
    if (data.images && data.images.length > 0) {
      // Supprimer les anciennes images
      await prisma.image.deleteMany({
        where: { productId },
      });
    }

    // Mise à jour du produit
    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.nameEN !== undefined && { nameEN: data.nameEN || null }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.descriptionEN !== undefined && {
          descriptionEN: data.descriptionEN || null,
        }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.subTitle !== undefined && { subTitle: data.subTitle }),
        ...(data.subTitleEN !== undefined && {
          subTitleEN: data.subTitleEN || null,
        }),
        ...(data.slogan !== undefined && { slogan: data.slogan }),
        ...(data.sloganEN !== undefined && { sloganEN: data.sloganEN || null }),
        ...(data.arAnimation !== undefined && {
          arAnimation: data.arAnimation,
        }),
        ...(data.categoryId && {
          category: {
            connect: { id: data.categoryId },
          },
        }),
        ...(data.scentId && {
          scent: {
            connect: { id: data.scentId },
          },
        }),
        ...(data.images &&
          data.images.length > 0 && {
            images: {
              create: data.images,
            },
          }),
      },
      include: {
        scent: true,
        category: true,
        images: true,
      },
    });

    // Revalidation des pages affectées
    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath(`/products/${productId}`);
    revalidatePath("/");

    return {
      success: true,
      data: product,
    };
  } catch (error) {
    console.error("Erreur lors de la mise à jour du produit:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors de la mise à jour du produit",
    };
  }
}

/**
 * Supprimer un produit (soft delete)
 * Server Action avec validation
 */
export async function deleteProduct(
  formData: FormData
): Promise<ActionResponse> {
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

    const productId = formData.get("id") as string;

    if (!productId) {
      return {
        success: false,
        error: "ID du produit manquant",
      };
    }

    // Vérifier que le produit existe
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return {
        success: false,
        error: "Produit introuvable",
      };
    }

    // Soft delete
    await prisma.product.update({
      where: { id: productId },
      data: {
        deletedAt: new Date(),
      },
    });

    // Revalidation des pages affectées
    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/");

    return {
      success: true,
      data: { id: productId },
    };
  } catch (error) {
    console.error("Erreur lors de la suppression du produit:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors de la suppression du produit",
    };
  }
}

/**
 * Version alternative pour utilisation programmatique (sans FormData)
 * Utile pour les mutations React Query
 */
export async function createProductFromJSON(
  data: unknown
): Promise<ActionResponse> {
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

    // Validation avec Zod
    const validatedFields = productSchema.safeParse(data);

    if (!validatedFields.success) {
      return {
        success: false,
        error: "Données invalides",
        fieldErrors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const validData = validatedFields.data;

    // Vérifications des relations
    const [existingScent, existingCategory] = await Promise.all([
      prisma.scent.findUnique({ where: { id: validData.scentId } }),
      prisma.category.findUnique({ where: { id: validData.categoryId } }),
    ]);

    if (!existingScent) {
      return {
        success: false,
        error: "Le parfum sélectionné n'existe pas",
        fieldErrors: { scentId: ["Parfum invalide"] },
      };
    }

    if (!existingCategory) {
      return {
        success: false,
        error: "La catégorie sélectionnée n'existe pas",
        fieldErrors: { categoryId: ["Catégorie invalide"] },
      };
    }

    // Création du produit
    const product = await prisma.product.create({
      data: {
        name: validData.name,
        nameEN: validData.nameEN || undefined,
        description: validData.description,
        descriptionEN: validData.descriptionEN || undefined,
        price: validData.price,
        subTitle: validData.subTitle,
        subTitleEN: validData.subTitleEN || undefined,
        slogan: validData.slogan,
        sloganEN: validData.sloganEN || undefined,
        arAnimation: validData.arAnimation || "default",
        category: {
          connect: { id: validData.categoryId },
        },
        scent: {
          connect: { id: validData.scentId },
        },
        images: validData.images?.length
          ? {
              create: validData.images,
            }
          : validData.imageUrl
            ? {
                create: {
                  url: validData.imageUrl,
                },
              }
            : undefined,
      },
      include: {
        scent: true,
        category: true,
        images: true,
      },
    });

    // Revalidation
    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/");

    return {
      success: true,
      data: product,
    };
  } catch (error) {
    console.error("Erreur lors de la création du produit:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors de la création du produit",
    };
  }
}

/**
 * Version alternative pour mise à jour programmatique
 */
export async function updateProductFromJSON(
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

    // Vérifier que le produit existe
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return {
        success: false,
        error: "Produit introuvable",
      };
    }

    // Validation
    const payload =
      typeof data === "object" && data !== null
        ? { id, ...(data as Record<string, unknown>) }
        : { id };

    const validatedFields = productUpdateSchema.safeParse(payload);

    if (!validatedFields.success) {
      return {
        success: false,
        error: "Données invalides",
        fieldErrors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const validData = validatedFields.data;

    // Vérifications des relations si modifiées
    if (validData.scentId) {
      const scent = await prisma.scent.findUnique({
        where: { id: validData.scentId },
      });
      if (!scent) {
        return {
          success: false,
          error: "Parfum invalide",
        };
      }
    }

    if (validData.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: validData.categoryId },
      });
      if (!category) {
        return {
          success: false,
          error: "Catégorie invalide",
        };
      }
    }

    // Gestion des images si fournies
    if (validData.images && validData.images.length > 0) {
      // Supprimer les anciennes images
      await prisma.image.deleteMany({
        where: { productId: id },
      });
    }

    // Mise à jour
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(validData.name !== undefined && { name: validData.name }),
        ...(validData.nameEN !== undefined && {
          nameEN: validData.nameEN || null,
        }),
        ...(validData.description !== undefined && {
          description: validData.description,
        }),
        ...(validData.descriptionEN !== undefined && {
          descriptionEN: validData.descriptionEN || null,
        }),
        ...(validData.price !== undefined && { price: validData.price }),
        ...(validData.subTitle !== undefined && {
          subTitle: validData.subTitle,
        }),
        ...(validData.subTitleEN !== undefined && {
          subTitleEN: validData.subTitleEN || null,
        }),
        ...(validData.slogan !== undefined && { slogan: validData.slogan }),
        ...(validData.sloganEN !== undefined && {
          sloganEN: validData.sloganEN || null,
        }),
        ...(validData.arAnimation !== undefined && {
          arAnimation: validData.arAnimation,
        }),
        ...(validData.categoryId && {
          category: { connect: { id: validData.categoryId } },
        }),
        ...(validData.scentId && {
          scent: { connect: { id: validData.scentId } },
        }),
        ...(validData.images &&
          validData.images.length > 0 && {
            images: {
              create: validData.images,
            },
          }),
      },
      include: {
        scent: true,
        category: true,
        images: true,
      },
    });

    // Revalidation
    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath(`/products/${id}`);
    revalidatePath("/");

    return {
      success: true,
      data: product,
    };
  } catch (error) {
    console.error("Erreur lors de la mise à jour du produit:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors de la mise à jour du produit",
    };
  }
}

/**
 * Version alternative pour suppression programmatique
 */
export async function deleteProductById(id: string): Promise<ActionResponse> {
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
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return {
        success: false,
        error: "Produit introuvable",
      };
    }

    // Soft delete
    await prisma.product.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    // Revalidation
    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/");

    return {
      success: true,
      data: { id },
    };
  } catch (error) {
    console.error("Erreur lors de la suppression du produit:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors de la suppression du produit",
    };
  }
}
