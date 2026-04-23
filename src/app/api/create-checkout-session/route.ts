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
  audioUrl?: string;
  videoUrl?: string;
  textMessage?: string;
  engravingText?: string;
  engravingPrice?: number;
}

export async function POST(req: Request) {
  try {
    const session = await getUser();

    const body = await req.json();
    const { cartItems, selectedMethodId, shippingCost, shippingName } = body;

    if (!cartItems || cartItems.length === 0) {
      return new NextResponse("Le panier est vide", { status: 400 });
    }

    if (typeof selectedMethodId !== "number" || typeof shippingCost !== "number") {
      return new NextResponse("Méthode de livraison manquante", { status: 400 });
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

        const unitPrice =
          item.price +
          (item.engravingText && item.engravingPrice ? item.engravingPrice : 0);

        const descriptionParts = [`Senteur : ${item.selectedScent.name}`];
        if (item.engravingText) {
          descriptionParts.push(`Gravure : ${item.engravingText}`);
        }

        return {
          price_data: {
            currency: "eur",
            product_data: {
              name: item.name,
              description: descriptionParts.join(" | "),
              images: [imageUrl],
            },
            unit_amount: Math.round(unitPrice * 100),
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
      selectedMethodId,
      shippingCost,
      items: cartItemsWithCodes.map(
        (item: CheckoutItem & { qrCodeId: string }) => ({
          id: item.id,
          quantity: item.quantity || 1,
          scentId: item.selectedScent.id,
          price: item.price,
          qrCodeId: item.qrCodeId,
          audioUrl: item.audioUrl,
          videoUrl: item.videoUrl,
          textMessage: item.textMessage,
          engravingText: item.engravingText,
          engravingPrice: item.engravingPrice,
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

    const shippingDisplayName =
      typeof shippingName === "string" && shippingName.trim()
        ? shippingName.trim()
        : "Livraison";

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
              amount: Math.round(shippingCost * 100),
              currency: "eur",
            },
            display_name: shippingDisplayName,
          },
        },
      ],
      metadata: {
        orderId: orderId,
        userId: session?.id || "guest",
      },
    });

    return NextResponse.json({ sessionId: stripeSession.id, url: stripeSession.url });
  } catch (error) {
    logger.error("Erreur lors de la création de la session Stripe", error);
    return new NextResponse("Erreur interne du serveur", { status: 500 });
  }
}
