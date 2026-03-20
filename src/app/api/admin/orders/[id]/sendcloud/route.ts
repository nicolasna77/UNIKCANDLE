import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminAccess } from "@/lib/auth-session";
import {
  createParcel,
  getParcel,
  getLabelUrl,
  calculateTotalWeight,
} from "@/lib/sendcloud";
import { logger } from "@/lib/logger";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await verifyAdminAccess();
  if (authError) return authError;

  const { id } = await params;
  const { action } = await request.json();

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      shippingAddress: true,
      user: true,
      items: true,
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
  }

  if (action === "create_parcel") {
    if (!order.shippingAddress) {
      return NextResponse.json(
        { error: "Aucune adresse de livraison" },
        { status: 400 }
      );
    }

    if (!order.shippingMethodId) {
      return NextResponse.json(
        { error: "Aucune méthode de livraison sélectionnée" },
        { status: 400 }
      );
    }

    try {
      const totalQuantity = order.items.reduce((s, i) => s + i.quantity, 0);

      const parcel = await createParcel({
        name: order.shippingAddress.name || order.user.name,
        address: order.shippingAddress.street,
        city: order.shippingAddress.city,
        postal_code: order.shippingAddress.zipCode,
        country: order.shippingAddress.country,
        email: order.user.email,
        weight: calculateTotalWeight(totalQuantity),
        shipment: { id: order.shippingMethodId },
        order_number: order.id,
        request_label: true,
      });

      await prisma.order.update({
        where: { id },
        data: {
          sendcloudParcelId: String(parcel.id),
          trackingNumber: parcel.tracking_number,
          trackingUrl: parcel.tracking_url,
        },
      });

      return NextResponse.json({
        parcelId: parcel.id,
        trackingNumber: parcel.tracking_number,
        trackingUrl: parcel.tracking_url,
      });
    } catch (error) {
      logger.error("Admin: Erreur création colis SendCloud", error);
      return NextResponse.json(
        { error: "Erreur lors de la création du colis" },
        { status: 500 }
      );
    }
  }

  if (action === "get_label") {
    if (!order.sendcloudParcelId) {
      return NextResponse.json(
        { error: "Aucun colis SendCloud associé" },
        { status: 400 }
      );
    }

    try {
      const parcel = await getParcel(parseInt(order.sendcloudParcelId, 10));
      const labelUrl = getLabelUrl(parcel);

      if (!labelUrl) {
        return NextResponse.json(
          { error: "Étiquette non disponible" },
          { status: 404 }
        );
      }

      return NextResponse.json({ labelUrl });
    } catch (error) {
      logger.error("Admin: Erreur récupération label SendCloud", error);
      return NextResponse.json(
        { error: "Erreur lors de la récupération de l'étiquette" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
}
