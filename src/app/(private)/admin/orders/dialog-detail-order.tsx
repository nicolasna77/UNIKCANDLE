"use client";
import Image from "next/image";
import { useQRCode } from "next-qrcode";
import { ShoppingCart, Package, MapPin, User } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import type {
  Address,
  Image as ImageType,
  Order,
  Product,
  QRCode,
  Scent,
  User as UserType,
} from "@/generated/client";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: Product & {
    images: ImageType[];
  };
  scent: Scent;
  qrCode: QRCode;
}

interface ExtendedOrder extends Order {
  user: UserType;
  items: OrderItem[];
  shippingAddress: Address;
}

const DialogDetailOrder = ({ order }: { order: ExtendedOrder }) => {
  const { Canvas } = useQRCode();

  const totalItems = order.items.reduce((acc, item) => acc + item.quantity, 0);
  const totalAmount = order.items.reduce(
    (acc, item) => acc + item.quantity * item.price,
    0
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <ShoppingCart className="h-4 w-4" />
          <span className="hidden sm:inline">
            {totalItems} article{totalItems > 1 ? "s" : ""}
          </span>
          <span className="sm:hidden">{totalItems}</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Package className="h-5 w-5" />
            Commande #{order.id.slice(0, 8)}
          </DialogTitle>
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <Badge variant="secondary" className="gap-1">
              <User className="h-3 w-3" />
              {order.user.email || "Client"}
            </Badge>
            <Badge variant="outline">
              {totalItems} article{totalItems > 1 ? "s" : ""}
            </Badge>
            <Badge variant="outline" className="font-semibold">
              {totalAmount.toFixed(2)}€
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Articles commandés */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Articles commandés
              </h3>

              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    {/* Image du produit */}
                    <div className="md:col-span-2 flex justify-center md:justify-start">
                      {item.product.images?.[0] ? (
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden border">
                          <Image
                            src={
                              item.product.images[0].url || "/placeholder.svg"
                            }
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center border">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Détails du produit */}
                    <div className="md:col-span-4 space-y-1">
                      <h4 className="font-medium text-base leading-tight">
                        {item.product.name}
                      </h4>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        Senteur: {item.scent.name}
                      </p>
                    </div>

                    {/* QR Code */}
                    <div className="md:col-span-3 flex justify-center">
                      {item.qrCode ? (
                        <div className="p-2 bg-white rounded-lg border shadow-sm">
                          <Canvas
                            text={`https://${process.env.NEXT_PUBLIC_APP_URL}/ar/${item.qrCode.code}`}
                            options={{
                              type: "image/jpeg",
                              quality: 0.3,
                              errorCorrectionLevel: "M",
                              margin: 1,
                              scale: 3,
                              width: 80,
                              color: {
                                light: "#ffffff",
                                dark: "#000000",
                              },
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                          <span className="text-xs text-muted-foreground text-center">
                            Pas de QR
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Prix et quantité */}
                    <div className="md:col-span-3 text-right space-y-1">
                      <div className="flex items-center justify-between md:justify-end md:flex-col md:items-end gap-2">
                        <span className="text-sm text-muted-foreground">
                          {item.quantity} × {item.price.toFixed(2)}€
                        </span>
                        <span className="font-semibold text-lg">
                          {(item.quantity * item.price).toFixed(2)}€
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Total */}
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total de la commande</span>
                <span className="text-primary">{totalAmount.toFixed(2)}€</span>
              </div>
            </CardContent>
          </Card>

          {/* Adresse de livraison */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Adresse de livraison
              </h3>

              {order.shippingAddress ? (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">
                      {order.shippingAddress.street}
                    </p>
                    <p>
                      {order.shippingAddress.zipCode}{" "}
                      {order.shippingAddress.city}
                    </p>
                    <p className="text-muted-foreground">
                      {order.shippingAddress.state},{" "}
                      {order.shippingAddress.country}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground italic">
                    Aucune adresse de livraison fournie
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogDetailOrder;
