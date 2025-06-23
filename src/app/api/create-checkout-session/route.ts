import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getUser } from "@/lib/auth-session";
import { nanoid } from "nanoid";

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
  console.log("=== Création de session Stripe ===");
  try {
    const session = await getUser();
    console.log("Session utilisateur:", session);

    const body = await req.json();
    const { cartItems, returnUrl } = body;
    console.log("returnUrl", returnUrl);
    console.log("cartItems", cartItems);
    console.log("Panier reçu:", cartItems);
    console.log(
      "Détail des items avec audio:",
      cartItems.map((item: CheckoutItem) => ({
        id: item.id,
        name: item.name,
        audioUrl: item.audioUrl,
        hasAudio: !!item.audioUrl,
      }))
    );

    if (!cartItems || cartItems.length === 0) {
      console.error("Panier vide");
      return new NextResponse("Le panier est vide", { status: 400 });
    }

    // Générer des codes uniques pour chaque article
    const cartItemsWithCodes = cartItems.map((item: CheckoutItem) => ({
      ...item,
      qrCodeId: nanoid(10), // Générer un code unique de 10 caractères
    }));

    console.log(
      "Items avec codes QR:",
      cartItemsWithCodes.map((item: CheckoutItem & { qrCodeId: string }) => ({
        id: item.id,
        audioUrl: item.audioUrl,
        qrCodeId: item.qrCodeId,
      }))
    );

    const lineItems = cartItemsWithCodes.map(
      (item: CheckoutItem & { qrCodeId: string }) => {
        // Convertir l'URL de l'image en URL absolue si ce n'est pas déjà le cas
        const imageUrl = item.imageUrl.startsWith("http")
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

    console.log("Line items créés:", lineItems);

    // Créer un identifiant unique pour cette commande
    const orderId = `order_${Date.now()}`;

    console.log("Métadonnées finales:", {
      orderId,
      userId: session?.id,
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
    });

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl}`,
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
        userId: session?.id || "guest",
        orderId: orderId,
        items: JSON.stringify(
          cartItemsWithCodes.map(
            (item: CheckoutItem & { qrCodeId: string }) => ({
              id: item.id,
              quantity: item.quantity || 1,
              price: item.price,
              scentId: item.selectedScent.id,
              qrCodeId: item.qrCodeId,
              audioUrl: item.audioUrl,
            })
          )
        ),
      },
    });

    console.log("Session Stripe créée avec succès:", {
      id: stripeSession.id,
      metadata: stripeSession.metadata,
      itemsInMetadata: stripeSession.metadata?.items
        ? JSON.parse(stripeSession.metadata.items)
        : [],
    });
    console.log("URL de redirection:", stripeSession.url);

    return NextResponse.json({ sessionId: stripeSession.id });
  } catch (error) {
    console.error("Erreur lors de la création de la session Stripe:", error);
    return new NextResponse("Erreur interne du serveur", { status: 500 });
  }
}
