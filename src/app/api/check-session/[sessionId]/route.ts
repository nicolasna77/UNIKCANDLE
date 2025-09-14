import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    // Vérifier la session dans Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return new NextResponse("Session non trouvée", { status: 404 });
    }

    // Vérifier si la commande existe déjà dans la base de données
    const order = await prisma.order.findFirst({
      where: {
        id: session.metadata?.orderId,
      },
    });

    return NextResponse.json({
      processed: order !== null,
      status: session.status,
    });
  } catch (error) {
    console.error("Erreur lors de la vérification de la session:", error);
    return new NextResponse("Erreur interne du serveur", { status: 500 });
  }
}
