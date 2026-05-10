import { NextRequest, NextResponse } from "next/server";
import {
  getShippingMethods,
  getShippingProducts,
  normalizeV2Methods,
  normalizeV3Products,
  type NormalizedShippingMethod,
} from "@/lib/sendcloud";
import { logger } from "@/lib/logger";

// Cache en mémoire : 10 minutes (méthodes filtrées par transporteur, toutes tranches de poids)
let cache: { data: NormalizedShippingMethod[]; ts: number } | null = null;
const CACHE_TTL = 10 * 60 * 1000;

// SENDCLOUD_CARRIERS="Colissimo,Mondial Relay" — filtre par nom de transporteur
function getAllowedCarriers(): string[] | null {
  const raw = process.env.SENDCLOUD_CARRIERS;
  if (!raw?.trim()) return null;
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

async function buildCache(country: string): Promise<NormalizedShippingMethod[]> {
  const [v3Products, v2Methods] = await Promise.all([
    getShippingProducts(),
    getShippingMethods(country),
  ]);

  const normalized: NormalizedShippingMethod[] = [
    ...normalizeV3Products(v3Products, country),
    ...normalizeV2Methods(v2Methods, country),
  ];

  const v3MethodIds = new Set(
    normalizeV3Products(v3Products, country).map((m) => m.methodId)
  );
  const deduped = normalized.filter(
    (m) => m.id.includes("-") || !v3MethodIds.has(m.methodId)
  );

  const allowedCarriers = getAllowedCarriers();
  const byCarrier = allowedCarriers
    ? deduped.filter((m) =>
        allowedCarriers.some(
          (c) =>
            m.carrier.toLowerCase().startsWith(c.toLowerCase()) ||
            m.name.toLowerCase().startsWith(c.toLowerCase())
        )
      )
    : deduped;

  logger.info(
    `SendCloud: ${byCarrier.length} méthode(s) chargées (toutes tranches)`,
    { v3: v3Products.length, v2: v2Methods.length, carriers: allowedCarriers }
  );

  return byCarrier;
}

export async function GET(request: NextRequest) {
  const country = request.nextUrl.searchParams.get("country") ?? "FR";
  const weightParam = request.nextUrl.searchParams.get("weight");
  const weight = weightParam ? parseFloat(weightParam) : null;
  const bust = request.nextUrl.searchParams.get("bust") === "1";

  if (bust) cache = null;

  if (!cache || Date.now() - cache.ts >= CACHE_TTL) {
    try {
      const data = await buildCache(country);
      cache = { data, ts: Date.now() };
    } catch (error) {
      logger.error("Erreur lors de la récupération des méthodes SendCloud", error);
      return NextResponse.json(
        { error: "Impossible de récupérer les méthodes de livraison" },
        { status: 500 }
      );
    }
  }

  // Filtre par poids (non mis en cache — varie selon le panier)
  let result = cache.data;
  if (weight !== null && !isNaN(weight) && weight > 0) {
    const byWeight = result.filter(
      (m) => m.min_weight <= weight && weight <= m.max_weight
    );
    result = byWeight.length > 0 ? byWeight : (() => {
      // Fallback : tranche la plus proche par transporteur
      const carriers = [...new Set(result.map((m) => m.carrier))];
      return carriers.flatMap((carrier) => {
        const methods = result.filter((m) => m.carrier === carrier);
        const above = methods
          .filter((m) => m.min_weight <= weight)
          .sort((a, b) => b.min_weight - a.min_weight);
        return above.length > 0 ? [above[0]] : methods.slice(0, 1);
      });
    })();
  }

  // Une seule option par transporteur (la moins chère) pour éviter la surcharge de choix
  const byCarrier = new Map<string, typeof result[0]>();
  for (const m of result) {
    const existing = byCarrier.get(m.carrier);
    if (!existing || m.price < existing.price) {
      byCarrier.set(m.carrier, m);
    }
  }
  result = [...byCarrier.values()];

  logger.info(`SendCloud: ${result.length} méthode(s) affichée(s) pour ${weight ?? "?"}kg`);

  return NextResponse.json(result);
}
