import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import Stripe from "stripe";
import { sendConfirmationEmail } from "@/lib/email";
import { logger } from "@/lib/logger";
import {
  createParcel,
  calculateTotalWeight,
  type ServicePoint,
} from "@/lib/sendcloud";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

interface CartItem {
  id: string;
  quantity: number;
  price: number;
  scentId: string;
  qrCodeId: string;
  audioUrl?: string;
  videoUrl?: string;
  textMessage?: string;
  engravingText?: string;
  engravingPrice?: number;
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
          phone?: string | null;
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

        // Vérification d'idempotence: vérifier si la commande existe déjà
        const existingOrder = await prisma.order.findFirst({
          where: {
            id: session.metadata.orderId,
          },
        });

        if (existingOrder) {
          logger.info(
            `Webhook Stripe: Commande ${session.metadata.orderId} déjà créée, ignorée (idempotence)`
          );
          return new NextResponse(null, { status: 200 });
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
        const selectedMethodId: number | undefined = orderData.selectedMethodId;
        const shippingCost: number = orderData.shippingCost ?? 0;
        const servicePoint: ServicePoint | null = orderData.servicePoint ?? null;
        const affiliateCode: string | null = orderData.affiliateCode ?? session.metadata?.affiliateCode ?? null;

        const userId = session.metadata!.userId;
        const orderTotal = session.amount_total ? session.amount_total / 100 : 0;

        // Récupérer user et affilié en parallèle
        const [user, affiliateForCommission] = await Promise.all([
          prisma.user.findUnique({ where: { id: userId } }),
          affiliateCode
            ? prisma.affiliate.findUnique({
                where: { code: affiliateCode, status: "ACTIVE" },
                select: { id: true, commissionRate: true, userId: true },
              })
            : Promise.resolve(null),
        ]);

        if (!user) {
          throw new Error("Utilisateur non trouvé");
        }

        // Créer la commande et les QR codes dans une transaction atomique
        const order = await prisma.$transaction(async (tx) => {
          const createdOrder = await tx.order.create({
            data: {
              userId,
              total: orderTotal,
              shippingCost,
              shippingMethodId: selectedMethodId,
              affiliateCode: affiliateForCommission ? affiliateCode : null,
              affiliateId: affiliateForCommission?.id ?? null,
              items: {
                create: cartItems.map((item: CartItem) => ({
                  productId: item.id,
                  quantity: item.quantity,
                  price:
                    item.price +
                    (item.engravingText && item.engravingPrice
                      ? item.engravingPrice
                      : 0),
                  scentId: item.scentId,
                  audioUrl: item.audioUrl,
                  videoUrl: item.videoUrl,
                  textMessage: item.textMessage,
                  engravingText: item.engravingText,
                })),
              },
              shippingAddress: {
                create: servicePoint
                  ? {
                      // Adresse du point relais
                      name: `${servicePoint.name} (Point relais)`,
                      street: `${servicePoint.street} ${servicePoint.house_number}`.trim(),
                      city: servicePoint.city,
                      state: "",
                      zipCode: servicePoint.postal_code,
                      country: servicePoint.country,
                      phone: session.customer_details?.phone || null,
                    }
                  : {
                      // Adresse domicile collectée par Stripe
                      name: session.customer_details?.name || "",
                      phone: session.customer_details?.phone || null,
                      street:
                        session.shipping_details?.address?.line1 ||
                        session.collected_information?.shipping_details?.address?.line1 ||
                        session.customer_details?.address?.line1 ||
                        "",
                      city:
                        session.shipping_details?.address?.city ||
                        session.collected_information?.shipping_details?.address?.city ||
                        session.customer_details?.address?.city ||
                        "",
                      state:
                        session.shipping_details?.address?.state ||
                        session.collected_information?.shipping_details?.address?.state ||
                        session.customer_details?.address?.state ||
                        "",
                      zipCode:
                        session.shipping_details?.address?.postal_code ||
                        session.collected_information?.shipping_details?.address?.postal_code ||
                        session.customer_details?.address?.postal_code ||
                        "",
                      country:
                        session.shipping_details?.address?.country ||
                        session.collected_information?.shipping_details?.address?.country ||
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
              shippingAddress: true,
            },
          });

          // Créer les QR codes en mappant par productId (pas par index)
          await Promise.all(
            createdOrder.items.map((item) => {
              const cartItem = cartItems.find(
                (c: CartItem) => c.id === item.productId
              );
              if (!cartItem) {
                throw new Error(
                  `Cart item introuvable pour le produit ${item.productId}`
                );
              }
              return tx.qRCode.create({
                data: {
                  code: cartItem.qrCodeId,
                  orderItemId: item.id,
                },
              });
            })
          );

          // Créer la commission affilié si applicable
          if (affiliateForCommission) {
            const commissionAmount = parseFloat(
              ((orderTotal * affiliateForCommission.commissionRate) / 100).toFixed(2)
            );
            await tx.affiliateCommission.create({
              data: {
                affiliateId: affiliateForCommission.id,
                orderId: createdOrder.id,
                amount: commissionAmount,
                rate: affiliateForCommission.commissionRate,
                status: "PENDING",
              },
            });
            await tx.affiliate.update({
              where: { id: affiliateForCommission.id },
              data: { totalEarned: { increment: commissionAmount } },
            });
          }

          return createdOrder;
        });

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

        // Créer le colis SendCloud (hors transaction)
        if (selectedMethodId && order.shippingAddress) {
          try {
            const totalQuantity = order.items.reduce(
              (sum, i) => sum + i.quantity,
              0
            );

            // SendCloud reçoit toujours l'adresse du destinataire (client).
            // Pour un point relais, to_service_point indique où livrer ;
            // l'adresse client reste celle collectée par Stripe.
            const stripeStreet =
              session.shipping_details?.address?.line1 ||
              session.collected_information?.shipping_details?.address?.line1 ||
              session.customer_details?.address?.line1 || "";
            const stripeCity =
              session.shipping_details?.address?.city ||
              session.collected_information?.shipping_details?.address?.city ||
              session.customer_details?.address?.city || "";
            const stripeZip =
              session.shipping_details?.address?.postal_code ||
              session.collected_information?.shipping_details?.address?.postal_code ||
              session.customer_details?.address?.postal_code || "";
            const stripeCountry =
              session.shipping_details?.address?.country ||
              session.collected_information?.shipping_details?.address?.country ||
              session.customer_details?.address?.country || "";

            const deliveryAddress = {
              name: session.customer_details?.name || order.user.name,
              address: stripeStreet,
              city: stripeCity,
              postal_code: stripeZip,
              country: stripeCountry,
            };

            const parcel = await createParcel({
              ...deliveryAddress,
              email: order.user.email,
              weight: calculateTotalWeight(totalQuantity),
              shipment: { id: selectedMethodId },
              order_number: order.id,
              request_label: true,
              ...(servicePoint ? { to_service_point: servicePoint.id } : {}),
            });

            await prisma.order.update({
              where: { id: order.id },
              data: {
                sendcloudParcelId: String(parcel.id),
                trackingNumber: parcel.tracking_number,
                trackingUrl: parcel.tracking_url,
              },
            });

            logger.info(
              `Webhook Stripe: Colis SendCloud créé (parcel #${parcel.id}) pour la commande ${order.id}`
            );
          } catch (sendcloudError) {
            logger.error(
              "Webhook Stripe: Erreur lors de la création du colis SendCloud",
              sendcloudError
            );
            // Ne pas faire échouer la commande si SendCloud échoue
          }
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
