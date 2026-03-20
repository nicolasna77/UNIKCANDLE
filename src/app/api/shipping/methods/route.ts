import { NextRequest, NextResponse } from "next/server";
import { getShippingMethods } from "@/lib/sendcloud";
import { logger } from "@/lib/logger";

// Cache en mémoire : 10 minutes
let cache: { data: unknown; ts: number } | null = null;
const CACHE_TTL = 10 * 60 * 1000;

export async function GET(request: NextRequest) {
  const country = request.nextUrl.searchParams.get("country") ?? "FR";

  // Servir depuis le cache si valide
  if (cache && Date.now() - cache.ts < CACHE_TTL) {
    return NextResponse.json(cache.data);
  }

  try {
    const methods = await getShippingMethods(country);

    // Normaliser les prix : chaque méthode renvoie un prix en centimes ou euros selon la config
    const normalized = methods.map((m) => {
      // Chercher le prix et délai spécifiques au pays destinataire
      const countryData = m.countries?.find((c) => c.iso_2 === country);
      const price = countryData?.price ?? m.price ?? 0;
      const leadTimeHours =
        countryData?.lead_time_hours ?? m.lead_time_hours ?? null;
      const leadTimeDays =
        countryData?.lead_time_days ?? m.lead_time_days ?? null;

      // Calcul du délai affiché : on préfère lead_time_days, sinon on convertit depuis hours
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
