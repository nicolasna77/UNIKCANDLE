import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  validateVideoFile,
  generateSecureFilename,
} from "@/lib/upload-validation";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }

    const validation = validateVideoFile(file);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const filename = generateSecureFilename(file.name || `video-${Date.now()}.webm`);

    const blob = await put(`videos/${filename}`, file, {
      access: "public",
      contentType: file.type || "video/webm",
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("Erreur upload vidéo:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'upload de la vidéo" },
      { status: 500 }
    );
  }
}
