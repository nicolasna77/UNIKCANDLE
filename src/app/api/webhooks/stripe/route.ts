import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import Stripe from "stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

interface CartItem {
  id: string;
  quantity: number;
  price: number;
  scentId: string;
}

export async function POST(req: Request) {
  console.log("=== Webhook Stripe appelé ===");
  console.log("URL de la requête:", req.url);
  console.log("Méthode:", req.method);
  console.log("Webhook secret configuré:", webhookSecret ? "Oui" : "Non");

  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    console.log("Signature reçue:", signature);

    if (!signature || !webhookSecret) {
      console.error("Erreur: Signature ou clé secrète manquante");
      return new NextResponse("Signature ou clé secrète manquante", {
        status: 400,
      });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log("Événement Stripe validé avec succès:", event.type);
    } catch (error) {
      console.error("Erreur de vérification de la signature Stripe:", error);
      return new NextResponse("Signature invalide", { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session & {
        shipping_details: {
          address: {
            line1: string;
            city: string;
            state: string;
            postal_code: string;
            country: string;
          };
        };
      };
      console.log("Session complétée - ID:", session.id);
      console.log("Client Reference ID:", session.client_reference_id);
      console.log("Métadonnées:", session.metadata);

      try {
        if (!session.metadata) {
          console.error("Erreur: Pas de métadonnées dans la session");
          throw new Error("Métadonnées de session manquantes");
        }

        const { orderId, items } = session.metadata;
        console.log("Order ID:", orderId);
        console.log("Items bruts:", items);

        const cartItems: CartItem[] = JSON.parse(items);
        console.log("Items parsés:", cartItems);

        // Vérifier si la commande existe déjà
        const existingOrder = await prisma.order.findUnique({
          where: { id: orderId },
        });

        if (existingOrder) {
          console.log("Commande déjà existante, arrêt du traitement");
          return new NextResponse(null, { status: 200 });
        }

        // Calculer le total
        const total = cartItems.reduce((sum: number, item: CartItem) => {
          return sum + item.price * item.quantity;
        }, 0);
        console.log("Total calculé:", total);

        // Vérifier la connexion à la base de données
        try {
          await prisma.$connect();
          console.log("Connexion à la base de données réussie");
        } catch (error) {
          console.error("Erreur de connexion à la base de données:", error);
          throw error;
        }

        // Créer la commande dans la base de données
        const order = await prisma.order.create({
          data: {
            userId: session.metadata.userId,
            total: session.amount_total ? session.amount_total / 100 : 0,
            items: {
              create: cartItems.map((item: CartItem) => ({
                productId: item.id,
                quantity: item.quantity,
                price: item.price,
                scentId: item.scentId,
              })),
            },
            shippingAddress: {
              create: {
                street: session.shipping_details?.address?.line1 || "",
                city: session.shipping_details?.address?.city || "",
                state: session.shipping_details?.address?.state || "",
                zipCode: session.shipping_details?.address?.postal_code || "",
                country: session.shipping_details?.address?.country || "",
              },
            },
          },
          include: {
            items: true,
            shippingAddress: true,
          },
        });

        console.log(
          "Commande créée avec succès:",
          JSON.stringify(order, null, 2)
        );

        return new NextResponse(null, { status: 200 });
      } catch (error) {
        console.error(
          "Erreur détaillée lors de la création de la commande:",
          error
        );
        return new NextResponse("Erreur lors de la création de la commande", {
          status: 500,
        });
      }
    }

    console.log("=== Fin du webhook Stripe ===");
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("Erreur générale du webhook:", error);
    return new NextResponse("Erreur interne du serveur", { status: 500 });
  }
}
