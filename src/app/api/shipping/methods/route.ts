import { NextResponse } from "next/server";

const SHIPPING_METHODS = [
  {
    id: 1,
    name: "Mondial Relay",
    carrier: "Mondial Relay",
    price: 4.99,
    deliveryDays: { min: 3, max: 5 },
  },
  {
    id: 2,
    name: "Chronopost",
    carrier: "Chronopost",
    price: 9.99,
    deliveryDays: { min: 1, max: 2 },
  },
];

export async function GET() {
  return NextResponse.json(SHIPPING_METHODS);
}
