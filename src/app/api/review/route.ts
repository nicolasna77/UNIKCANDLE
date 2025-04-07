import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { productId, rating, comment, userId } = await request.json();

  const review = await prisma.review.create({
    data: {
      product: {
        connect: {
          id: productId,
        },
      },
      rating,
      comment,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });

  return NextResponse.json(review);
}
