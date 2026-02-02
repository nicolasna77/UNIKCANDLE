import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminAccess } from "@/lib/auth-session";

export async function GET(request: NextRequest) {
  // Verify admin authentication
  const authError = await verifyAdminAccess();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const skip = (page - 1) * limit;

    // Build where clause
    const where = {
      ...(search && {
        user: {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        },
      }),
      ...(status && { status: status as "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" }),
    };

    // Fetch orders and count in parallel
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        select: {
          id: true,
          total: true,
          status: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          items: {
            select: {
              id: true,
              quantity: true,
              price: true,
              product: {
                select: {
                  id: true,
                  name: true,
                  images: {
                    take: 1,
                    select: { url: true },
                  },
                },
              },
              scent: {
                select: {
                  id: true,
                  name: true,
                },
              },
              qrCode: {
                select: {
                  id: true,
                  code: true,
                },
              },
            },
          },
          shippingAddress: {
            select: {
              id: true,
              name: true,
              street: true,
              city: true,
              state: true,
              zipCode: true,
              country: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des commandes:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des commandes" },
      { status: 500 }
    );
  }
}
