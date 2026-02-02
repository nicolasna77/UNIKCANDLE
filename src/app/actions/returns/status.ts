"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ReturnStatus } from "@prisma/client";
import {
  type ActionResponse,
  requireAdmin,
  validationError,
  errorResponse,
  successResponse,
} from "@/lib/action-helpers";
import { updateReturnStatusSchema, returnInclude } from "./schemas";

/**
 * Mettre à jour le statut d'un retour (admin uniquement)
 */
export async function updateReturnStatus(
  id: string,
  data: unknown
): Promise<ActionResponse> {
  try {
    const authResult = await requireAdmin();
    if (!authResult.success) return authResult.error;

    const validatedFields = updateReturnStatusSchema.safeParse(data);

    if (!validatedFields.success) {
      return validationError(validatedFields.error.flatten().fieldErrors);
    }

    const updatedReturn = await prisma.return.update({
      where: { id },
      data: {
        ...validatedFields.data,
        status: validatedFields.data.status as ReturnStatus | undefined,
      },
      include: returnInclude,
    });

    revalidatePath("/admin/returns");
    revalidatePath("/profil/orders");

    return successResponse(updatedReturn);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du retour:", error);
    return errorResponse("Erreur lors de la mise à jour du retour");
  }
}
