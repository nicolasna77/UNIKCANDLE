import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

// GET - Récupérer toutes les demandes de retour (admin uniquement)
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

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
