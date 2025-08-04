import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { Return } from "@/generated/client";

// GET - Récupérer les retours d'un utilisateur
export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const orderItemId = searchParams.get("orderItemId");

    const where = {
      orderItem: {
        order: {
          userId: session.user.id,
        },
      },
      ...(orderItemId && { orderItemId }),
    };

    const returns = await prisma["return"].findMany({
      where,
      include: {
        orderItem: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
            scent: true,
            order: true,
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

// POST - Créer une demande de retour
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { orderItemId, reason, description } = await request.json();

    // Vérifier que l'orderItem appartient à l'utilisateur
    const orderItem = await prisma.orderItem.findFirst({
      where: {
        id: orderItemId,
        order: {
          userId: session.user.id,
        },
      },
      include: {
        order: true,
        Return: true,
      },
    });

    if (!orderItem) {
      return NextResponse.json(
        { error: "Article de commande non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que la commande est livrée
    if (orderItem.order.status !== "DELIVERED") {
      return NextResponse.json(
        {
          error:
            "Vous ne pouvez demander un retour que pour une commande livrée",
        },
        { status: 400 }
      );
    }

    // Vérifier qu'il n'y a pas déjà une demande de retour en cours
    const existingReturn = orderItem.Return.find(
      (ret: Return) =>
        ret.status === "REQUESTED" ||
        ret.status === "APPROVED" ||
        ret.status === "PROCESSING"
    );

    if (existingReturn) {
      return NextResponse.json(
        { error: "Une demande de retour est déjà en cours pour cet article" },
        { status: 400 }
      );
    }

    // Vérifier que la demande est faite dans les 30 jours
    const deliveryDate = orderItem.order.updatedAt;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    if (deliveryDate < thirtyDaysAgo) {
      return NextResponse.json(
        { error: "Le délai de retour (30 jours) est dépassé" },
        { status: 400 }
      );
    }

    // Créer la demande de retour
    const returnRequest = await prisma["return"].create({
      data: {
        orderItemId,
        reason,
        description,
        status: "REQUESTED",
      },
      include: {
        orderItem: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
            scent: true,
            order: true,
          },
        },
      },
    });

    return NextResponse.json(returnRequest, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de la demande de retour:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la demande de retour" },
      { status: 500 }
    );
  }
}
