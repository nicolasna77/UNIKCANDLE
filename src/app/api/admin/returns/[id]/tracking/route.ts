import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminAccess } from "@/lib/auth-session";
import { ReturnStatus } from "@prisma/client";

// POST - Ajouter des informations de suivi
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await verifyAdminAccess();
  if (authError) return authError;

  try {

    const { trackingNumber, carrier, trackingUrl, status } =
      await request.json();
    const id = (await params).id;

    const updateData: {
      updatedAt: Date;
      trackingNumber?: string;
      carrier?: string;
      trackingUrl?: string;
      status?: ReturnStatus;
      shippedAt?: Date;
    } = {
      updatedAt: new Date(),
    };

    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (carrier) updateData.carrier = carrier;
    if (trackingUrl) updateData.trackingUrl = trackingUrl;
    if (status) updateData.status = status as ReturnStatus;

    // Si on ajoute un numéro de suivi, marquer comme expédié
    if (trackingNumber && !updateData.status) {
      updateData.status = ReturnStatus.RETURN_SHIPPING_SENT;
      updateData.shippedAt = new Date();
    }

    const updatedReturn = await prisma.return.update({
      where: { id },
      data: updateData,
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
              },
            },
          },
        },
      },
    });

    return NextResponse.json(updatedReturn);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du suivi:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du suivi" },
      { status: 500 }
    );
  }
}

// PATCH - Mettre à jour le statut de livraison
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await verifyAdminAccess();
  if (authError) return authError;

  try {

    const { status } = await request.json();
    const id = (await params).id;

    const updateData: {
      status: ReturnStatus;
      updatedAt: Date;
      deliveredAt?: Date;
    } = {
      status: status as ReturnStatus,
      updatedAt: new Date(),
    };

    // Marquer la date de livraison si le colis est livré
    if (status === "RETURN_DELIVERED") {
      updateData.deliveredAt = new Date();
    }

    const updatedReturn = await prisma.return.update({
      where: { id },
      data: updateData,
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
              },
            },
          },
        },
      },
    });

    return NextResponse.json(updatedReturn);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du statut" },
      { status: 500 }
    );
  }
}
