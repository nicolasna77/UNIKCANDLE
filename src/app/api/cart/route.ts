import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const cart = cookieStore.get("cart");

    if (!cart?.value) {
      return NextResponse.json({ cart: [] });
    }

    try {
      const parsedCart = JSON.parse(cart.value);
      return NextResponse.json({ cart: parsedCart });
    } catch (parseError) {
      // Cookie corrompu, on le supprime et on retourne un panier vide
      console.error("Erreur lors du parsing du panier:", parseError);
      cookieStore.delete("cart");
      return NextResponse.json({ cart: [] });
    }
  } catch (error) {
    console.error("Erreur dans GET /api/cart:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du panier" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { cart } = await request.json();

    if (!Array.isArray(cart)) {
      return NextResponse.json(
        { error: "Le panier doit être un tableau" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    cookieStore.set("cart", JSON.stringify(cart), {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      sameSite: "lax",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur dans POST /api/cart:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du panier" },
      { status: 500 }
    );
  }
}
