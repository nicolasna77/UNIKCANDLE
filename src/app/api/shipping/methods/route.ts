import { NextRequest, NextResponse } from "next/server";
import {
  getShippingMethods,
  getShippingProducts,
  normalizeV2Methods,
  normalizeV3Products,
  type NormalizedShippingMethod,
} from "@/lib/sendcloud";
import { logger } from "@/lib/logger";

// Cache en mémoire : 10 minutes
let cache: { data: NormalizedShippingMethod[]; ts: number } | null = null;
const CACHE_TTL = 10 * 60 * 1000;

// IDs autorisés — supporte UUID (v3) et entiers (v2)
// Configurer via SENDCLOUD_METHOD_IDS="c123b615-71ca-4fcb-b1c4-5a0a85a321e2,456"
function getAllowedIds(): string[] | null {
  const raw = process.env.SENDCLOUD_METHOD_IDS;
  if (!raw?.trim()) return null;
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

export async function GET(request: NextRequest) {
  const country = request.nextUrl.searchParams.get("country") ?? "FR";
  const bust = request.nextUrl.searchParams.get("bust") === "1";

  if (bust) cache = null;

  if (cache && Date.now() - cache.ts < CACHE_TTL) {
    return NextResponse.json(cache.data);
  }

  try {
    // Fetch v3 products (UUID) et v2 methods (int) en parallèle
    const [v3Products, v2Methods] = await Promise.all([
      getShippingProducts(),
      getShippingMethods(country),
    ]);

    const normalized: NormalizedShippingMethod[] = [
      ...normalizeV3Products(v3Products, country),
      ...normalizeV2Methods(v2Methods, country),
    ];

    // Dédoublonner : si un method v2 est déjà couvert par un product v3 (même methodId), on le retire
    const v3MethodIds = new Set(
      normalizeV3Products(v3Products, country).map((m) => m.methodId)
    );
    const deduped = normalized.filter(
      (m) => m.id.includes("-") || !v3MethodIds.has(m.methodId)
    );

    logger.info(`SendCloud: ${deduped.length} méthode(s) disponibles`, {
      v3: v3Products.length,
      v2: v2Methods.length,
      ids: deduped.map((m) => `${m.id} (${m.name})`),
    });

    // Filtrer par IDs si SENDCLOUD_METHOD_IDS est défini
    const allowedIds = getAllowedIds();
    const filtered = allowedIds
      ? deduped.filter((m) => allowedIds.includes(m.id))
      : deduped;

    if (filtered.length === 0) {
      logger.warn("SendCloud: aucune méthode après filtrage", {
        allowedIds,
        availableIds: deduped.map((m) => m.id),
      });
    }

    cache = { data: filtered, ts: Date.now() };
    return NextResponse.json(filtered);
  } catch (error) {
    logger.error("Erreur lors de la récupération des méthodes SendCloud", error);
    return NextResponse.json(
      { error: "Impossible de récupérer les méthodes de livraison" },
      { status: 500 }
    );
  }
}
