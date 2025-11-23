import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * GET /api/admin/products
 * Récupère tous les produits pour l'interface admin
 * Note: Les mutations (POST, PUT, DELETE) utilisent les Server Actions dans app/actions/products.ts
 */
export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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
