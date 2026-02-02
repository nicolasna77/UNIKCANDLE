"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  type ActionResponse,
  requireAdmin,
  errorResponse,
  successResponse,
} from "@/lib/action-helpers";

/**
 * Supprimer une demande de retour (admin uniquement)
 */
export async function deleteReturn(id: string): Promise<ActionResponse> {
  try {
    const authResult = await requireAdmin();
    if (!authResult.success) return authResult.error;

    await prisma.return.delete({
      where: { id },
    });

    revalidatePath("/admin/returns");
    revalidatePath("/profil/orders");

    return successResponse({ id });
  } catch (error) {
    console.error("Erreur lors de la suppression du retour:", error);
    return errorResponse("Erreur lors de la suppression du retour");
  }
}
