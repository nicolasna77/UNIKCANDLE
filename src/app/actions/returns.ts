"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ReturnStatus } from "@prisma/client";
import { stripe } from "@/lib/stripe";
import { logger } from "@/lib/logger";

// Types pour les réponses
interface ActionResponse<T = unknown> {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  data?: T;
}

// Schéma de validation pour créer un retour
const createReturnSchema = z.object({
  orderItemId: z.string().min(1, "L'ID de l'article est requis"),
  reason: z.string().min(5, "La raison doit contenir au moins 5 caractères"),
  description: z.string().optional(),
});

// Schéma de validation pour mettre à jour le statut
const updateReturnStatusSchema = z.object({
  status: z.enum([
    "REQUESTED",
    "APPROVED",
    "REJECTED",
    "COMPLETED",
    "RETURN_SHIPPING_SENT",
    "RETURN_IN_TRANSIT",
    "RETURN_DELIVERED",
    "PROCESSING",
  ]),
  adminNote: z.string().optional(),
  refundAmount: z.number().optional(),
  returnInstructions: z.string().optional(),
  returnAddress: z.string().optional(),
  returnDeadline: z.string().optional(),
});

// Schéma de validation pour le tracking
const updateReturnTrackingSchema = z.object({
  status: z.string().optional(),
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
  trackingUrl: z.string().optional(),
});

/**
 * Créer une demande de retour
 */
export async function createReturn(data: unknown): Promise<ActionResponse> {
  try {
    // Vérification de l'authentification
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        success: false,
        error: "Vous devez être connecté pour créer une demande de retour",
      };
    }

    // Validation des données
    const validatedFields = createReturnSchema.safeParse(data);

    if (!validatedFields.success) {
      return {
        success: false,
        error: "Données invalides",
        fieldErrors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { orderItemId, reason, description } = validatedFields.data;

    // Vérifier que l'article appartient à l'utilisateur
    const orderItem = await prisma.orderItem.findUnique({
      where: { id: orderItemId },
      include: {
        order: true,
      },
    });

    if (!orderItem) {
      return {
        success: false,
        error: "Article de commande introuvable",
      };
    }

    if (orderItem.order.userId !== session.user.id) {
      return {
        success: false,
        error: "Cet article ne vous appartient pas",
      };
    }

    // Vérifier qu'il n'y a pas déjà une demande de retour
    const existingReturn = await prisma.return.findFirst({
      where: { orderItemId },
    });

    if (existingReturn) {
      return {
        success: false,
        error: "Une demande de retour existe déjà pour cet article",
      };
    }

    // Créer la demande de retour
    const returnRequest = await prisma.return.create({
      data: {
        orderItemId,
        reason,
        description,
        status: "REQUESTED",
        refundStatus: "PENDING",
      },
      include: {
        orderItem: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
            scent: true,
            order: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    // Revalidation
    revalidatePath("/profil/orders");
    revalidatePath("/admin/returns");

    return {
      success: true,
      data: returnRequest,
    };
  } catch (error) {
    console.error("Erreur lors de la création de la demande de retour:", error);
    return {
      success: false,
      error: "Erreur lors de la création de la demande de retour",
    };
  }
}

/**
 * Mettre à jour le statut d'un retour (admin uniquement)
 */
export async function updateReturnStatus(
  id: string,
  data: unknown
): Promise<ActionResponse> {
  try {
    // Vérification de l'authentification et du rôle admin
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "admin") {
      return {
        success: false,
        error: "Non autorisé",
      };
    }

    // Validation des données
    const validatedFields = updateReturnStatusSchema.safeParse(data);

    if (!validatedFields.success) {
      return {
        success: false,
        error: "Données invalides",
        fieldErrors: validatedFields.error.flatten().fieldErrors,
      };
    }

    // Mettre à jour le retour
    const updatedReturn = await prisma.return.update({
      where: { id },
      data: {
        ...validatedFields.data,
        status: validatedFields.data.status as ReturnStatus | undefined,
      },
      include: {
        orderItem: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
            scent: true,
            order: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    // Revalidation
    revalidatePath("/admin/returns");
    revalidatePath("/profil/orders");

    return {
      success: true,
      data: updatedReturn,
    };
  } catch (error) {
    console.error("Erreur lors de la mise à jour du retour:", error);
    return {
      success: false,
      error: "Erreur lors de la mise à jour du retour",
    };
  }
}

/**
 * Mettre à jour les informations de tracking (admin uniquement)
 */
export async function updateReturnTracking(
  id: string,
  data: unknown
): Promise<ActionResponse> {
  try {
    // Vérification de l'authentification et du rôle admin
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "admin") {
      return {
        success: false,
        error: "Non autorisé",
      };
    }

    // Validation des données
    const validatedFields = updateReturnTrackingSchema.safeParse(data);

    if (!validatedFields.success) {
      return {
        success: false,
        error: "Données invalides",
        fieldErrors: validatedFields.error.flatten().fieldErrors,
      };
    }

    // Mettre à jour le tracking
    const updatedReturn = await prisma.return.update({
      where: { id },
      data: {
        ...validatedFields.data,
        status: validatedFields.data.status as ReturnStatus | undefined,
      },
      include: {
        orderItem: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
            scent: true,
            order: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    // Revalidation
    revalidatePath("/admin/returns");
    revalidatePath("/profil/orders");

    return {
      success: true,
      data: updatedReturn,
    };
  } catch (error) {
    console.error("Erreur lors de la mise à jour du tracking:", error);
    return {
      success: false,
      error: "Erreur lors de la mise à jour du tracking",
    };
  }
}

/**
 * Supprimer une demande de retour (admin uniquement)
 */
export async function deleteReturn(id: string): Promise<ActionResponse> {
  try {
    // Vérification de l'authentification et du rôle admin
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "admin") {
      return {
        success: false,
        error: "Non autorisé",
      };
    }

    // Supprimer le retour
    await prisma.return.delete({
      where: { id },
    });

    // Revalidation
    revalidatePath("/admin/returns");
    revalidatePath("/profil/orders");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Erreur lors de la suppression du retour:", error);
    return {
      success: false,
      error: "Erreur lors de la suppression du retour",
    };
  }
}

/**
 * Traiter un remboursement Stripe (admin uniquement)
 * Note: Cette fonction fait appel à l'API Stripe - à compléter avec la logique Stripe
 */
export async function processRefund(
  id: string,
  refundAmount?: number
): Promise<ActionResponse> {
  try {
    // Vérification de l'authentification et du rôle admin
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user || session.user.role !== "admin") {
      return {
        success: false,
        error: "Non autorisé",
      };
    }

    // Récupérer le retour
    const returnRequest = await prisma.return.findUnique({
      where: { id },
      include: {
        orderItem: {
          include: {
            order: true,
          },
        },
      },
    });

    if (!returnRequest) {
      return {
        success: false,
        error: "Demande de retour introuvable",
      };
    }

    // Vérifier que le retour est approuvé
    if (returnRequest.status !== "APPROVED") {
      return {
        success: false,
        error: "Le retour doit être approuvé avant de traiter le remboursement",
      };
    }

    // Vérifier que le statut de remboursement est en attente
    if (returnRequest.refundStatus !== "PENDING") {
      return {
        success: false,
        error: "Ce retour a déjà été remboursé ou est en cours de traitement",
      };
    }

    // Vérifier que la commande a un payment intent Stripe
    if (!returnRequest.orderItem.order.stripePaymentIntentId) {
      logger.error("Payment Intent manquant pour le remboursement", {
        returnId: id,
        orderId: returnRequest.orderItem.order.id,
      });
      return {
        success: false,
        error:
          "Impossible de traiter le remboursement : informations de paiement manquantes",
      };
    }

    const amountToRefund = refundAmount || returnRequest.orderItem.price;

    // Mettre à jour le statut en cours de traitement
    await prisma.return.update({
      where: { id },
      data: {
        refundStatus: "PROCESSING",
        refundAmount: amountToRefund,
      },
    });

    try {
      // Créer le remboursement Stripe
      const refund = await stripe.refunds.create({
        payment_intent: returnRequest.orderItem.order.stripePaymentIntentId,
        amount: Math.round(amountToRefund * 100), // Convertir en centimes
        metadata: {
          returnId: id,
          orderItemId: returnRequest.orderItemId,
          orderId: returnRequest.orderItem.order.id,
          reason: returnRequest.reason,
        },
      });

      logger.info("Remboursement Stripe créé avec succès", {
        refundId: refund.id,
        returnId: id,
        amount: amountToRefund,
      });

      // Mettre à jour le retour avec les informations de remboursement
      const updatedReturn = await prisma.return.update({
        where: { id },
        data: {
          refundStatus: "COMPLETED",
          refundAmount: amountToRefund,
          refundedAt: new Date(),
          stripeRefundId: refund.id,
          status: "COMPLETED",
          processedAt: new Date(),
          adminNote: `Remboursement Stripe effectué : ${refund.id} - ${amountToRefund}€`,
        },
        include: {
          orderItem: {
            include: {
              product: {
                include: {
                  images: true,
                },
              },
              scent: true,
              order: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      });

      // Revalidation
      revalidatePath("/admin/returns");
      revalidatePath("/profil/orders");

      return {
        success: true,
        data: {
          return: updatedReturn,
          refundId: refund.id,
          message: `Remboursement de ${amountToRefund.toFixed(2)}€ effectué avec succès`,
        },
      };
    } catch (stripeError) {
      // En cas d'erreur Stripe, mettre à jour le statut en échec
      logger.error("Erreur lors du remboursement Stripe", {
        error: stripeError,
        returnId: id,
      });

      const errorMessage =
        stripeError instanceof Error
          ? stripeError.message
          : "Erreur inconnue";

      await prisma.return.update({
        where: { id },
        data: {
          refundStatus: "FAILED",
          adminNote: `Erreur de remboursement Stripe : ${errorMessage}`,
        },
      });

      return {
        success: false,
        error: `Erreur lors du remboursement Stripe : ${errorMessage}`,
      };
    }
  } catch (error) {
    logger.error("Erreur lors du traitement du remboursement", error);
    return {
      success: false,
      error: "Erreur lors du traitement du remboursement",
    };
  }
}
