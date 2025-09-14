import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const scents = await prisma.scent.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        icon: true,
        color: true,
      },
    });

    return NextResponse.json(scents);
  } catch (error) {
    console.error("Erreur lors de la récupération des senteurs:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des senteurs" },
      { status: 500 }
    );
  }
}
