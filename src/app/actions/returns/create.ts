"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  type ActionResponse,
  requireAuth,
  validationError,
  errorResponse,
  successResponse,
} from "@/lib/action-helpers";
import { createReturnSchema, returnInclude } from "./schemas";

/**
 * Créer une demande de retour (utilisateur authentifié)
 */
export async function createReturn(data: unknown): Promise<ActionResponse> {
  try {
    const authResult = await requireAuth();
    if (!authResult.success) {
      return errorResponse(
        "Vous devez être connecté pour créer une demande de retour"
      );
    }

    const validatedFields = createReturnSchema.safeParse(data);

    if (!validatedFields.success) {
      return validationError(validatedFields.error.flatten().fieldErrors);
    }

    const { orderItemId, reason, description } = validatedFields.data;

    // Vérifier que l'article appartient à l'utilisateur
    const orderItem = await prisma.orderItem.findUnique({
      where: { id: orderItemId },
      include: { order: true },
    });

    if (!orderItem) {
      return errorResponse("Article de commande introuvable");
    }

    if (orderItem.order.userId !== authResult.userId) {
      return errorResponse("Cet article ne vous appartient pas");
    }

    // Vérifier qu'il n'y a pas déjà une demande de retour
    const existingReturn = await prisma.return.findFirst({
      where: { orderItemId },
    });

    if (existingReturn) {
      return errorResponse(
        "Une demande de retour existe déjà pour cet article"
      );
    }

    const returnRequest = await prisma.return.create({
      data: {
        orderItemId,
        reason,
        description,
        status: "REQUESTED",
        refundStatus: "PENDING",
      },
      include: returnInclude,
    });

    revalidatePath("/profil/orders");
    revalidatePath("/admin/returns");

    return successResponse(returnRequest);
  } catch (error) {
    console.error("Erreur lors de la création de la demande de retour:", error);
    return errorResponse("Erreur lors de la création de la demande de retour");
  }
}
