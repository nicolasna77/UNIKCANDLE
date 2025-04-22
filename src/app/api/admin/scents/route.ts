import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const scents = await prisma.scent.findMany({
      orderBy: {
        name: "asc",
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

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const scent = await prisma.scent.create({
      data: {
        name: data.name,
        description: data.description,
        icon: data.icon,
        color: data.color,
        model3dUrl: data.model3dUrl,
      },
    });
    return NextResponse.json(scent);
  } catch (error) {
    console.error("Erreur lors de la création de la senteur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la senteur" },
      { status: 500 }
    );
  }
}
