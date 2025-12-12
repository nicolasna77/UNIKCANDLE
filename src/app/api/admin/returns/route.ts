import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminAccess } from "@/lib/auth-session";

// GET - Récupérer toutes les demandes de retour (admin uniquement)
export async function GET() {
  // Verify admin authentication
  const authError = await verifyAdminAccess();
  if (authError) return authError;

  try {
    const returns = await prisma["return"].findMany({
      include: {
        orderItem: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
            scent: true,
            order: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
                shippingAddress: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(returns);
  } catch (error) {
    console.error("Erreur lors de la récupération des retours:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des retours" },
      { status: 500 }
    );
  }
}
