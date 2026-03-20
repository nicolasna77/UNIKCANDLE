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
      // Chercher le prix spécifique au pays destinataire
      const countryPrice = m.countries?.find((c) => c.iso_2 === country);
      const price = countryPrice?.price ?? m.price ?? 0;

      return {
        id: m.id,
        name: m.name,
        carrier: m.carrier,
        price: typeof price === "number" ? price : parseFloat(String(price)),
        min_weight: m.min_weight,
        max_weight: m.max_weight,
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
