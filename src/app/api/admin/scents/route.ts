import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { scentSchema } from "@/lib/admin-schemas";
import { revalidatePath } from "next/cache";

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

    // Validation avec Zod - Sécurité primaire
    const validatedFields = scentSchema.safeParse(data);

    if (!validatedFields.success) {
      return NextResponse.json(
        {
          error: "Données invalides",
          details: validatedFields.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const { name, description, icon, color, notes } = validatedFields.data;

    const scent = await prisma.scent.create({
      data: {
        name,
        description,
        icon,
        color,
        notes: notes || [],
      },
    });

    // Revalidation des pages affectées
    revalidatePath("/admin/scents");
    revalidatePath("/products");
    revalidatePath("/");

    return NextResponse.json(scent);
  } catch (error) {
    console.error("Erreur lors de la création de la senteur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la senteur" },
      { status: 500 }
    );
  }
}
