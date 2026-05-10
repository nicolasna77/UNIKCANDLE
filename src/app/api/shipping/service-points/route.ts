import { NextRequest, NextResponse } from "next/server";
import { getServicePoints } from "@/lib/sendcloud";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const country = searchParams.get("country") ?? "FR";
  const postal_code = searchParams.get("postal_code") ?? "";
  const carrier = searchParams.get("carrier") ?? undefined;

  if (!postal_code) {
    return NextResponse.json(
      { error: "Le code postal est requis" },
      { status: 400 }
    );
  }

  const points = await getServicePoints({ country, postal_code, carrier });
  return NextResponse.json(points);
}
