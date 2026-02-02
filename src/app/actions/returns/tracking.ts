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
import { updateReturnTrackingSchema, returnInclude } from "./schemas";

/**
 * Mettre à jour les informations de tracking (admin uniquement)
 */
export async function updateReturnTracking(
  id: string,
  data: unknown
): Promise<ActionResponse> {
  try {
    const authResult = await requireAdmin();
    if (!authResult.success) return authResult.error;

    const validatedFields = updateReturnTrackingSchema.safeParse(data);

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
    console.error("Erreur lors de la mise à jour du tracking:", error);
    return errorResponse("Erreur lors de la mise à jour du tracking");
  }
}
