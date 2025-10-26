import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

interface OrderItem {
  productId: string;
  scentId: string;
  quantity: number;
  price: number;
  audioUrl?: string;
}

interface ShippingAddress {
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface CreateOrderRequest {
  userId: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
}

export async function POST(request: Request) {
  try {
    // Vérifier l'authentification et le rôle admin
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier le rôle admin
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Accès refusé - Admin uniquement" },
        { status: 403 }
      );
    }

    const body: CreateOrderRequest = await request.json();
    const { userId, items, shippingAddress } = body;

    // Validation des données
    if (!userId || !items || items.length === 0 || !shippingAddress) {
      return NextResponse.json(
        { error: "Données manquantes ou invalides" },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Calculer le total
    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Créer la commande
    const order = await prisma.order.create({
      data: {
        userId,
        total,
        status: "PROCESSING", // Commande manuelle commence en PROCESSING
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            scentId: item.scentId,
            quantity: item.quantity,
            price: item.price,
            audioUrl: item.audioUrl,
          })),
        },
        shippingAddress: {
          create: {
            name: shippingAddress.name,
            street: shippingAddress.street,
            city: shippingAddress.city,
            state: shippingAddress.state,
            zipCode: shippingAddress.zipCode,
            country: shippingAddress.country,
          },
        },
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
            scent: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        shippingAddress: true,
      },
    });

    // Générer les QR codes pour chaque item
    const qrCodes = await Promise.all(
      order.items.map(async (item) => {
        // Générer un code unique
        const code = Math.random().toString(36).substring(2, 15);

        return prisma.qRCode.create({
          data: {
            code,
            orderItemId: item.id,
          },
        });
      })
    );

    console.log("Commande manuelle créée avec succès:", order.id);
    console.log(`${qrCodes.length} QR codes générés`);

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        items: order.items.map((item, index) => ({
          ...item,
          qrCode: qrCodes[index],
        })),
      },
    });
  } catch (error) {
    console.error("Erreur lors de la création de la commande:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erreur lors de la création de la commande",
      },
      { status: 500 }
    );
  }
}
