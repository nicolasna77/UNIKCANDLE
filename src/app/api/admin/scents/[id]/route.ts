import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const data = await request.json();
    const id = (await params).id;

    const scent = await prisma.scent.update({
      where: {
        id,
      },
      data: {
        name: data.name,
        description: data.description,
        icon: data.icon,
        color: data.color,
      },
    });
    return NextResponse.json(scent);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la senteur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la senteur" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    await prisma.scent.delete({
      where: {
        id: (await params).id,
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression de la senteur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la senteur" },
      { status: 500 }
    );
  }
}
