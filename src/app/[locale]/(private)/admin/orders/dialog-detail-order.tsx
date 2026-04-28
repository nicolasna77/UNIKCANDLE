"use client";
import Image from "next/image";
import { useState } from "react";
import { useLocale } from "next-intl";
import {
  ShoppingCart,
  Package,
  MapPin,
  User,
  Printer,
  Download,
  Truck,
  ExternalLink,
  Loader2,
  Medal,
  Calendar,
  Mail,
} from "lucide-react";
import { QRCode } from "@/components/ui/shadcn-io/qr-code";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Order } from "@prisma/client";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  engravingText?: string | null;
  product: {
    id: string;
    name: string;
    images: { url: string }[];
  };
  scent: {
    id: string;
    name: string;
  };
  qrCode: {
    id: string;
    code: string;
  } | null;
}

interface ExtendedOrder {
  id: string;
  total: number;
  status: Order["status"];
  createdAt: string;
  shippingCost?: number | null;
  shippingMethodId?: number | null;
  sendcloudParcelId?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  user: {
    id: string;
    name: string;
    email: string;
  };
  items: OrderItem[];
  shippingAddress: {
    id: string;
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  } | null;
}

const STATUS_LABELS: Record<string, string> = {
  DELIVERED: "Livrée",
  SHIPPED: "En livraison",
  PROCESSING: "En préparation",
  PENDING: "En attente",
  CANCELLED: "Annulée",
};

const STATUS_CLASSES: Record<string, string> = {
  DELIVERED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  SHIPPED: "bg-violet-50 text-violet-700 border-violet-200",
  PROCESSING: "bg-blue-50 text-blue-700 border-blue-200",
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
};

const DialogDetailOrder = ({ order: initialOrder }: { order: ExtendedOrder }) => {
  const [order, setOrder] = useState<ExtendedOrder>(initialOrder);
  const locale = useLocale();
  const [sendcloudLoading, setSendcloudLoading] = useState(false);
  const [sendcloudError, setSendcloudError] = useState<string | null>(null);
  const totalItems = order.items.reduce((acc, item) => acc + item.quantity, 0);
  const totalAmount = order.total;

  const getArUrl = (code: string) => {
    const url = process.env.NEXT_PUBLIC_APP_URL || "https://unikcandle.com";
    const base = url.startsWith("http://") || url.startsWith("https://")
      ? url
      : `https://${url}`;
    return `${base}/${locale}/ar/${code}`;
  };

  const handleSendcloudAction = async (action: "create_parcel" | "get_label") => {
    setSendcloudLoading(true);
    setSendcloudError(null);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/sendcloud`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur");

      if (action === "create_parcel") {
        setOrder((prev) => ({
          ...prev,
          sendcloudParcelId: String(data.parcelId),
          trackingNumber: data.trackingNumber,
          trackingUrl: data.trackingUrl,
        }));
      } else if (action === "get_label" && data.labelUrl) {
        window.open(data.labelUrl, "_blank");
      }
    } catch (err) {
      setSendcloudError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSendcloudLoading(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const generateQRCode = (text: string): string => {
      return `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(text)}`;
    };

    const printStyles = `
      <style>
        @media print {
          * { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; }
          body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.5; color: #000; background: #fff; margin: 0; padding: 20px; }
          .print-header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #000; }
          .print-title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .print-badges { display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; }
          .print-badge { background: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-size: 12px; border: 1px solid #d1d5db; }
          .print-section { margin-bottom: 30px; break-inside: avoid; }
          .print-section-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; }
          .print-item { display: flex; align-items: center; gap: 15px; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 10px; break-inside: avoid; }
          .print-item-image { width: 60px; height: 60px; border: 1px solid #d1d5db; border-radius: 6px; object-fit: cover; }
          .print-item-details { flex: 1; }
          .print-item-name { font-weight: 600; margin-bottom: 5px; }
          .print-item-scent { font-size: 14px; color: #6b7280; }
          .print-item-qr { width: 80px; height: 80px; }
          .print-item-price { text-align: right; font-weight: 600; }
          .print-total { border-top: 2px solid #000; padding-top: 15px; margin-top: 15px; display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; }
          .print-address { background: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; }
        }
      </style>
    `;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Commande #${order.id.slice(-8).toUpperCase()}</title>
          ${printStyles}
        </head>
        <body>
          <div class="print-header">
            <div class="print-title">📦 Commande #${order.id.slice(-8).toUpperCase()}</div>
            <div class="print-badges">
              <span class="print-badge">👤 ${order.user.name || order.user.email}</span>
              <span class="print-badge">${totalItems} article${totalItems > 1 ? "s" : ""}</span>
              <span class="print-badge">${totalAmount.toFixed(2)}€</span>
            </div>
          </div>
          <div class="print-section">
            <div class="print-section-title">🛒 Articles commandés</div>
            ${order.items.map((item) => `
              <div class="print-item">
                ${item.product.images?.[0]
                  ? `<img src="${item.product.images[0].url}" alt="${item.product.name}" class="print-item-image">`
                  : '<div class="print-item-image" style="background:#f3f4f6;display:flex;align-items:center;justify-content:center;">📦</div>'
                }
                <div class="print-item-details">
                  <div class="print-item-name">${item.product.name}</div>
                  <div class="print-item-scent">Senteur : ${item.scent.name}</div>
                  ${item.engravingText ? `<div style="margin-top:4px;font-size:12px;color:#7c3aed;">🏅 Gravure : ${item.engravingText.split(",").map((t: string) => `✦ ${t.trim()} ✦`).join("  ")}</div>` : ""}
                </div>
                <div class="print-item-qr">
                  ${item.qrCode
                    ? `<img src="${generateQRCode(getArUrl(item.qrCode.code))}" alt="QR" style="width:70px;height:70px;border:1px solid #d1d5db;border-radius:4px;" />`
                    : '<div style="background:#f3f4f6;width:70px;height:70px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#6b7280;">Pas de QR</div>'
                  }
                </div>
                <div class="print-item-price">
                  <div style="font-size:14px;color:#6b7280;">${item.quantity} × ${item.price.toFixed(2)}€</div>
                  <div>${(item.quantity * item.price).toFixed(2)}€</div>
                </div>
              </div>
            `).join("")}
            ${order.items.some((i) => i.engravingText) ? `
            <div style="margin-top:16px;padding:12px;background:#f5f0ff;border-radius:8px;border:1px solid #c4b5fd;">
              <div style="font-weight:bold;margin-bottom:8px;">🏅 Gravures à réaliser</div>
              ${order.items.filter((i) => i.engravingText).map((i) => `
                <div style="margin-bottom:6px;font-size:13px;">
                  <strong>${i.product.name}</strong> : ${i.engravingText!.split(",").map((t: string) => `✦ ${t.trim()} ✦`).join(" · ")}
                </div>
              `).join("")}
            </div>` : ""}
            <div class="print-total">
              <span>Total payé</span>
              <span>${totalAmount.toFixed(2)}€</span>
            </div>
          </div>
          <div class="print-section">
            <div class="print-section-title">📍 Adresse de livraison</div>
            ${order.shippingAddress
              ? `<div class="print-address">
                  <div style="font-weight:600;">${order.shippingAddress.name}</div>
                  <div>${order.shippingAddress.street}</div>
                  <div>${order.shippingAddress.zipCode} ${order.shippingAddress.city}</div>
                  <div style="color:#6b7280;">${order.shippingAddress.state}, ${order.shippingAddress.country}</div>
                </div>`
              : `<div style="background:#fef3c7;padding:15px;border-radius:8px;border:1px solid #f59e0b;color:#92400e;font-style:italic;">Aucune adresse fournie</div>`
            }
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
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

      <DialogContent className="max-w-3xl p-0 gap-0 overflow-hidden max-h-[92vh] flex flex-col">
        {/* ── Header ── */}
        <div className="px-6 pt-6 pb-4 border-b border-border bg-muted/20 shrink-0">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <DialogTitle className="text-2xl font-mono font-bold tracking-tight">
                  #{order.id.slice(-8).toUpperCase()}
                </DialogTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                      STATUS_CLASSES[order.status] ?? "bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    {STATUS_LABELS[order.status] ?? order.status}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(order.createdAt), "d MMM yyyy 'à' HH:mm", { locale: fr })}
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="gap-2 shrink-0"
              >
                <Printer className="h-4 w-4" />
                <span className="hidden sm:inline">Imprimer</span>
              </Button>
            </div>
          </DialogHeader>

          {/* Customer pill */}
          <div className="mt-4 flex items-center gap-3 bg-background rounded-lg border border-border p-3">
            <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-tight truncate">{order.user.name}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                <Mail className="h-3 w-3 shrink-0" />
                {order.user.email}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-muted-foreground">{totalItems} article{totalItems > 1 ? "s" : ""}</p>
              <p className="text-sm font-bold">{totalAmount.toFixed(2)} €</p>
            </div>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">

            {/* Articles */}
            <section>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                <ShoppingCart className="h-3.5 w-3.5" />
                Articles commandés
              </h3>

              <div className="rounded-lg border border-border divide-y divide-border overflow-hidden">
                {order.items.map((item) => (
                  <div key={item.id} className="p-4 hover:bg-muted/20 transition-colors">
                    <div className="flex gap-4">
                      {/* Image */}
                      <div className="shrink-0">
                        {item.product.images?.[0] ? (
                          <div className="relative w-[72px] h-[72px] rounded-lg overflow-hidden border border-border shadow-sm">
                            <Image
                              src={item.product.images[0].url || "/placeholder.svg"}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-[72px] h-[72px] bg-muted rounded-lg flex items-center justify-center border border-border">
                            <Package className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="font-semibold text-sm leading-tight">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">Senteur · {item.scent.name}</p>
                        {item.engravingText && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {item.engravingText.split(",").map((text, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 font-serif italic text-primary text-xs tracking-wider"
                              >
                                <Medal className="h-2.5 w-2.5 shrink-0" />
                                {text.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground pt-0.5">
                          {item.quantity} × {item.price.toFixed(2)} €
                        </p>
                      </div>

                      {/* Right: price + QR */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="text-sm font-bold">
                          {(item.quantity * item.price).toFixed(2)} €
                        </span>
                        {item.qrCode ? (
                          <div className="flex flex-col items-center gap-1">
                            <div className="p-1.5 bg-white rounded-md border border-border shadow-sm">
                              <div className="w-14 h-14">
                                <QRCode
                                  data={getArUrl(item.qrCode.code)}
                                  foreground="oklch(0 0 0)"
                                  background="oklch(1 0 0)"
                                  robustness="M"
                                />
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                const link = document.createElement("a");
                                link.href = `/api/admin/orders/qr-code/${item.qrCode?.code}?locale=${locale}`;
                                link.download = `qr-${item.product.name.replace(/\s+/g, "-").toLowerCase()}-${item.qrCode?.code}.svg`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                              className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-0.5 transition-colors"
                            >
                              <Download className="h-2.5 w-2.5" />
                              SVG
                            </button>
                          </div>
                        ) : (
                          <div className="w-14 h-14 bg-muted/50 rounded-md flex items-center justify-center border border-dashed border-border">
                            <span className="text-[9px] text-muted-foreground text-center leading-tight">No QR</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total summary */}
              <div className="mt-3 rounded-lg border border-border bg-muted/20 p-3 space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Sous-total articles</span>
                  <span>
                    {order.items.reduce((acc, item) => acc + item.quantity * item.price, 0).toFixed(2)} €
                  </span>
                </div>
                {order.shippingCost != null && order.shippingCost > 0 && (
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Frais de port</span>
                    <span>{order.shippingCost.toFixed(2)} €</span>
                  </div>
                )}
                <Separator className="my-1" />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold">Total payé</span>
                  <span className="text-sm font-bold text-primary">{totalAmount.toFixed(2)} €</span>
                </div>
              </div>
            </section>

            {/* Gravures */}
            {order.items.some((item) => item.engravingText) && (
              <section>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Medal className="h-3.5 w-3.5" />
                  Gravures à réaliser
                </h3>
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-4">
                  {order.items
                    .filter((item) => item.engravingText)
                    .map((item) => {
                      const texts = item.engravingText!
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean);
                      return (
                        <div key={item.id} className="space-y-2">
                          <div className="flex items-center gap-2">
                            {item.product.images?.[0] && (
                              <div className="relative w-7 h-7 rounded overflow-hidden border border-border shrink-0">
                                <Image
                                  src={item.product.images[0].url}
                                  alt={item.product.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <p className="text-xs font-semibold">{item.product.name}</p>
                            <span className="text-xs text-muted-foreground">
                              — {texts.length} médaillon{texts.length > 1 ? "s" : ""}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {texts.map((text, i) => (
                              <div
                                key={i}
                                className="flex items-center justify-between rounded-lg border border-primary/20 bg-background px-3 py-2 gap-2"
                              >
                                <span className="text-xs text-muted-foreground shrink-0">#{i + 1}</span>
                                <span className="font-serif italic text-primary tracking-widest text-sm font-semibold flex-1 text-center">
                                  ✦ {text} ✦
                                </span>
                                <span className="text-xs text-muted-foreground shrink-0">{text.length}c</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </section>
            )}

            {/* Shipping + Address (2 cols) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* SendCloud */}
              <section>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Truck className="h-3.5 w-3.5" />
                  Expédition
                </h3>
                <div className="rounded-lg border border-border p-4 h-[calc(100%-28px)]">
                  {sendcloudError && (
                    <p className="text-xs text-destructive mb-3 bg-destructive/10 rounded-md p-2">
                      {sendcloudError}
                    </p>
                  )}
                  {order.shippingCost != null && order.shippingCost > 0 && (
                    <p className="text-xs text-muted-foreground mb-3">
                      Frais :{" "}
                      <span className="font-semibold text-foreground">
                        {order.shippingCost.toFixed(2)} €
                      </span>
                    </p>
                  )}
                  {order.sendcloudParcelId ? (
                    <div className="space-y-3">
                      <div className="bg-muted/50 rounded-md p-2.5 text-xs space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-muted-foreground shrink-0">Colis n°</span>
                          <span className="font-mono font-medium truncate">{order.sendcloudParcelId}</span>
                        </div>
                        {order.trackingNumber && (
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-muted-foreground shrink-0">Suivi</span>
                            <span className="font-mono font-medium truncate">{order.trackingNumber}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {order.trackingUrl && (
                          <a
                            href={order.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Suivre
                          </a>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendcloudAction("get_label")}
                          disabled={sendcloudLoading}
                          className="gap-1.5 ml-auto h-7 text-xs"
                        >
                          {sendcloudLoading ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Download className="h-3 w-3" />
                          )}
                          Étiquette
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground italic">Aucun colis créé.</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendcloudAction("create_parcel")}
                        disabled={
                          sendcloudLoading ||
                          !order.shippingAddress ||
                          order.shippingMethodId == null
                        }
                        className="gap-1.5 h-7 text-xs w-full"
                      >
                        {sendcloudLoading ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Package className="h-3 w-3" />
                        )}
                        Créer le colis
                      </Button>
                      {order.shippingMethodId == null && (
                        <p className="text-[10px] text-muted-foreground">
                          Méthode de livraison manquante
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </section>

              {/* Address */}
              <section>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5" />
                  Adresse de livraison
                </h3>
                <div className="rounded-lg border border-border p-4 h-[calc(100%-28px)]">
                  {order.shippingAddress ? (
                    <address className="not-italic text-sm space-y-0.5">
                      <p className="font-semibold">{order.shippingAddress.name}</p>
                      <p className="text-muted-foreground">{order.shippingAddress.street}</p>
                      <p className="text-muted-foreground">
                        {order.shippingAddress.zipCode} {order.shippingAddress.city}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.shippingAddress.state}, {order.shippingAddress.country}
                      </p>
                    </address>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Aucune adresse fournie.</p>
                  )}
                </div>
              </section>
            </div>

          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default DialogDetailOrder;
