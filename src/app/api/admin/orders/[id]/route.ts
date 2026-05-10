import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminAccess } from "@/lib/auth-session";
import { z } from "zod";

// Schéma de validation pour le status
const orderStatusSchema = z.object({
  status: z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"], {
    errorMap: () => ({
      message:
        "Statut invalide. Valeurs autorisées: PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED",
    }),
  }),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await verifyAdminAccess();
  if (authError) return authError;

  try {

    const body = await request.json();
    const id = (await params).id;

    // Validation du status
    const parsed = orderStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Données invalides" },
        { status: 400 }
      );
    }

    const order = await prisma.order.update({
      where: {
        id,
      },
      data: {
        status: parsed.data.status,
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du statut" },
      { status: 500 }
    );
  }
}
