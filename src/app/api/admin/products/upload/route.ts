import { NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 }
      );
    }

    // Vérification du type de fichier
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Le fichier doit être une image" },
        { status: 400 }
      );
    }

    // Génération d'un nom de fichier unique
    const timestamp = Date.now();
    const uniqueFilename = `${timestamp}-${file.name}`;

    const blob = await put(`products/${uniqueFilename}`, file, {
      access: "public",
      contentType: file.type,
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    logger.error("Erreur lors du téléchargement de l'image produit", error);
    return NextResponse.json(
      {
        error: `Erreur lors du téléchargement de l'image: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "URL de l'image requise" },
        { status: 400 }
      );
    }

    // Gérer les URLs relatives et absolues
    let pathname;
    if (imageUrl.startsWith("http")) {
      // URL absolue
      const url = new URL(imageUrl);
      pathname = url.pathname;
    } else {
      // URL relative
      pathname = imageUrl;
    }

    // Supprimer le blob
    await del(pathname);

    return NextResponse.json({
      success: true,
      message: "Image supprimée avec succès",
    });
  } catch (error) {
    logger.error("Erreur lors de la suppression de l'image produit", error);
    return NextResponse.json(
      {
        error: `Erreur lors de la suppression de l'image: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
      },
      { status: 500 }
    );
  }
}
