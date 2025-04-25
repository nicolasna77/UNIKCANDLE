import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getUser } from "@/lib/auth-session";

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
}

interface CartItem {
  id: string;
  quantity: number;
  scentId: string;
  price: number;
}

export async function POST(req: Request) {
  console.log("=== Création de session Stripe ===");

  try {
    const session = await getUser();
    console.log("Session utilisateur:", session);

    const { cart } = await req.json();
    console.log("Panier reçu:", cart);

    if (!cart || cart.length === 0) {
      console.error("Panier vide");
      return new NextResponse("Le panier est vide", { status: 400 });
    }

    const lineItems = cart.map((item: CheckoutItem) => {
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
    });

    console.log("Line items créés:", lineItems);

    // Créer un identifiant unique pour cette commande
    const orderId = `order_${Date.now()}`;

    console.log("Création de la session Stripe avec les métadonnées:", {
      orderId,
      items: cart.map((item: CheckoutItem) => ({
        id: item.id,
        quantity: item.quantity || 1,
        scentId: item.selectedScent.id,
        price: item.price,
      })),
    });

    const stripeSession = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
      client_reference_id: session?.id || "guest",
      billing_address_collection: "required",
      shipping_address_collection: {
        allowed_countries: ["FR"],
      },
      metadata: {
        orderId,
        items: JSON.stringify(
          cart.map(
            (item: CheckoutItem): CartItem => ({
              id: item.id,
              quantity: item.quantity || 1,
              scentId: item.selectedScent.id,
              price: item.price,
            })
          )
        ),
      },
    });

    console.log("Session Stripe créée avec succès:", stripeSession.id);
    console.log("URL de redirection:", stripeSession.url);

    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    console.error("Erreur lors de la création de la session Stripe:", error);
    return new NextResponse("Erreur interne du serveur", { status: 500 });
  }
}
