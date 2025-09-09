import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Dates pour les calculs de comparaison
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const last6Months = new Date(now.getFullYear(), now.getMonth() - 6, 1);

    const [
      totalUsers,
      totalOrders,
      totalProducts,
      ordersByStatus,
      topProducts,
      recentOrders,
      currentMonthUsers,
      lastMonthUsers,
      orders,
      monthlyStats,
    ] = await Promise.all([
      // Statistiques de base
      prisma.user.count(),
      prisma.order.count(),
      prisma.product.count(),

      // Commandes par statut
      prisma.order.groupBy({
        by: ["status"],
        _count: {
          status: true,
        },
      }),

      // Produits les plus vendus
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

      // Commandes récentes
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

      // Utilisateurs du mois actuel
      prisma.user.count({
        where: {
          createdAt: {
            gte: currentMonth,
          },
        },
      }),

      // Utilisateurs du mois précédent
      prisma.user.count({
        where: {
          createdAt: {
            gte: lastMonth,
            lt: currentMonth,
          },
        },
      }),

      // Toutes les commandes pour calculer le revenu
      prisma.order.findMany({
        select: {
          total: true,
          createdAt: true,
        },
      }),

      // Statistiques mensuelles pour les 6 derniers mois
      prisma.order.findMany({
        where: {
          createdAt: {
            gte: last6Months,
          },
        },
        select: {
          total: true,
          createdAt: true,
        },
      }),
    ]);

    // Calcul du revenu total et de la valeur moyenne des commandes
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calcul de la croissance des utilisateurs
    const userGrowthPercentage =
      lastMonthUsers > 0
        ? ((currentMonthUsers - lastMonthUsers) / lastMonthUsers) * 100
        : 0;

    // Calcul du revenu mensuel pour les 6 derniers mois
    const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const monthOrders = monthlyStats.filter(
        (order) => order.createdAt >= date && order.createdAt < nextMonth
      );

      const revenue = monthOrders.reduce((sum, order) => sum + order.total, 0);

      return {
        month: date.toLocaleDateString("fr-FR", {
          month: "short",
          year: "numeric",
        }),
        revenue: revenue,
      };
    }).reverse();

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
        productId: product.productId,
        name: productInfo?.name || "Produit inconnu",
        _count: product._count.productId,
      };
    });

    // Formatage des statuts des commandes
    const formattedOrdersByStatus = ordersByStatus.map((status) => ({
      status: status.status,
      _count: status._count.status,
    }));

    // Formatage des commandes récentes
    const formattedRecentOrders = recentOrders.map((order) => ({
      id: order.id,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt.toISOString(),
      user: {
        name: order.user.name,
      },
    }));

    return NextResponse.json({
      totalUsers,
      totalOrders,
      totalProducts,
      totalRevenue,
      averageOrderValue,
      ordersByStatus: formattedOrdersByStatus,
      topProducts: topProductsWithNames,
      recentOrders: formattedRecentOrders,
      monthlyRevenue,
      userGrowth: {
        current: currentMonthUsers,
        previous: lastMonthUsers,
        percentage: Math.round(userGrowthPercentage * 100) / 100,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des statistiques" },
      { status: 500 }
    );
  }
}
