import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier audio n'a été fourni" },
        { status: 400 }
      );
    }

    // Vérification du type de fichier audio
    if (!file.type.startsWith("audio/")) {
      return NextResponse.json(
        { error: "Le fichier doit être un fichier audio" },
        { status: 400 }
      );
    }

    // Génération d'un nom de fichier unique
    const timestamp = Date.now();
    const uniqueFilename = `audio/${timestamp}-${file.name}`;

    const token = process.env.BLOB_READ_WRITE_TOKEN;
    const blob = await put(uniqueFilename, file, {
      access: "public",
      contentType: file.type,
      token: token,
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("Erreur lors de l'upload audio:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'upload du fichier audio" },
      { status: 500 }
    );
  }
}
