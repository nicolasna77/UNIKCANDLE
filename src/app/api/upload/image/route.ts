import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  validateImageFile,
  generateSecureFilename,
} from "@/lib/upload-validation";

export async function POST(request: Request) {
  try {
    // Vérification de l'authentification
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier n'a été fourni" },
        { status: 400 }
      );
    }

    // Validation du fichier image
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Générer un nom de fichier sécurisé
    const secureFilename = generateSecureFilename(file.name);

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    const blob = await put(`products/${secureFilename}`, file, {
      access: "public",
      contentType: file.type,
      token: token,
    });

    return NextResponse.json(blob);
  } catch (error) {
    console.error("Erreur lors de l'upload:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'upload du fichier" },
      { status: 500 }
    );
  }
}
