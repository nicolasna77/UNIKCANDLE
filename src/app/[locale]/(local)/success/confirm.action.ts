"use server";

import { stripe } from "@/lib/stripe";
import type { Stripe } from "stripe";
import prisma from "@/lib/prisma";

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
      console.error(
        "Données de commande temporaires non trouvées pour orderId:",
        session.metadata?.orderId
      );
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

    // Nettoyer la table temporaire après succès
    try {
      await prisma.temporaryOrder.delete({
        where: { orderId: session.metadata?.orderId },
      });
      console.log(
        "Données temporaires nettoyées pour orderId:",
        session.metadata?.orderId
      );
    } catch (cleanupError) {
      console.warn(
        "Erreur lors du nettoyage des données temporaires:",
        cleanupError
      );
    }

    return order;
  } catch (error) {
    console.error("Erreur lors de la création de la commande:", error);
    throw error;
  }
}
