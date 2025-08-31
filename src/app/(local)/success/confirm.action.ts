"use server";

import OrderConfirmationEmail from "@/emails/confirm-orders";
import { Order } from "@/types/order";
import { Resend } from "resend";
import { render } from "@react-email/render";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import type { Stripe } from "stripe";

const resend = new Resend(process.env.RESEND_API_KEY);

type SessionWithDetails = Stripe.Checkout.Session & {
  shipping: {
    address: {
      line1: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
    };
  };
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

type OrderItemMetadata = {
  id: string;
  scentId: string;
  quantity: number;
  price: number;
  audioUrl?: string;
  qrCodeId: string;
};

export const sendConfirmationEmail = async (order: Order) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY n'est pas définie");
    }

    if (!order.user) {
      console.error("Utilisateur non trouvé dans la commande:", order);
      throw new Error("Utilisateur non trouvé dans la commande");
    }

    const html = await render(
      OrderConfirmationEmail({
        order,
        userName: order.user.name,
        userEmail: order.user.email,
      })
    );

    const { data, error } = await resend.emails.send({
      from: "UnikCandle <noreply@unikcandle.com>",
      to: order.user.email,
      subject: "Confirmation de votre commande UnikCandle",
      html,
      text: "Merci pour votre commande !", // Version texte simple
    });

    if (error) {
      console.error("Erreur Resend:", error);
      throw error;
    }

    console.log("Email envoyé avec succès:", data);
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    throw error;
  }
};

export async function createOrder({ sessionId }: { sessionId: string }) {
  try {
    console.log("Session ID reçu:", sessionId);

    // Récupérer la session Stripe
    const session = (await stripe.checkout.sessions.retrieve(sessionId, {
      expand: [
        "line_items",
        "customer",
        "shipping",
        "shipping_details",
        "line_items.data.price.product",
      ],
    })) as unknown as SessionWithDetails;

    if (!session) {
      console.error("Session Stripe non trouvée");
      throw new Error("Session non trouvée");
    }

    console.log("Session Stripe récupérée:", {
      id: session.id,
      metadata: session.metadata,
      customer: session.customer,
      shipping: session.shipping,
      shipping_details: session.shipping_details,
      line_items: session.line_items?.data.map((item) => ({
        product: item.price?.product,
        quantity: item.quantity,
        amount: item.amount_total,
      })),
    });

    console.log("Session Stripe complète:", JSON.stringify(session, null, 2));

    // Vérifier si la commande existe déjà
    const existingOrder = await prisma.order.findFirst({
      where: {
        id: session.metadata?.orderId,
      },
    });

    if (existingOrder) {
      console.log("Commande déjà existante:", existingOrder);
      return existingOrder;
    }

    // Récupérer les données de commande depuis la table temporaire
    const temporaryOrder = await prisma.temporaryOrder.findUnique({
      where: { orderId: session.metadata?.orderId },
    });

    if (!temporaryOrder) {
      console.error("Données de commande temporaires non trouvées pour orderId:", session.metadata?.orderId);
      throw new Error("Données de commande temporaires non trouvées");
    }

    const orderData = JSON.parse(temporaryOrder.orderData);
    const metadataItems = orderData.items as OrderItemMetadata[];

    const productIds = metadataItems.map((item) => item.id);
    const scentIds = metadataItems.map((item) => item.scentId).filter(Boolean);

    console.log("IDs des produits à vérifier:", productIds);
    console.log("IDs des senteurs à vérifier:", scentIds);

    if (productIds.length > 0) {
      const existingProducts = await prisma.product.findMany({
        where: {
          id: {
            in: productIds,
          },
        },
      });

      console.log(
        "Produits trouvés dans la base de données:",
        existingProducts.map((p) => p.id)
      );

      if (existingProducts.length !== productIds.length) {
        console.error(
          "Certains produits n'existent pas dans la base de données"
        );
        console.error("IDs recherchés:", productIds);
        console.error(
          "IDs trouvés:",
          existingProducts.map((p) => p.id)
        );
        throw new Error("Produits non trouvés");
      }
    }

    if (scentIds.length > 0) {
      const existingScents = await prisma.scent.findMany({
        where: {
          id: {
            in: scentIds,
          },
        },
      });

      console.log(
        "Senteurs trouvées dans la base de données:",
        existingScents.map((s) => s.id)
      );

      if (existingScents.length !== scentIds.length) {
        console.error(
          "Certaines senteurs n'existent pas dans la base de données"
        );
        console.error("IDs recherchés:", scentIds);
        console.error(
          "IDs trouvés:",
          existingScents.map((s) => s.id)
        );
        throw new Error("Senteurs non trouvées");
      }
    }

    // Créer la commande
    const order = await prisma.order.create({
      data: {
        id: session.metadata?.orderId || session.id,
        userId: session.metadata?.userId || "guest",
        status: "PROCESSING",
        items: {
          create: await Promise.all(
            metadataItems.map(async (item) => {
              return {
                productId: item.id,
                scentId: item.scentId,
                quantity: item.quantity,
                price: item.price,
                audioUrl: item.audioUrl,
                qrCode: {
                  create: {
                    code: item.qrCodeId,
                  },
                },
              };
            })
          ),
        },
        total: session.amount_total ? session.amount_total / 100 : 0,
        shippingAddress:
          session.collected_information?.shipping_details?.address ||
          session.customer_details?.address
            ? {
                create: {
                  street:
                    session.collected_information?.shipping_details?.address
                      ?.line1 ||
                    session.customer_details?.address?.line1 ||
                    "",
                  city:
                    session.collected_information?.shipping_details?.address
                      ?.city ||
                    session.customer_details?.address?.city ||
                    "",
                  state:
                    session.collected_information?.shipping_details?.address
                      ?.state ||
                    session.customer_details?.address?.state ||
                    "",
                  zipCode:
                    session.collected_information?.shipping_details?.address
                      ?.postal_code ||
                    session.customer_details?.address?.postal_code ||
                    "",
                  country:
                    session.collected_information?.shipping_details?.address
                      ?.country ||
                    session.customer_details?.address?.country ||
                    "FR",
                },
              }
            : undefined,
      },
      include: {
        items: {
          include: {
            product: true,
            scent: true,
            qrCode: true,
          },
        },
        shippingAddress: true,
      },
    });

    console.log("Nouvelle commande créée:", order);
    
    // Nettoyer la table temporaire après succès
    try {
      await prisma.temporaryOrder.delete({
        where: { orderId: session.metadata?.orderId },
      });
      console.log("Données temporaires nettoyées pour orderId:", session.metadata?.orderId);
    } catch (cleanupError) {
      console.warn("Erreur lors du nettoyage des données temporaires:", cleanupError);
    }
    
    return order;
  } catch (error) {
    console.error("Erreur lors de la création de la commande:", error);
    throw error;
  }
}
