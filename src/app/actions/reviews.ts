"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { reviewSchema } from "@/lib/schemas";

// Types pour les réponses
type ActionResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

/**
 * Ajouter un avis sur un produit
 * Server Action avec validation Zod et progressive enhancement
 */
export async function addReview(formData: FormData): Promise<ActionResponse> {
  try {
    // Vérification de l'authentification
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        success: false,
        error: "Non autorisé. Veuillez vous connecter pour laisser un avis.",
      };
    }

    // Extraction des données du FormData
    const rawData = {
      productId: formData.get("productId"),
      rating: formData.get("rating"),
      comment: formData.get("comment"),
    };

    // Validation avec Zod (sécurité serveur primaire)
    const validatedFields = reviewSchema.safeParse(rawData);

    if (!validatedFields.success) {
      return {
        success: false,
        error: "Données invalides",
        fieldErrors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const data = validatedFields.data;

    // Vérifier que le produit existe
    const existingProduct = await prisma.product.findUnique({
      where: { id: data.productId },
    });

    if (!existingProduct) {
      return {
        success: false,
        error: "Produit introuvable",
        fieldErrors: { productId: ["Produit invalide"] },
      };
    }

    // Vérifier si l'utilisateur a déjà laissé un avis pour ce produit
    const existingReview = await prisma.review.findFirst({
      where: {
        productId: data.productId,
        userId: session.user.id,
      },
    });

    if (existingReview) {
      return {
        success: false,
        error: "Vous avez déjà laissé un avis pour ce produit",
      };
    }

    // Vérifier que l'utilisateur a acheté ce produit
    const orderItem = await prisma.orderItem.findFirst({
      where: {
        productId: data.productId,
        order: {
          userId: session.user.id,
          status: "DELIVERED", // Seulement les commandes livrées
        },
      },
    });

    if (!orderItem) {
      return {
        success: false,
        error: "Vous devez avoir acheté ce produit pour laisser un avis",
      };
    }

    // Création de l'avis
    const review = await prisma.review.create({
      data: {
        productId: data.productId,
        userId: session.user.id,
        rating: data.rating,
        comment: data.comment,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Revalidation des pages affectées
    revalidatePath(`/products/${data.productId}`);
    revalidatePath("/products");
    revalidatePath("/");

    return {
      success: true,
      data: review,
    };
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'avis:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors de l'ajout de votre avis",
    };
  }
}

/**
 * Supprimer un avis (utilisateur ou admin)
 * Server Action avec validation
 */
export async function deleteReview(formData: FormData): Promise<ActionResponse> {
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

    const reviewId = formData.get("id") as string;

    if (!reviewId) {
      return {
        success: false,
        error: "ID de l'avis manquant",
      };
    }

    // Vérifier que l'avis existe
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!existingReview) {
      return {
        success: false,
        error: "Avis introuvable",
      };
    }

    // Vérifier que l'utilisateur est le créateur ou admin
    if (
      existingReview.userId !== session.user.id &&
      session.user.role !== "admin"
    ) {
      return {
        success: false,
        error: "Vous ne pouvez pas supprimer cet avis",
      };
    }

    // Suppression de l'avis
    await prisma.review.delete({
      where: { id: reviewId },
    });

    // Revalidation des pages affectées
    revalidatePath(`/products/${existingReview.productId}`);
    revalidatePath("/products");
    revalidatePath("/");

    return {
      success: true,
      data: { id: reviewId },
    };
  } catch (error) {
    console.error("Erreur lors de la suppression de l'avis:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors de la suppression de l'avis",
    };
  }
}

/**
 * Mettre à jour un avis (utilisateur uniquement)
 * Server Action avec validation Zod
 */
export async function updateReview(formData: FormData): Promise<ActionResponse> {
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

    const reviewId = formData.get("id") as string;

    if (!reviewId) {
      return {
        success: false,
        error: "ID de l'avis manquant",
      };
    }

    // Vérifier que l'avis existe
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!existingReview) {
      return {
        success: false,
        error: "Avis introuvable",
      };
    }

    // Vérifier que l'utilisateur est le créateur
    if (existingReview.userId !== session.user.id) {
      return {
        success: false,
        error: "Vous ne pouvez pas modifier cet avis",
      };
    }

    // Extraction des données
    const rawData = {
      productId: existingReview.productId, // On garde le même produit
      rating: formData.get("rating"),
      comment: formData.get("comment"),
    };

    // Validation avec Zod
    const validatedFields = reviewSchema.safeParse(rawData);

    if (!validatedFields.success) {
      return {
        success: false,
        error: "Données invalides",
        fieldErrors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const data = validatedFields.data;

    // Mise à jour de l'avis
    const review = await prisma.review.update({
      where: { id: reviewId },
      data: {
        rating: data.rating,
        comment: data.comment,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Revalidation des pages affectées
    revalidatePath(`/products/${existingReview.productId}`);
    revalidatePath("/products");
    revalidatePath("/");

    return {
      success: true,
      data: review,
    };
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'avis:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors de la mise à jour de votre avis",
    };
  }
}

/**
 * Version alternative pour utilisation programmatique (sans FormData)
 */
export async function addReviewFromJSON(data: unknown): Promise<ActionResponse> {
  try {
    // Vérification de l'authentification
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        success: false,
        error: "Non autorisé",
      };
    }

    // Validation avec Zod
    const validatedFields = reviewSchema.safeParse(data);

    if (!validatedFields.success) {
      return {
        success: false,
        error: "Données invalides",
        fieldErrors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const validData = validatedFields.data;

    // Vérifier produit existe
    const existingProduct = await prisma.product.findUnique({
      where: { id: validData.productId },
    });

    if (!existingProduct) {
      return {
        success: false,
        error: "Produit introuvable",
      };
    }

    // Vérifier pas de doublon
    const existingReview = await prisma.review.findFirst({
      where: {
        productId: validData.productId,
        userId: session.user.id,
      },
    });

    if (existingReview) {
      return {
        success: false,
        error: "Vous avez déjà laissé un avis pour ce produit",
      };
    }

    // Vérifier achat
    const orderItem = await prisma.orderItem.findFirst({
      where: {
        productId: validData.productId,
        order: {
          userId: session.user.id,
          status: "DELIVERED",
        },
      },
    });

    if (!orderItem) {
      return {
        success: false,
        error: "Vous devez avoir acheté ce produit pour laisser un avis",
      };
    }

    // Création
    const review = await prisma.review.create({
      data: {
        productId: validData.productId,
        userId: session.user.id,
        rating: validData.rating,
        comment: validData.comment,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Revalidation
    revalidatePath(`/products/${validData.productId}`);
    revalidatePath("/products");
    revalidatePath("/");

    return {
      success: true,
      data: review,
    };
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'avis:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors de l'ajout de votre avis",
    };
  }
}

/**
 * Version alternative pour suppression programmatique
 */
export async function deleteReviewById(id: string): Promise<ActionResponse> {
  try {
    // Vérification de l'authentification
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        success: false,
        error: "Non autorisé",
      };
    }

    // Vérifier existence
    const existingReview = await prisma.review.findUnique({
      where: { id },
    });

    if (!existingReview) {
      return {
        success: false,
        error: "Avis introuvable",
      };
    }

    // Vérifier permissions
    if (
      existingReview.userId !== session.user.id &&
      session.user.role !== "admin"
    ) {
      return {
        success: false,
        error: "Vous ne pouvez pas supprimer cet avis",
      };
    }

    // Suppression
    await prisma.review.delete({
      where: { id },
    });

    // Revalidation
    revalidatePath(`/products/${existingReview.productId}`);
    revalidatePath("/products");
    revalidatePath("/");

    return {
      success: true,
      data: { id },
    };
  } catch (error) {
    console.error("Erreur lors de la suppression de l'avis:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors de la suppression de l'avis",
    };
  }
}
