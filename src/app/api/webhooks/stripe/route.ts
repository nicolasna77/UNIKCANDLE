import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

interface CartItem {
  id: string;
  quantity: number;
  price: number;
  scentId: string;
  qrCodeId: string;
}

export async function POST(req: Request) {
  console.log("=== Webhook Stripe appelé ===");
  console.log("Webhook secret configuré:", webhookSecret ? "Oui" : "Non");

  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    console.log("Signature reçue:", signature);
    console.log("Corps de la requête:", body);

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
      console.log(
        "Données de l'événement:",
        JSON.stringify(event.data.object, null, 2)
      );
    } catch (error) {
      console.error("Erreur de vérification de la signature Stripe:", error);
      return new NextResponse("Signature invalide", { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
      console.log(
        "=== Traitement de l'événement checkout.session.completed ==="
      );
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

      try {
        console.log("Session complétée - ID:", session.id);
        console.log("Métadonnées de la session:", session.metadata);

        // Vérifier que toutes les données nécessaires sont présentes
        if (!session.metadata?.userId) {
          console.error("userId manquant dans les métadonnées");
          throw new Error("userId manquant dans les métadonnées");
        }

        if (!session.metadata?.items) {
          console.error("items manquant dans les métadonnées");
          throw new Error("items manquant dans les métadonnées");
        }

        const cartItems: CartItem[] = JSON.parse(session.metadata.items);
        console.log("Items du panier parsés:", cartItems);

        // Vérifier la connexion à la base de données
        try {
          await prisma.$connect();
          console.log("Connexion à la base de données réussie");
        } catch (error) {
          console.error("Erreur de connexion à la base de données:", error);
          throw error;
        }

        console.log("Création de la commande...");
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
          },
        });

        console.log("Commande créée avec succès:", order);

        console.log("Création des QR codes...");
        // Créer les QR codes pour chaque item de la commande
        await Promise.all(
          order.items.map((item, index) =>
            prisma.qRCode.create({
              data: {
                code: cartItems[index].qrCodeId,
                orderItemId: item.id,
              },
            })
          )
        );

        console.log("QR codes créés avec succès");
        console.log("Commande complète:", JSON.stringify(order, null, 2));

        return new NextResponse(null, { status: 200 });
      } catch (error) {
        console.error(
          "Erreur détaillée lors de la création de la commande:",
          error
        );
        if (error instanceof Error) {
          console.error("Message d'erreur:", error.message);
          console.error("Stack trace:", error.stack);
        }
        return new NextResponse("Erreur lors de la création de la commande", {
          status: 500,
        });
      }
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("Erreur générale du webhook:", error);
    if (error instanceof Error) {
      console.error("Message d'erreur:", error.message);
      console.error("Stack trace:", error.stack);
    }
    return new NextResponse("Erreur interne du serveur", { status: 500 });
  }
}
