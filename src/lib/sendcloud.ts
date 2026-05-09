const SENDCLOUD_API_URL = "https://panel.sendcloud.sc/api/v2";
const SENDCLOUD_API_V3_URL = "https://panel.sendcloud.sc/api/v3";
const DEFAULT_WEIGHT_KG = 0.5;

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
}

// --- Fonctions ---

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
export async function getShippingProducts(): Promise<SendCloudProduct[]> {
  try {
    const data = await sendcloudFetch<{ shipping_products: SendCloudProduct[] }>(
      "/shipping-products",
      {},
      SENDCLOUD_API_V3_URL
    );
    return data.shipping_products ?? [];
  } catch {
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

    return [{
      id: product.id, // UUID
      methodId: method.id,
      name: product.name,
      carrier: product.carrier ?? method.carrier,
      price: typeof price === "number" ? price : parseFloat(String(price)),
      min_weight: method.min_weight,
      max_weight: method.max_weight,
      deliveryDays: normalizeDeliveryDays(
        countryData?.lead_time_days ?? method.lead_time_days,
        countryData?.lead_time_hours ?? method.lead_time_hours
      ),
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
