const SENDCLOUD_API_URL = "https://panel.sendcloud.sc/api/v2";
const DEFAULT_WEIGHT_KG = 0.5; // poids par défaut par bougie

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
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${SENDCLOUD_API_URL}${path}`, {
    ...options,
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `SendCloud API error ${response.status}: ${errorText}`
    );
  }

  return response.json() as Promise<T>;
}

export interface SendCloudMethod {
  id: number;
  name: string;
  min_weight: number;
  max_weight: number;
  price: number;
  countries: { iso_2: string; price: number | null }[];
  carrier: string;
  service_point_input?: string;
}

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

export function calculateTotalWeight(quantity: number): string {
  return (quantity * DEFAULT_WEIGHT_KG).toFixed(3);
}

export async function getShippingMethods(
  toCountry = "FR"
): Promise<SendCloudMethod[]> {
  const data = await sendcloudFetch<{ shipping_methods: SendCloudMethod[] }>(
    `/shipping_methods?from_country=FR&to_country=${toCountry}&is_return=false`
  );
  return data.shipping_methods ?? [];
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
  const data = await sendcloudFetch<{ parcel: SendCloudParcel }>(
    `/parcels/${id}`
  );
  return data.parcel;
}

export function getLabelUrl(parcel: SendCloudParcel): string | null {
  return parcel.label?.label_printer ?? parcel.label?.normal_printer?.[0] ?? null;
}
