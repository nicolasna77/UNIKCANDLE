"use client";

import { JSX } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  FileText,
  RefreshCw,
  XCircle,
  Calendar,
  MapPin,
  Package,
} from "lucide-react";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import type {
  Order,
  OrderItem,
  Product,
  Scent,
  Image as PrismaImage,
  Address,
  QRCode,
} from "@prisma/client";
import ReturnRequestDialog from "./return-request-dialog";

const OrderItemCard = ({
  order,
  getStatusDetails,
}: {
  order: Order & {
    items: (OrderItem & {
      product: Product & {
        images: PrismaImage[];
      };
      scent: Scent;
      qrCode: QRCode | null;
    })[];
    shippingAddress: Address;
  };
  getStatusDetails: (status: string) => {
    label: string;
    color: string;
    bgColor: string;
    icon: JSX.Element;
    badge: JSX.Element;
  };
}) => {
  const statusDetails = getStatusDetails(order.status);
  const formattedDate = new Date(order.createdAt).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-lg border-border">
      <CardHeader className="bg-gradient-to-br from-muted/40 to-muted/20 p-4 md:p-6 border-b">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-lg font-semibold text-foreground">
                Commande #{order.id}
              </h3>
              {statusDetails.badge}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{formattedDate}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <FileText className="h-4 w-4" />
              Facture
            </Button>
            <Button size="sm" variant="default" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Recommander
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="p-4 md:p-6 space-y-6">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <h4 className="font-semibold text-base">
              Produits ({order.items.length})
            </h4>
          </div>

          <div className="space-y-4">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border bg-muted">
                  <Image
                    src={
                      item.product?.images?.[0]?.url ||
                      "/placeholder-product.jpg"
                    }
                    alt={item.product?.name || "Produit"}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div>
                    <h5 className="font-semibold text-base truncate">
                      {item.product?.name}
                    </h5>
                    <div className="flex items-center gap-2 mt-1">
                      <div
                        className="h-3 w-3 rounded-full ring-2 ring-background"
                        style={{
                          backgroundColor: item.scent?.color || "#CBD5E1",
                        }}
                      />
                      <span className="text-sm text-muted-foreground">
                        {item.scent?.name}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <span className="font-medium">
                      {item.quantity} × {item.price.toFixed(2)}€
                    </span>
                    <span className="text-muted-foreground">
                      Total: {(item.quantity * item.price).toFixed(2)}€
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {item.qrCode && (
                      <Link
                        href={`/ar/${item.qrCode.code}`}
                        className={buttonVariants({
                          variant: "outline",
                          size: "sm",
                        })}
                        prefetch
                      >
                        Voir en AR
                      </Link>
                    )}
                    <ReturnRequestDialog
                      orderItem={{
                        id: item.id,
                        product: { name: item.product.name },
                        scent: { name: item.scent.name },
                      }}
                      order={{
                        id: order.id,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}

            <Separator className="my-4" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <h4 className="font-semibold text-sm">
                    Adresse de livraison
                  </h4>
                </div>
                <div className="rounded-lg bg-muted/50 border p-4 space-y-1">
                  <p className="font-medium text-sm">
                    {order.shippingAddress.street}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {order.shippingAddress.zipCode} {order.shippingAddress.city}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {order.shippingAddress.country}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {statusDetails.icon}
                  <h4 className="font-semibold text-sm">
                    Statut de la commande
                  </h4>
                </div>
                <div className="rounded-lg bg-muted/50 border p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-medium text-sm ${statusDetails.color}`}
                    >
                      {statusDetails.label}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {order.status === "DELIVERED"
                      ? "Votre commande a été livrée avec succès."
                      : order.status === "CANCELLED"
                        ? "Cette commande a été annulée."
                        : order.status === "SHIPPED"
                          ? "Votre commande est en cours de livraison."
                          : "Votre commande est en cours de préparation."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <Separator />

      <CardFooter className="flex flex-col sm:flex-row items-center justify-between p-4 md:p-6 gap-4 bg-muted/20">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {order.status === "PROCESSING" && (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:bg-destructive/10 gap-2"
            >
              <XCircle className="h-4 w-4" />
              Annuler
            </Button>
          )}
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <span className="text-sm font-medium text-muted-foreground">
            Montant total
          </span>
          <span className="text-2xl font-bold text-foreground">
            {order.total.toFixed(2)}€
          </span>
        </div>
      </CardFooter>
    </Card>
  );
};
export default OrderItemCard;
