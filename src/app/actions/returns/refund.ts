"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { stripe } from "@/lib/stripe";
import { logger } from "@/lib/logger";
import {
  type ActionResponse,
  requireAdmin,
  errorResponse,
  successResponse,
} from "@/lib/action-helpers";
import { returnInclude } from "./schemas";

/**
 * Traiter un remboursement Stripe (admin uniquement)
 */
export async function processRefund(
  id: string,
  refundAmount?: number
): Promise<ActionResponse> {
  try {
    const authResult = await requireAdmin();
    if (!authResult.success) return authResult.error;

    const returnRequest = await prisma.return.findUnique({
      where: { id },
      include: {
        orderItem: {
          include: { order: true },
        },
      },
    });

    if (!returnRequest) {
      return errorResponse("Demande de retour introuvable");
    }

    if (returnRequest.status !== "APPROVED") {
      return errorResponse(
        "Le retour doit être approuvé avant de traiter le remboursement"
      );
    }

    if (returnRequest.refundStatus !== "PENDING") {
      return errorResponse(
        "Ce retour a déjà été remboursé ou est en cours de traitement"
      );
    }

    if (!returnRequest.orderItem.order.stripePaymentIntentId) {
      logger.error("Payment Intent manquant pour le remboursement", {
        returnId: id,
        orderId: returnRequest.orderItem.order.id,
      });
      return errorResponse(
        "Impossible de traiter le remboursement : informations de paiement manquantes"
      );
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
        amount: Math.round(amountToRefund * 100),
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
        include: returnInclude,
      });

      revalidatePath("/admin/returns");
      revalidatePath("/profil/orders");

      return successResponse({
        return: updatedReturn,
        refundId: refund.id,
        message: `Remboursement de ${amountToRefund.toFixed(2)}€ effectué avec succès`,
      });
    } catch (stripeError) {
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

      return errorResponse(
        `Erreur lors du remboursement Stripe : ${errorMessage}`
      );
    }
  } catch (error) {
    logger.error("Erreur lors du traitement du remboursement", error);
    return errorResponse("Erreur lors du traitement du remboursement");
  }
}
