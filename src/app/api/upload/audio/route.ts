import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { validateAudioFile, generateSecureFilename } from "@/lib/upload-validation";
import {
  checkRateLimit,
  validateAudioMagicBytes,
  getClientIp,
  checkOrigin,
} from "@/lib/upload-security";

export async function POST(request: Request) {
  try {
    // 1. Origin check
    if (!checkOrigin(request)) {
      return NextResponse.json({ error: "Origine non autorisée" }, { status: 403 });
    }

    // 2. Rate limiting par IP
    const ip = getClientIp(request);
    const rate = checkRateLimit(ip);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Trop de tentatives. Réessayez dans une heure." },
        {
          status: 429,
          headers: { "Retry-After": String(rate.retryAfterSeconds) },
        }
      );
    }

    // 3. Parse du FormData
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier audio fourni" }, { status: 400 });
    }

    // 4. Validation taille + MIME type + extension
    const validation = validateAudioFile(file);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // 5. Validation magic bytes (vérifie que le contenu est vraiment de l'audio)
    const isRealAudio = await validateAudioMagicBytes(file);
    if (!isRealAudio) {
      return NextResponse.json(
        { error: "Le fichier ne semble pas être un fichier audio valide" },
        { status: 400 }
      );
    }

    // 6. Upload vers Vercel Blob
    const secureFilename = generateSecureFilename(file.name);
    const blob = await put(`audio/${secureFilename}`, file, {
      access: "public",
      contentType: file.type,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("Erreur upload audio:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'upload du fichier audio" },
      { status: 500 }
    );
  }
}
