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

    // Générer des codes uniques pour chaque article
    const cartItemsWithCodes = cart.map((item: CheckoutItem) => ({
      ...item,
      qrCodeId: nanoid(10), // Générer un code unique de 10 caractères
    }));

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

    console.log("Création de la session Stripe avec les métadonnées:", {
      orderId,
      items: cartItemsWithCodes.map(
        (item: CheckoutItem & { qrCodeId: string }) => ({
          id: item.id,
          quantity: item.quantity || 1,
          scentId: item.selectedScent.id,
          price: item.price,
          qrCodeId: item.qrCodeId,
        })
      ),
    });

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
      client_reference_id: session?.id || "guest",
      metadata: {
        userId: session?.id || "guest",
        items: JSON.stringify(
          cartItemsWithCodes.map(
            (item: CheckoutItem & { qrCodeId: string }) => ({
              id: item.id,
              quantity: item.quantity || 1,
              price: item.price,
              scentId: item.selectedScent.id,
              qrCodeId: item.qrCodeId,
            })
          )
        ),
      },
      shipping_address_collection: {
        allowed_countries: ["FR"],
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
