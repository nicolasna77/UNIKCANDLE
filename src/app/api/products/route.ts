import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// Liste blanche des champs autorisés pour le tri
const ALLOWED_SORT_FIELDS = ["name", "price", "createdAt", "updatedAt"] as const;
type SortField = (typeof ALLOWED_SORT_FIELDS)[number];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const categoryId = searchParams.get("categoryId");

    // Validation du champ de tri contre la liste blanche
    const sortByParam = searchParams.get("sortBy") || "name";
    const sortBy: SortField = ALLOWED_SORT_FIELDS.includes(sortByParam as SortField)
      ? (sortByParam as SortField)
      : "name";

    // Validation de l'ordre de tri
    const sortOrderParam = searchParams.get("sortOrder") || "asc";
    const sortOrder = sortOrderParam === "desc" ? "desc" : "asc";

    // Optional includes to reduce payload size
    const includeParam = searchParams.get("include")?.split(",") || [];
    const includeAll = includeParam.length === 0;

    const skip = (page - 1) * limit;

    const where = {
      deletedAt: null,
      ...(categoryId && { categoryId }),
    };

    // Build include object based on query params
    const include: Prisma.ProductInclude = {};
    if (includeAll || includeParam.includes("category")) {
      include.category = true;
    }
    if (includeAll || includeParam.includes("scent")) {
      include.scent = true;
    }
    if (includeAll || includeParam.includes("images")) {
      include.images = true;
    }
    if (includeAll || includeParam.includes("reviews")) {
      include.reviews = {
        select: {
          rating: true,
        },
      };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      prisma.product.count({ where }),
    ]);

    const productsWithStats = products.map((product) => {
      // Type guard pour les reviews avec rating
      const reviews = product.reviews as { rating: number }[] | undefined;
      const ratings = reviews && Array.isArray(reviews)
        ? reviews.map((review) => review.rating)
        : [];
      const averageRating =
        ratings.length > 0
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length
          : 0;

      return {
        ...product,
        averageRating,
        reviewCount: ratings.length,
      };
    });

    return NextResponse.json({
      products: productsWithStats,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des produits:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des produits" },
      { status: 500 }
    );
  }
}
