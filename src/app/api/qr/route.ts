import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import QRCode from "qrcode";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { orderItemId } = await request.json();

    // Vérifier si l'orderItem existe et récupérer ses informations
    const orderItem = await prisma.orderItem.findUnique({
      where: { id: orderItemId },
      include: {
        scent: true,
        product: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!orderItem) {
      return NextResponse.json(
        { error: "Article de commande non trouvé" },
        { status: 404 }
      );
    }

    // Générer un code unique
    const code = Math.random().toString(36).substring(2, 15);

    // Générer le QR code
    const qrCodeData = await QRCode.toDataURL(
      `${process.env.NEXT_PUBLIC_APP_URL}/ar/${code}`
    );

    // Sauvegarder dans la base de données
    const qrCode = await prisma.qRCode.create({
      data: {
        orderItemId,
        code,
      },
    });

    return NextResponse.json({ qrCode, qrCodeData });
  } catch (error) {
    console.error("Erreur lors de la génération du QR code:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération du QR code" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json({ error: "Code QR requis" }, { status: 400 });
    }

    const qrCode = await prisma.qRCode.findUnique({
      where: { code },
      include: {
        orderItem: {
          include: {
            product: { include: { category: true, images: true } },
            scent: true,
          },
        },
      },
    });

    if (!qrCode) {
      return NextResponse.json(
        { error: "QR code non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      product: qrCode.orderItem?.product,
      audioUrl: qrCode.orderItem?.audioUrl,
      animationId: qrCode.orderItem?.animationId,
      scent: qrCode.orderItem?.scent,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du QR code:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du QR code" },
      { status: 500 }
    );
  }
}
