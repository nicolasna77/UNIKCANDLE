import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminAccess } from "@/lib/auth-session";
import { Prisma } from "@prisma/client";

// Limite maximale pour éviter les requêtes trop lourdes
const MAX_LIMIT = 100;
const MAX_SEARCH_LENGTH = 100;

export async function GET(request: Request) {
  // Verify admin authentication
  const authError = await verifyAdminAccess();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(searchParams.get("limit") || "10")));
    const roleFilter = searchParams.get("role") || "all";
    const statusFilter = searchParams.get("status") || "all";

    // Sanitize search input: limiter la longueur et supprimer caractères spéciaux regex
    const rawSearch = searchParams.get("search") || "";
    const search = rawSearch
      .substring(0, MAX_SEARCH_LENGTH)
      .replace(/[%_\\]/g, ""); // Supprimer caractères spéciaux SQL LIKE

    const skip = (page - 1) * limit;

    // Build where clause with proper typing
    const where: Prisma.UserWhereInput = {};

    // Search filter
    if (search.trim()) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // Role filter
    if (roleFilter !== "all") {
      where.role = roleFilter;
    }

    // Status filter
    if (statusFilter === "banned") {
      where.banned = true;
    } else if (statusFilter === "active") {
      where.banned = false;
    }

    // Parallelize all database queries
    const [totalUsers, users, stats, adminCount, bannedCount, unverifiedCount] = await Promise.all([
      // Get total count for pagination
      prisma.user.count({ where }),

      // Get users with stats
      prisma.user.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          banned: true,
          banReason: true,
          banExpires: true,
          image: true,
          emailVerified: true,
          _count: {
            select: {
              orders: true,
              reviews: true,
            },
          },
          orders: {
            select: {
              total: true,
            },
          },
        },
      }),

      // Get overview statistics
      prisma.user.aggregate({
        _count: true,
      }),

      prisma.user.count({
        where: { role: "admin" },
      }),

      prisma.user.count({
        where: { banned: true },
      }),

      prisma.user.count({
        where: { emailVerified: false },
      }),
    ]);

    // Calculate user stats
    const usersWithStats = users.map((user) => ({
      ...user,
      orderCount: user._count.orders,
      reviewCount: user._count.reviews,
      totalSpent: user.orders.reduce((sum, order) => sum + order.total, 0),
      _count: undefined,
      orders: undefined,
    }));

    return NextResponse.json({
      users: usersWithStats,
      pagination: {
        total: totalUsers,
        page,
        limit,
        pages: Math.ceil(totalUsers / limit),
      },
      stats: {
        total: stats._count,
        admins: adminCount,
        banned: bannedCount,
        unverified: unverifiedCount,
        active: stats._count - bannedCount,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des utilisateurs" },
      { status: 500 }
    );
  }
}
