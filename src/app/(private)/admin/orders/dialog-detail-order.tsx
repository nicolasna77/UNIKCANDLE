"use client";
import Image from "next/image";
import { useQRCode } from "next-qrcode";
import { ShoppingCart, Package, MapPin, User, Printer } from "lucide-react";

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

  const handlePrint = () => {
    // Créer une nouvelle fenêtre pour l'impression
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    // Générer les QR codes pour l'impression
    const generateQRCode = (text: string): string => {
      return `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(text)}`;
    };

    // Styles pour l'impression
    const printStyles = `
      <style>
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          body {
            font-family: system-ui, -apple-system, sans-serif;
            line-height: 1.5;
            color: #000;
            background: #fff;
            margin: 0;
            padding: 20px;
          }
          .print-header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #000;
          }
          .print-title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .print-badges {
            display: flex;
            justify-content: center;
            gap: 10px;
            flex-wrap: wrap;
          }
          .print-badge {
            background: #f3f4f6;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            border: 1px solid #d1d5db;
          }
          .print-section {
            margin-bottom: 30px;
            break-inside: avoid;
          }
          .print-section-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .print-item {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 15px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            margin-bottom: 10px;
            break-inside: avoid;
          }
          .print-item-image {
            width: 60px;
            height: 60px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            object-fit: cover;
          }
          .print-item-details {
            flex: 1;
          }
          .print-item-name {
            font-weight: 600;
            margin-bottom: 5px;
          }
          .print-item-scent {
            font-size: 14px;
            color: #6b7280;
          }
          .print-item-qr {
            width: 80px;
            height: 80px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .print-item-qr img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
          }
          .print-item-price {
            text-align: right;
            font-weight: 600;
          }
          .print-total {
            border-top: 2px solid #000;
            padding-top: 15px;
            margin-top: 15px;
            display: flex;
            justify-content: space-between;
            font-size: 18px;
            font-weight: bold;
          }
          .print-address {
            background: #f9fafb;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
          }
          .print-no-address {
            background: #fef3c7;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #f59e0b;
            font-style: italic;
            color: #92400e;
          }
        }
      </style>
    `;

    // Contenu HTML pour l'impression
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Commande #${order.id.slice(0, 8)}</title>
          ${printStyles}
        </head>
        <body>
          <div class="print-header">
            <div class="print-title">📦 Commande #${order.id.slice(0, 8)}</div>
            <div class="print-badges">
              <span class="print-badge">👤 ${order.user.email || "Client"}</span>
              <span class="print-badge">${totalItems} article${totalItems > 1 ? "s" : ""}</span>
              <span class="print-badge">${totalAmount.toFixed(2)}€</span>
            </div>
          </div>
          
          <div class="print-section">
            <div class="print-section-title">🛒 Articles commandés</div>
            ${order.items
              .map(
                (item) => `
              <div class="print-item">
                <div class="print-item-image-container">
                  ${
                    item.product.images?.[0]
                      ? `<img src="${item.product.images[0].url}" alt="${item.product.name}" class="print-item-image">`
                      : '<div class="print-item-image" style="background: #f3f4f6; display: flex; align-items: center; justify-content: center; color: #6b7280;">📦</div>'
                  }
                </div>
                <div class="print-item-details">
                  <div class="print-item-name">${item.product.name}</div>
                  <div class="print-item-scent">Senteur: ${item.scent.name}</div>
                </div>
                <div class="print-item-qr">
                  ${
                    item.qrCode
                      ? `<div style="background: #fff; padding: 5px; border-radius: 4px; text-align: center;">
                      <img src="${generateQRCode(`https://${process.env.NEXT_PUBLIC_APP_URL || "localhost:3000"}/ar/${item.qrCode.code}`)}" 
                           alt="QR Code" 
                           style="width: 70px; height: 70px; border: 1px solid #d1d5db; border-radius: 4px;" />
                    </div>`
                      : '<div style="background: #f3f4f6; height: 100%; display: flex; align-items: center; justify-content: center; color: #6b7280; font-size: 10px;">Pas de QR</div>'
                  }
                </div>
                <div class="print-item-price">
                  <div style="font-size: 14px; color: #6b7280; margin-bottom: 2px;">
                    ${item.quantity} × ${item.price.toFixed(2)}€
                  </div>
                  <div>${(item.quantity * item.price).toFixed(2)}€</div>
                </div>
              </div>
            `
              )
              .join("")}
            
            <div class="print-total">
              <span>Total de la commande</span>
              <span>${totalAmount.toFixed(2)}€</span>
            </div>
          </div>
          
          <div class="print-section">
            <div class="print-section-title">📍 Adresse de livraison</div>
            ${
              order.shippingAddress
                ? `
              <div class="print-address">
              <div class=" font-bold"> ${order.shippingAddress.name}</div>
                <div style="font-weight: 600; margin-bottom: 5px;">${order.shippingAddress.street}</div>
                <div>${order.shippingAddress.zipCode} ${order.shippingAddress.city}</div>
                <div style="color: #6b7280; margin-top: 5px;">${order.shippingAddress.state}, ${order.shippingAddress.country}</div>
              </div>
            `
                : `
              <div class="print-no-address">
                Aucune adresse de livraison fournie
              </div>
            `
            }
          </div>
        </body>
      </html>
    `;

    // Écrire le contenu dans la nouvelle fenêtre
    printWindow.document.write(printContent);
    printWindow.document.close();

    // Attendre que le contenu soit chargé puis imprimer
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

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
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Package className="h-5 w-5" />
              Commande #{order.id.slice(0, 8)}
            </DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-2"
            >
              <Printer className="h-4 w-4" />
              Imprimer
            </Button>
          </div>
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

        <div className="space-y-6" data-print-content>
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
                    className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    {/* Image du produit */}
                    <div className="md:col-span-2 flex justify-center md:justify-start">
                      {item.product.images?.[0] ? (
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-border">
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
                        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center border border-border">
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
                        <div className="flex flex-col items-center space-y-2">
                          <div className="p-3 bg-white rounded-lg border border-border shadow-sm">
                            <Canvas
                              text={`https://${process.env.NEXT_PUBLIC_APP_URL || "localhost:3000"}/ar/${item.qrCode.code}`}
                              options={{
                                type: "image/jpeg",
                                quality: 0.9,
                                errorCorrectionLevel: "M",
                                margin: 2,
                                scale: 4,
                                width: 100,
                                color: {
                                  light: "#ffffff",
                                  dark: "#000000",
                                },
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center">
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
