import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import Stripe from "stripe";
import { sendConfirmationEmail } from "@/app/(local)/success/confirm.action";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

interface CartItem {
  id: string;
  quantity: number;
  price: number;
  scentId: string;
  qrCodeId: string;
  audioUrl?: string;
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, stripe-signature",
    },
  });
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
        shipping_details?: {
          address: {
            line1: string;
            city: string;
            state: string;
            postal_code: string;
            country: string;
          };
        };
        collected_information?: {
          shipping_details?: {
            address: {
              line1: string;
              city: string;
              state: string;
              postal_code: string;
              country: string;
            };
          };
        };
        customer_details?: {
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
        console.log("Détails du client:", session.customer_details);

        // Vérifier que toutes les données nécessaires sont présentes
        if (!session.metadata?.userId) {
          console.error("userId manquant dans les métadonnées");
          throw new Error("userId manquant dans les métadonnées");
        }

        if (!session.metadata?.orderId) {
          console.error("orderId manquant dans les métadonnées");
          throw new Error("orderId manquant dans les métadonnées");
        }

        // Récupérer les données de commande depuis la table temporaire
        const temporaryOrder = await prisma.temporaryOrder.findUnique({
          where: { orderId: session.metadata.orderId },
        });

        if (!temporaryOrder) {
          console.error(
            "Données de commande temporaires non trouvées pour orderId:",
            session.metadata.orderId
          );
          throw new Error("Données de commande temporaires non trouvées");
        }

        const orderData = JSON.parse(temporaryOrder.orderData);
        const cartItems: CartItem[] = orderData.items;
        console.log("Items du panier parsés:", cartItems);
        console.log(
          "Détail des items avec audio:",
          cartItems.map((item) => ({
            id: item.id,
            audioUrl: item.audioUrl,
            hasAudio: !!item.audioUrl,
          }))
        );

        // Vérifier la connexion à la base de données
        try {
          await prisma.$connect();
          console.log("Connexion à la base de données réussie");
        } catch (error) {
          console.error("Erreur de connexion à la base de données:", error);
          throw error;
        }

        // Récupérer l'utilisateur
        const user = await prisma.user.findUnique({
          where: { id: session.metadata.userId },
        });

        if (!user) {
          console.error("Utilisateur non trouvé:", session.metadata.userId);
          throw new Error("Utilisateur non trouvé");
        }

        console.log("Utilisateur trouvé:", user);

        console.log("Création de la commande...");
        // Créer la commande dans la base de données
        const order = await prisma.order.create({
          data: {
            userId: session.metadata.userId,
            total: session.amount_total ? session.amount_total / 100 : 0,
            items: {
              create: cartItems.map((item: CartItem) => {
                console.log("Création item avec audioUrl:", {
                  productId: item.id,
                  audioUrl: item.audioUrl,
                });
                return {
                  productId: item.id,
                  quantity: item.quantity,
                  price: item.price,
                  scentId: item.scentId,
                  audioUrl: item.audioUrl,
                };
              }),
            },
            shippingAddress: {
              create: {
                name: session.customer_details?.name || "",
                street:
                  session.shipping_details?.address?.line1 ||
                  session.collected_information?.shipping_details?.address
                    ?.line1 ||
                  session.customer_details?.address?.line1 ||
                  "",
                city:
                  session.shipping_details?.address?.city ||
                  session.collected_information?.shipping_details?.address
                    ?.city ||
                  session.customer_details?.address?.city ||
                  "",
                state:
                  session.shipping_details?.address?.state ||
                  session.collected_information?.shipping_details?.address
                    ?.state ||
                  session.customer_details?.address?.state ||
                  "",
                zipCode:
                  session.shipping_details?.address?.postal_code ||
                  session.collected_information?.shipping_details?.address
                    ?.postal_code ||
                  session.customer_details?.address?.postal_code ||
                  "",
                country:
                  session.shipping_details?.address?.country ||
                  session.collected_information?.shipping_details?.address
                    ?.country ||
                  session.customer_details?.address?.country ||
                  "",
              },
            },
          },
          include: {
            items: {
              include: {
                product: {
                  include: {
                    images: true,
                  },
                },
                scent: true,
              },
            },
            user: true,
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

        // Préparer les données pour l'email de confirmation
        const emailOrderData = {
          id: order.id,
          createdAt: order.createdAt,
          total: order.total,
          status: order.status as
            | "pending"
            | "processing"
            | "completed"
            | "cancelled",
          userId: order.userId,
          user: order.user,
          items: order.items.map((item) => ({
            id: item.id,
            name: item.product.name,
            imageUrl:
              item.product.images?.[0]?.url || "/placeholder-product.jpg",
            scentName: item.scent.name,
            quantity: item.quantity,
            price: item.price,
          })),
        };

        // Envoyer l'email de confirmation
        try {
          await sendConfirmationEmail(emailOrderData);
          console.log("Email de confirmation envoyé avec succès");
        } catch (emailError) {
          console.error(
            "Erreur lors de l'envoi de l'email de confirmation:",
            emailError
          );
          // Ne pas faire échouer la commande si l'email échoue
        }

        // Nettoyer la table temporaire après succès
        try {
          await prisma.temporaryOrder.delete({
            where: { orderId: session.metadata.orderId },
          });
          console.log(
            "Données temporaires nettoyées pour orderId:",
            session.metadata.orderId
          );
        } catch (cleanupError) {
          console.warn(
            "Erreur lors du nettoyage des données temporaires:",
            cleanupError
          );
        }

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
