import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

// POST - Traiter le remboursement Stripe
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { refundAmount } = await request.json();
    const id = (await params).id;

    // Récupérer la demande de retour avec les informations de commande
    const returnRequest = await prisma["return"].findUnique({
      where: { id },
      include: {
        orderItem: {
          include: {
            order: true,
            product: true,
          },
        },
      },
    });

    if (!returnRequest) {
      return NextResponse.json(
        { error: "Demande de retour non trouvée" },
        { status: 404 }
      );
    }

    if (returnRequest.refundStatus !== "PENDING") {
      return NextResponse.json(
        {
          error: "Ce retour a déjà été remboursé ou est en cours de traitement",
        },
        { status: 400 }
      );
    }

    // Mettre à jour le statut en cours de traitement
    await prisma["return"].update({
      where: { id },
      data: {
        refundStatus: "PROCESSING",
        refundAmount: refundAmount || returnRequest.orderItem.price,
      },
    });

    try {
      // Pour trouver le payment intent, nous devons chercher dans Stripe
      // En production, vous devriez stocker le payment_intent_id dans la commande
      const orderId = returnRequest.orderItem.order.id;

      // Rechercher les sessions de checkout pour cette commande
      const sessions = await stripe.checkout.sessions.list({
        limit: 100,
      });

      let paymentIntentId = null;
      for (const session of sessions.data) {
        if (session.metadata?.orderId === orderId || session.id === orderId) {
          paymentIntentId = session.payment_intent as string;
          break;
        }
      }

      if (!paymentIntentId) {
        throw new Error("Payment Intent non trouvé pour cette commande");
      }

      // Créer le remboursement Stripe
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: Math.round(
          (refundAmount || returnRequest.orderItem.price) * 100
        ), // Convertir en centimes
        metadata: {
          returnId: returnRequest.id,
          orderItemId: returnRequest.orderItemId,
          reason: returnRequest.reason,
        },
      });

      // Mettre à jour la demande de retour avec les informations de remboursement
      const updatedReturn = await prisma["return"].update({
        where: { id },
        data: {
          stripeRefundId: refund.id,
          refundedAt: new Date(),
          refundStatus: "COMPLETED",
          status: "COMPLETED",
          processedAt: new Date(),
          adminNote: `Remboursement automatique Stripe: ${refund.id}`,
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
                  user: {
                    select: {
                      name: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        refund,
        return: updatedReturn,
        message: `Remboursement de ${(refund.amount / 100).toFixed(2)}€ effectué avec succès`,
      });
    } catch (stripeError: unknown) {
      console.error("Erreur Stripe:", stripeError);
      const errorMessage =
        stripeError instanceof Error ? stripeError.message : "Erreur inconnue";

      // Mettre à jour le statut en échec
      await prisma["return"].update({
        where: { id },
        data: {
          refundStatus: "FAILED",
          adminNote: `Erreur de remboursement: ${errorMessage}`,
        },
      });

      return NextResponse.json(
        {
          error: "Erreur lors du remboursement Stripe",
          details: errorMessage,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Erreur lors du remboursement:", error);
    return NextResponse.json(
      { error: "Erreur lors du remboursement" },
      { status: 500 }
    );
  }
}
