import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getUser } from "@/lib/auth-session";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { generateSecureQRCode } from "@/lib/qr-code";

interface CheckoutItem {
  id: string;
  quantity: number;
  price: number;
  name: string;
  selectedScent: {
    id: string;
    name: string;
  };
  imageUrl: string;
  audioUrl?: string; // URL de l'audio enregistré
}

export async function POST(req: Request) {
  try {
    const session = await getUser();

    const body = await req.json();
    const { cartItems } = body;

    if (!cartItems || cartItems.length === 0) {
      return new NextResponse("Le panier est vide", { status: 400 });
    }

    // Générer des codes uniques et cryptographiquement sécurisés pour chaque article
    const cartItemsWithCodes = cartItems.map((item: CheckoutItem) => ({
      ...item,
      qrCodeId: generateSecureQRCode(),
    }));

    const lineItems = cartItemsWithCodes.map(
      (item: CheckoutItem & { qrCodeId: string }) => {
        // Convertir l'URL de l'image en URL absolue si ce n'est pas déjà le cas
        const imageUrl = item.imageUrl.startsWith("https")
          ? item.imageUrl
          : `${process.env.NEXT_PUBLIC_APP_URL}${item.imageUrl}`;

        return {
          price_data: {
            currency: "eur",
            product_data: {
              name: item.name,
              description: `Senteur : ${item.selectedScent.name}`,
              images: [imageUrl],
            },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity || 1,
        };
      }
    );

    // Créer un identifiant unique pour cette commande
    const orderId = `order_${Date.now()}`;

    // Stocker les données complètes en base de données temporairement
    const orderData = {
      orderId,
      userId: session?.id || "guest",
      items: cartItemsWithCodes.map(
        (item: CheckoutItem & { qrCodeId: string }) => ({
          id: item.id,
          quantity: item.quantity || 1,
          scentId: item.selectedScent.id,
          price: item.price,
          qrCodeId: item.qrCodeId,
          audioUrl: item.audioUrl,
        })
      ),
    };

    // Créer un enregistrement temporaire pour cette session
    await prisma.temporaryOrder.create({
      data: {
        orderId: orderId,
        userId: session?.id || "guest",
        orderData: JSON.stringify(orderData),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
      },
    });

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart?cancelled=true`,
      client_reference_id: session?.id || "guest",
      shipping_address_collection: {
        allowed_countries: ["FR"],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: 0,
              currency: "eur",
            },
            display_name: "Livraison standard",
            delivery_estimate: {
              minimum: {
                unit: "business_day",
                value: 5,
              },
              maximum: {
                unit: "business_day",
                value: 20,
              },
            },
          },
        },
      ],
      metadata: {
        orderId: orderId,
        userId: session?.id || "guest",
      },
    });

    return NextResponse.json({ sessionId: stripeSession.id });
  } catch (error) {
    logger.error("Erreur lors de la création de la session Stripe", error);
    return new NextResponse("Erreur interne du serveur", { status: 500 });
  }
}
