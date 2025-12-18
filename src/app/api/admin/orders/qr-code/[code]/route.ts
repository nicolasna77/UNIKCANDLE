import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import QRCode from "qrcode";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    // Verify admin authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { code } = await params;

    if (!code) {
      return NextResponse.json({ error: "Code QR manquant" }, { status: 400 });
    }

    // Get base URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "localhost:3000";
    const fullBaseUrl =
      baseUrl.startsWith("http://") || baseUrl.startsWith("https://")
        ? baseUrl
        : `https://${baseUrl}`;

    // Generate QR code URL
    const qrUrl = `${fullBaseUrl}/ar/${code}`;

    // Generate SVG QR code
    const svgString = await QRCode.toString(qrUrl, {
      type: "svg",
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "M",
      margin: 1,
      width: 300,
    });

    // Return SVG with proper headers for download
    return new Response(svgString, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Content-Disposition": `attachment; filename="qr-code-${code}.svg"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Erreur lors de la génération du QR code SVG:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération du QR code" },
      { status: 500 }
    );
  }
}
