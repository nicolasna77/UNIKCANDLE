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
import {
  Order,
  OrderItem,
  Product,
  Scent,
  Image as PrismaImage,
  Address,
  QRCode,
} from "@/generated/client";
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

  console.log(order);

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
      <CardHeader className="bg-gray-50/80 p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Commande #{order.id}</h3>
              {statusDetails.badge}
            </div>
            <p className="text-sm text-muted-foreground">
              Commandé le {formattedDate}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <FileText className="mr-2 h-4 w-4" />
              Facture
            </Button>
            <Button size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Commander à nouveau
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="p-4 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="h-5 w-5 text-muted-foreground" />
            <h4 className="font-medium">Produits ({order.items.length})</h4>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <div className="relative h-16 w-16 overflow-hidden rounded-md border bg-gray-50">
                  <Image
                    src={item.product?.images?.[0]?.url || ""}
                    alt={item.product?.name || "Produit"}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h5 className="font-medium">{item.product?.name}</h5>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{
                        backgroundColor: item.scent?.color || "#CBD5E1",
                      }}
                    />
                    <span>{item.scent?.name}</span>
                  </div>
                  <p className="text-sm mt-1">
                    {item.quantity} × {item.price.toFixed(2)}€
                  </p>
                  {item.qrCode && (
                    <div className="mt-2 flex items-center gap-2">
                      <Link
                        href={`/ar/${item.qrCode.code}`}
                        className={buttonVariants({ variant: "link" })}
                        prefetch
                      >
                        Voir en réalité augmentée
                      </Link>
                    </div>
                  )}
                  {item.animationId && (
                    <div className="mt-1 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Lieu: {item.animationId}
                      </span>
                    </div>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2">
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
                    {/* TODO: Système de retour simplifié */}
                    {/* <Button variant="outline" size="sm">
                       Suivre le retour
                     </Button> */}
                  </div>
                </div>
              </div>
            ))}

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <h4 className="font-medium">Adresse de livraison</h4>
                </div>
                <div className="rounded-lg bg-gray-50/80 p-4 text-sm">
                  <p className="font-medium">{order.shippingAddress.street}</p>
                  <p className="text-muted-foreground">
                    {order.shippingAddress.zipCode} {order.shippingAddress.city}
                  </p>
                  <p className="text-muted-foreground">
                    {order.shippingAddress.country}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  Suivi de commande
                </h4>
                <div className="rounded-lg bg-gray-50/80 p-4 text-sm">
                  <div className="flex items-center gap-2">
                    {statusDetails.icon}
                    <span className={statusDetails.color}>
                      {statusDetails.label}
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-1">
                    {order.status === "DELIVERED"
                      ? "Votre commande a été livrée avec succès."
                      : order.status === "CANCELLED"
                        ? "Cette commande a été annulée."
                        : "Votre commande est en cours de préparation."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <Separator />

      <CardFooter className="flex flex-col sm:flex-row items-center justify-between p-4 md:p-6 gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {order.status === "PROCESSING" && (
            <Button variant="outline" size="sm" className="text-destructive">
              <XCircle className="mr-2 h-4 w-4" />
              Annuler la commande
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-muted-foreground">Total:</span>
          <span className="text-xl font-semibold">
            {order.total.toFixed(2)}€
          </span>
        </div>
      </CardFooter>
    </Card>
  );
};
export default OrderItemCard;
