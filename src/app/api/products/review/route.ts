import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { rateLimit, getIp } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const { allowed, resetAt } = rateLimit(
    `reviews:${getIp(request)}`,
    30,
    60_000
  );

  if (!allowed) {
    return NextResponse.json(
      { error: "Trop de requêtes, veuillez réessayer dans un moment." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)) },
      }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("query");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "5");

    if (!productId) {
      return NextResponse.json(
        { error: "L'ID du produit est requis" },
        { status: 400 }
      );
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: {
          productId: productId,
        },
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.review.count({
        where: {
          productId: productId,
        },
      }),
    ]);

    return NextResponse.json({
      reviews,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des commentaires:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des commentaires" },
      { status: 500 }
    );
  }
}
