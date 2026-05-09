import { NextRequest, NextResponse } from "next/server";
import { getShippingMethods } from "@/lib/sendcloud";
import { logger } from "@/lib/logger";

// Cache en mémoire : 10 minutes
let cache: { data: unknown; ts: number } | null = null;
const CACHE_TTL = 10 * 60 * 1000;

// IDs des méthodes autorisées — configurer via SENDCLOUD_METHOD_IDS="123,456"
function getAllowedIds(): number[] | null {
  const raw = process.env.SENDCLOUD_METHOD_IDS;
  if (!raw?.trim()) return null;
  return raw.split(",").map((s) => parseInt(s.trim(), 10)).filter(Boolean);
}

export async function GET(request: NextRequest) {
  const country = request.nextUrl.searchParams.get("country") ?? "FR";
  const bust = request.nextUrl.searchParams.get("bust") === "1";

  // Vider le cache si demandé
  if (bust) cache = null;

  // Servir depuis le cache si valide
  if (cache && Date.now() - cache.ts < CACHE_TTL) {
    return NextResponse.json(cache.data);
  }

  try {
    const methods = await getShippingMethods(country);
    const allowedIds = getAllowedIds();

    logger.info(`SendCloud: ${methods.length} méthode(s) reçue(s) pour ${country}`, {
      allowedIds,
      carriers: [...new Set(methods.map((m) => m.carrier))],
    });

    // Filtrer par IDs si SENDCLOUD_METHOD_IDS est défini
    const filtered = allowedIds
      ? methods.filter((m) => allowedIds.includes(m.id))
      : methods;

    const normalized = filtered.map((m) => {
      const countryData = m.countries?.find((c) => c.iso_2 === country);
      const price = countryData?.price ?? m.price ?? 0;
      const leadTimeHours = countryData?.lead_time_hours ?? m.lead_time_hours ?? null;
      const leadTimeDays = countryData?.lead_time_days ?? m.lead_time_days ?? null;

      let deliveryDays: { min: number; max: number } | null = null;
      if (leadTimeDays != null && leadTimeDays > 0) {
        deliveryDays = { min: leadTimeDays, max: leadTimeDays };
      } else if (leadTimeHours != null && leadTimeHours > 0) {
        const days = Math.ceil(leadTimeHours / 24);
        deliveryDays = { min: days, max: days + 1 };
      }

      return {
        id: m.id,
        name: m.name,
        carrier: m.carrier,
        price: typeof price === "number" ? price : parseFloat(String(price)),
        min_weight: m.min_weight,
        max_weight: m.max_weight,
        deliveryDays,
      };
    });

    if (normalized.length === 0) {
      logger.warn("SendCloud: aucune méthode de livraison disponible", { country });
    }

    cache = { data: normalized, ts: Date.now() };
    return NextResponse.json(normalized);
  } catch (error) {
    logger.error("Erreur lors de la récupération des méthodes SendCloud", error);
    return NextResponse.json(
      { error: "Impossible de récupérer les méthodes de livraison" },
      { status: 500 }
    );
  }
}
