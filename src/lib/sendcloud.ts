const SENDCLOUD_API_URL = "https://panel.sendcloud.sc/api/v2";
const SENDCLOUD_API_V3_URL = "https://panel.sendcloud.sc/api/v3";
const SENDCLOUD_SERVICEPOINTS_URL = "https://servicepoints.sendcloud.sc/api/v2/service-points";
const DEFAULT_WEIGHT_KG = 0.75;

function getAuthHeader(): string {
  const publicKey = process.env.SENDCLOUD_PUBLIC_KEY;
  const secretKey = process.env.SENDCLOUD_SECRET_KEY;

  if (!publicKey || !secretKey) {
    throw new Error("SENDCLOUD_PUBLIC_KEY ou SENDCLOUD_SECRET_KEY manquant");
  }

  return `Basic ${Buffer.from(`${publicKey}:${secretKey}`).toString("base64")}`;
}

async function sendcloudFetch<T>(
  path: string,
  options: RequestInit = {},
  baseUrl = SENDCLOUD_API_URL
): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`SendCloud API error ${response.status}: ${errorText}`);
  }

  return response.json() as Promise<T>;
}

// --- Types v2 ---

export interface SendCloudMethod {
  id: number;
  name: string;
  min_weight: number;
  max_weight: number;
  price: number;
  countries: {
    iso_2: string;
    price: number | null;
    lead_time_hours: number | null;
    lead_time_days: number | null;
  }[];
  carrier: string;
  service_point_input?: string;
  lead_time_hours?: number | null;
  lead_time_days?: number | null;
}

// --- Types v3 ---

export interface SendCloudProductMethod {
  id: number;
  name: string;
  carrier: string;
  min_weight: number;
  max_weight: number;
  price: number | null;
  lead_time_hours: number | null;
  lead_time_days: number | null;
  countries: {
    iso_2: string;
    price: number | null;
    lead_time_hours: number | null;
    lead_time_days: number | null;
  }[];
}

export interface SendCloudProduct {
  id: string; // UUID
  name: string;
  carrier: string;
  methods: SendCloudProductMethod[];
}

// Format normalisé commun pour le panier
export interface NormalizedShippingMethod {
  id: string;          // UUID (v3) ou string de l'int (v2)
  methodId: number;    // ID entier pour créer le colis
  name: string;
  carrier: string;
  price: number;
  min_weight: number;
  max_weight: number;
  deliveryDays: { min: number; max: number } | null;
  requiresServicePoint: boolean;
  servicePointCarrier?: string; // code carrier pour l'API service points (ex: "mondial_relay")
}

// Point relais SendCloud
export interface ServicePoint {
  id: number;
  name: string;
  street: string;
  house_number: string;
  city: string;
  postal_code: string;
  country: string;
  carrier: string;
  latitude: string;
  longitude: string;
  distance?: number;
  phone?: string;
  formatted_opening_times?: Record<string, string[]>;
}

// --- Types parcel ---

export interface SendCloudParcel {
  id: number;
  tracking_number: string;
  tracking_url: string;
  label: {
    normal_printer: string[];
    label_printer: string;
  } | null;
  status: {
    id: number;
    message: string;
  };
}

export interface CreateParcelPayload {
  name: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  email: string;
  weight: string;
  shipment: { id: number };
  order_number: string;
  request_label: boolean;
  to_service_point?: number;
}

// --- Fonctions ---

// Correspondance nom transporteur → code API service points
const CARRIER_CODE_MAP: Record<string, string> = {
  "mondial relay": "mondial_relay",
  "mondialrelay": "mondial_relay",
  "mondial-relay": "mondial_relay",
  "relais colis": "relais_colis",
  "relais-colis": "relais_colis",
  "chronopost": "chronopost",
  "dpd": "dpd",
  "dhl": "dhl",
  "postnl": "postnl",
  "ups": "ups",
  "gls": "gls",
  "bpost": "bpost",
};

export function getServicePointCarrierCode(carrier: string): string {
  const key = carrier.toLowerCase().replace(/[-_]+/g, " ").trim();
  return CARRIER_CODE_MAP[key] ?? carrier.toLowerCase().replace(/\s+/g, "_");
}

function isServicePointCarrier(carrier: string): boolean {
  const name = carrier.toLowerCase();
  return (
    name.includes("relay") ||
    name.includes("relai") ||
    name.includes("pickup") ||
    name.includes("service point") ||
    name.includes("parcel shop")
  );
}

// Récupère les points relais depuis l'API SendCloud
export async function getServicePoints(params: {
  country: string;
  postal_code: string;
  carrier?: string;
  radius?: number;
}): Promise<ServicePoint[]> {
  const publicKey = process.env.SENDCLOUD_PUBLIC_KEY;
  if (!publicKey) {
    console.error("[SendCloud] SENDCLOUD_PUBLIC_KEY manquant");
    return [];
  }

  try {
    const url = new URL(SENDCLOUD_SERVICEPOINTS_URL);
    url.searchParams.set("country", params.country);
    url.searchParams.set("postal_code", params.postal_code);
    url.searchParams.set("radius", String(params.radius ?? 10000));
    // L'API servicepoints utilise access_token (clé publique), pas Basic Auth
    url.searchParams.set("access_token", publicKey);
    if (params.carrier) url.searchParams.set("carrier", params.carrier);

    const response = await fetch(url.toString());

    if (!response.ok) {
      const text = await response.text();
      console.error(`[SendCloud] Service points ${response.status}: ${text}`);
      return [];
    }

    const data = await response.json();
    // L'API peut retourner un tableau direct ou { service_points: [...] }
    const list: ServicePoint[] = Array.isArray(data)
      ? data
      : (data.service_points ?? data.results ?? []);

    // Si aucun résultat avec le filtre carrier, on relance sans filtre
    if (list.length === 0 && params.carrier) {
      const urlNoCarrier = new URL(SENDCLOUD_SERVICEPOINTS_URL);
      urlNoCarrier.searchParams.set("country", params.country);
      urlNoCarrier.searchParams.set("postal_code", params.postal_code);
      urlNoCarrier.searchParams.set("radius", String(params.radius ?? 10000));
      urlNoCarrier.searchParams.set("access_token", publicKey);

      const r2 = await fetch(urlNoCarrier.toString());
      if (r2.ok) {
        const d2 = await r2.json();
        return Array.isArray(d2) ? d2 : (d2.service_points ?? d2.results ?? []);
      }
    }

    return list;
  } catch (err) {
    console.error("[SendCloud] getServicePoints failed:", err);
    return [];
  }
}

export function calculateTotalWeight(quantity: number): string {
  return (quantity * DEFAULT_WEIGHT_KG).toFixed(3);
}

function normalizeDeliveryDays(
  leadTimeDays: number | null | undefined,
  leadTimeHours: number | null | undefined
): { min: number; max: number } | null {
  if (leadTimeDays != null && leadTimeDays > 0) {
    return { min: leadTimeDays, max: leadTimeDays };
  }
  if (leadTimeHours != null && leadTimeHours > 0) {
    const days = Math.ceil(leadTimeHours / 24);
    return { min: days, max: days + 1 };
  }
  return null;
}

// Fetch v2 shipping methods
export async function getShippingMethods(
  toCountry = "FR"
): Promise<SendCloudMethod[]> {
  const data = await sendcloudFetch<{ shipping_methods: SendCloudMethod[] }>(
    `/shipping_methods?from_country=FR&to_country=${toCountry}&is_return=false`
  );
  return data.shipping_methods ?? [];
}

// Fetch v3 shipping products
export async function getShippingProducts(toCountry = "FR"): Promise<SendCloudProduct[]> {
  try {
    const publicKey = process.env.SENDCLOUD_PUBLIC_KEY;
    const secretKey = process.env.SENDCLOUD_SECRET_KEY;
    const auth = `Basic ${Buffer.from(`${publicKey}:${secretKey}`).toString("base64")}`;

    const url = `${SENDCLOUD_API_V3_URL}/shipping-products?from_country=FR&to_country=${toCountry}`;
    const response = await fetch(url, {
      headers: { Authorization: auth, "Content-Type": "application/json" },
    });

    const raw = await response.json();

    if (!response.ok) {
      return [];
    }

    // La réponse v3 peut être sous shipping_products ou data ou un tableau direct
    const products: SendCloudProduct[] =
      raw.shipping_products ?? raw.data ?? raw.results ?? (Array.isArray(raw) ? raw : []);

    return products;
  } catch (err) {
    console.error("[SendCloud v3] getShippingProducts failed:", err);
    return [];
  }
}

// Normalize v2 methods to common format
export function normalizeV2Methods(
  methods: SendCloudMethod[],
  country: string
): NormalizedShippingMethod[] {
  return methods.map((m) => {
    const countryData = m.countries?.find((c) => c.iso_2 === country);
    const price = countryData?.price ?? m.price ?? 0;
    const needsServicePoint =
      m.service_point_input === "required" || m.service_point_input === "optional";
    return {
      id: String(m.id),
      methodId: m.id,
      name: m.name,
      carrier: m.carrier,
      price: typeof price === "number" ? price : parseFloat(String(price)),
      min_weight: m.min_weight,
      max_weight: m.max_weight,
      deliveryDays: normalizeDeliveryDays(
        countryData?.lead_time_days ?? m.lead_time_days,
        countryData?.lead_time_hours ?? m.lead_time_hours
      ),
      requiresServicePoint: needsServicePoint,
      servicePointCarrier: needsServicePoint
        ? getServicePointCarrierCode(m.carrier)
        : undefined,
    };
  });
}

// Normalize v3 products to common format (uses first method of each product)
export function normalizeV3Products(
  products: SendCloudProduct[],
  country: string
): NormalizedShippingMethod[] {
  return products.flatMap((product) => {
    const method = product.methods?.[0];
    if (!method) return [];

    const countryData = method.countries?.find((c) => c.iso_2 === country);
    const price = countryData?.price ?? method.price ?? 0;
    const carrier = product.carrier ?? method.carrier;
    const needsServicePoint = isServicePointCarrier(carrier);

    return [{
      id: product.id, // UUID
      methodId: method.id,
      name: product.name,
      carrier,
      price: typeof price === "number" ? price : parseFloat(String(price)),
      min_weight: method.min_weight,
      max_weight: method.max_weight,
      deliveryDays: normalizeDeliveryDays(
        countryData?.lead_time_days ?? method.lead_time_days,
        countryData?.lead_time_hours ?? method.lead_time_hours
      ),
      requiresServicePoint: needsServicePoint,
      servicePointCarrier: needsServicePoint
        ? getServicePointCarrierCode(carrier)
        : undefined,
    }];
  });
}

export async function createParcel(
  payload: CreateParcelPayload
): Promise<SendCloudParcel> {
  const data = await sendcloudFetch<{ parcel: SendCloudParcel }>("/parcels", {
    method: "POST",
    body: JSON.stringify({ parcel: payload }),
  });
  return data.parcel;
}

export async function getParcel(id: number): Promise<SendCloudParcel> {
  const data = await sendcloudFetch<{ parcel: SendCloudParcel }>(`/parcels/${id}`);
  return data.parcel;
}

export function getLabelUrl(parcel: SendCloudParcel): string | null {
  return parcel.label?.label_printer ?? parcel.label?.normal_printer?.[0] ?? null;
}
