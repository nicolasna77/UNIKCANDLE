import { NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(request: Request) {
  try {
    console.log("=== Début de l'upload ===");

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    console.log("Session:", session?.user?.role);

    if (!session || session.user.role !== "admin") {
      console.log("Erreur: Utilisateur non autorisé");
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    console.log(
      "Fichier reçu:",
      file
        ? {
            name: file.name,
            size: file.size,
            type: file.type,
          }
        : "Aucun fichier"
    );

    if (!file) {
      console.log("Erreur: Aucun fichier fourni");
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 }
      );
    }

    // Vérification du type de fichier
    if (!file.type.startsWith("image/")) {
      console.log("Erreur: Type de fichier invalide:", file.type);
      return NextResponse.json(
        { error: "Le fichier doit être une image" },
        { status: 400 }
      );
    }

    // Génération d'un nom de fichier unique
    const timestamp = Date.now();
    const uniqueFilename = `${timestamp}-${file.name}`;

    console.log("Nom de fichier généré:", uniqueFilename);

    console.log("Tentative d'upload vers Vercel Blob...");
    const blob = await put(`products/${uniqueFilename}`, file, {
      access: "public",
      contentType: file.type,
    });

    console.log("Upload réussi:", blob.url);
    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("Erreur détaillée lors du téléchargement de l'image:", error);
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
    console.log("=== Début de la suppression ===");

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "admin") {
      console.log("Erreur: Utilisateur non autorisé");
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { imageUrl } = await request.json();
    console.log("URL à supprimer:", imageUrl);

    if (!imageUrl) {
      console.log("Erreur: URL de l'image requise");
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

    console.log("Pathname à supprimer:", pathname);

    // Supprimer le blob
    await del(pathname);

    console.log("Suppression réussie");
    return NextResponse.json({
      success: true,
      message: "Image supprimée avec succès",
    });
  } catch (error) {
    console.error("Erreur détaillée lors de la suppression de l'image:", error);
    return NextResponse.json(
      {
        error: `Erreur lors de la suppression de l'image: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
      },
      { status: 500 }
    );
  }
}
