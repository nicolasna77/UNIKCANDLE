"use client";

import { JSX } from "react";
import OrderItemCard from "../order-item-card";
import type {
  Order,
  OrderItem,
  Product,
  Scent,
  Image as PrismaImage,
  Address,
  QRCode,
} from "@prisma/client";

type OrderWithDetails = Order & {
  items: (OrderItem & {
    product: Product & {
      images: PrismaImage[];
    };
    scent: Scent;
    qrCode: QRCode | null;
  })[];
  shippingAddress: Address;
};

interface OrdersListProps {
  orders: OrderWithDetails[];
  getStatusDetails: (status: string) => {
    label: string;
    color: string;
    bgColor: string;
    icon: JSX.Element;
    badge: JSX.Element;
  };
}

export function OrdersList({ orders, getStatusDetails }: OrdersListProps) {
  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <OrderItemCard
          key={order.id}
          order={order}
          getStatusDetails={getStatusDetails}
        />
      ))}
    </div>
  );
}
