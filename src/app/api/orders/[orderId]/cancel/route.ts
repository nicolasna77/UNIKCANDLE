import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(
  request: Request,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { orderId } = await context.params;

    // Récupérer la commande
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Commande introuvable" },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur est propriétaire de la commande
    if (order.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Vous n'êtes pas autorisé à annuler cette commande" },
        { status: 403 }
      );
    }

    // Vérifier que la commande peut être annulée (uniquement si PENDING ou PROCESSING)
    if (order.status !== "PENDING" && order.status !== "PROCESSING") {
      return NextResponse.json(
        {
          error: "Cette commande ne peut plus être annulée",
          message:
            order.status === "SHIPPED"
              ? "La commande est déjà expédiée"
              : order.status === "DELIVERED"
                ? "La commande a déjà été livrée"
                : "La commande a déjà été annulée",
        },
        { status: 400 }
      );
    }

    // Traiter le remboursement Stripe si applicable
    let refundData = {};
    if (order.stripePaymentIntentId) {
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
        const refund = await stripe.refunds.create({
          payment_intent: order.stripePaymentIntentId,
        });

        refundData = {
          stripeRefundId: refund.id,
          refundedAt: new Date(),
          refundAmount: refund.amount / 100, // Stripe uses cents
        };
      } catch (stripeError) {
        console.error("Erreur lors du remboursement Stripe:", stripeError);
        // Continue with cancellation even if refund fails
      }
    }

    // Annuler la commande et enregistrer les infos de remboursement
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "CANCELLED",
        updatedAt: new Date(),
        ...refundData,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Commande annulée avec succès",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Erreur lors de l'annulation de la commande:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de l'annulation de la commande",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
