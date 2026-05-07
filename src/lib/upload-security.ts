// Simple in-memory rate limiter — resets on process restart (acceptable for abuse deterrence)
const ipUploadMap = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT = 10;        // max uploads
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

export function checkRateLimit(ip: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const entry = ipUploadMap.get(ip);

  if (!entry || now > entry.resetAt) {
    ipUploadMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { allowed: true };
  }

  if (entry.count >= RATE_LIMIT) {
    const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  entry.count += 1;
  return { allowed: true };
}

// Magic bytes for common audio formats
const AUDIO_SIGNATURES: { bytes: number[]; offset?: number; label: string }[] = [
  { bytes: [0x49, 0x44, 0x33], label: "MP3 (ID3)" },                          // ID3
  { bytes: [0xff, 0xfb], label: "MP3" },
  { bytes: [0xff, 0xf3], label: "MP3" },
  { bytes: [0xff, 0xf2], label: "MP3" },
  { bytes: [0x52, 0x49, 0x46, 0x46], label: "WAV (RIFF)" },                   // RIFF
  { bytes: [0x4f, 0x67, 0x67, 0x53], label: "OGG" },                          // OggS
  { bytes: [0x1a, 0x45, 0xdf, 0xa3], label: "WebM/MKA" },                     // EBML
  { bytes: [0x66, 0x74, 0x79, 0x70], offset: 4, label: "M4A/AAC (ftyp)" },   // ftyp box
  { bytes: [0x66, 0x4c, 0x61, 0x43], label: "FLAC" },                         // fLaC
];

export async function validateAudioMagicBytes(file: File): Promise<boolean> {
  // Read first 12 bytes to cover all signatures (ftyp is at offset 4)
  const slice = file.slice(0, 12);
  const buffer = await slice.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  return AUDIO_SIGNATURES.some(({ bytes: sig, offset = 0 }) =>
    sig.every((b, i) => bytes[offset + i] === b)
  );
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export function checkOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.BETTER_AUTH_URL ?? "";

  if (!appUrl) return true; // skip check if env not set (local dev)

  const allowed = [appUrl, "http://localhost:3000", "http://localhost:3001"];
  const source = origin ?? referer ?? "";
  return allowed.some((url) => source.startsWith(url));
}
