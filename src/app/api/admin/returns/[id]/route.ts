import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

// PATCH - Mettre à jour le statut d'une demande de retour
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { status, adminNote, refundAmount } = await request.json();
    const id = (await params).id;

    // Vérifier que le retour existe
    const existingReturn = await prisma["return"].findUnique({
      where: { id },
      include: {
        orderItem: {
          include: {
            product: true,
            order: true,
          },
        },
      },
    });

    if (!existingReturn) {
      return NextResponse.json(
        { error: "Demande de retour non trouvée" },
        { status: 404 }
      );
    }

    // Préparer les données de mise à jour
    const updateData: {
      status:
        | "REQUESTED"
        | "APPROVED"
        | "REJECTED"
        | "PROCESSING"
        | "COMPLETED";
      processedAt: Date;
      adminNote?: string;
      refundAmount?: number;
    } = {
      status: status as
        | "REQUESTED"
        | "APPROVED"
        | "REJECTED"
        | "PROCESSING"
        | "COMPLETED",
      processedAt: new Date(),
    };

    if (adminNote) {
      updateData.adminNote = adminNote;
    }

    if (refundAmount !== undefined) {
      updateData.refundAmount = refundAmount;
    }

    // Mettre à jour la demande de retour
    const updatedReturn = await prisma["return"].update({
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
                shippingAddress: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(updatedReturn);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du retour:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du retour" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une demande de retour
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const id = (await params).id;

    await prisma["return"].delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Demande de retour supprimée avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression du retour:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du retour" },
      { status: 500 }
    );
  }
}
