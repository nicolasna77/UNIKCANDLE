import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { verifyAdminAccess } from "@/lib/auth-session";

/**
 * GET /api/admin/products
 * Récupère tous les produits pour l'interface admin
 * Note: Les mutations (POST, PUT, DELETE) utilisent les Server Actions dans app/actions/products.ts
 */
export async function GET() {
  // Verify admin authentication
  const authError = await verifyAdminAccess();
  if (authError) return authError;

  try {
    const products = await prisma.product.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        scent: true,
        category: true,
        images: true,
      },
      orderBy: {
        name: "asc",
      },
    });
    revalidatePath("/admin/products");
    return NextResponse.json(products);
  } catch (error) {
    console.error("Erreur lors de la récupération des produits:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des produits" },
      { status: 500 }
    );
  }
}
