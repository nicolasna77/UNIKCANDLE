import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import Stripe from "stripe";
import { sendConfirmationEmail } from "@/lib/email";
import { logger } from "@/lib/logger";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

interface CartItem {
  id: string;
  quantity: number;
  price: number;
  scentId: string;
  qrCodeId: string;
  audioUrl?: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature || !webhookSecret) {
      logger.error("Webhook Stripe: Signature ou clé secrète manquante");
      return new NextResponse("Signature ou clé secrète manquante", {
        status: 400,
      });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (error) {
      logger.error(
        "Webhook Stripe: Erreur de vérification de la signature",
        error
      );
      return new NextResponse("Signature invalide", { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
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
        // Vérifier que toutes les données nécessaires sont présentes
        if (!session.metadata?.userId) {
          throw new Error("userId manquant dans les métadonnées");
        }

        if (!session.metadata?.orderId) {
          throw new Error("orderId manquant dans les métadonnées");
        }

        // Récupérer les données de commande depuis la table temporaire
        const temporaryOrder = await prisma.temporaryOrder.findUnique({
          where: { orderId: session.metadata.orderId },
        });

        if (!temporaryOrder) {
          throw new Error("Données de commande temporaires non trouvées");
        }

        const orderData = JSON.parse(temporaryOrder.orderData);
        const cartItems: CartItem[] = orderData.items;

        // Vérifier la connexion à la base de données
        try {
          await prisma.$connect();
        } catch (error) {
          logger.error(
            "Webhook Stripe: Erreur de connexion à la base de données",
            error
          );
          throw error;
        }

        // Récupérer l'utilisateur
        const user = await prisma.user.findUnique({
          where: { id: session.metadata.userId },
        });

        if (!user) {
          throw new Error("Utilisateur non trouvé");
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
                audioUrl: item.audioUrl,
              })),
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
        } catch (emailError) {
          logger.error(
            "Webhook Stripe: Erreur lors de l'envoi de l'email de confirmation",
            emailError
          );
          // Ne pas faire échouer la commande si l'email échoue
        }

        // Nettoyer la table temporaire après succès
        try {
          await prisma.temporaryOrder.delete({
            where: { orderId: session.metadata.orderId },
          });
        } catch (cleanupError) {
          logger.warn(
            "Webhook Stripe: Erreur lors du nettoyage des données temporaires",
            { error: cleanupError }
          );
        }

        return new NextResponse(null, { status: 200 });
      } catch (error) {
        logger.error(
          "Webhook Stripe: Erreur lors de la création de la commande",
          error
        );
        return new NextResponse("Erreur lors de la création de la commande", {
          status: 500,
        });
      }
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    logger.error("Webhook Stripe: Erreur générale", error);
    return new NextResponse("Erreur interne du serveur", { status: 500 });
  }
}
