import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const [
      totalUsers,
      totalOrders,
      totalProducts,
      ordersByStatus,
      topProducts,
      recentOrders,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.product.count(),
      prisma.order.groupBy({
        by: ["status"],
        _count: {
          status: true,
        },
      }),
      prisma.orderItem.groupBy({
        by: ["productId"],
        _count: {
          productId: true,
        },
        orderBy: {
          _count: {
            productId: "desc",
          },
        },
        take: 5,
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      }),
    ]);

    // Calcul du revenu total et de la valeur moyenne des commandes
    const orders = await prisma.order.findMany({
      select: {
        total: true,
      },
    });

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Récupération des noms des produits les plus vendus
    const productIds = topProducts.map((p) => p.productId);
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const topProductsWithNames = topProducts.map((product) => {
      const productInfo = products.find((p) => p.id === product.productId);
      return {
        name: productInfo?.name || "Produit inconnu",
        sales: product._count.productId,
      };
    });

    return NextResponse.json({
      totalUsers,
      totalOrders,
      totalProducts,
      totalRevenue,
      averageOrderValue,
      ordersByStatus: ordersByStatus.map((status) => ({
        status: status.status,
        count: status._count.status,
      })),
      topProducts: topProductsWithNames,
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt.toISOString(),
        user: {
          name: order.user.name,
        },
      })),
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des statistiques" },
      { status: 500 }
    );
  }
}
