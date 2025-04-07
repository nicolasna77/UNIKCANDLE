import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const cart = cookieStore.get("cart");

  return NextResponse.json({
    cart: cart ? JSON.parse(cart.value) : [],
  });
}

export async function POST(request: Request) {
  const { cart } = await request.json();
  const cookieStore = await cookies();

  cookieStore.set("cart", JSON.stringify(cart), {
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 jours
    sameSite: "lax",
  });

  return NextResponse.json({ success: true });
}
