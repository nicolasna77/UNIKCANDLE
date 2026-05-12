"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CreditCard,
  Truck,
  Shield,
  Loader2,
  MapPin,
  Package,
} from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ServicePointPicker } from "@/components/service-point-picker";
import type { ServicePoint } from "@/lib/sendcloud";
import { cn } from "@/lib/utils";

interface ShippingMethod {
  id: string;
  methodId: number;
  name: string;
  carrier: string;
  price: number;
  min_weight: number;
  max_weight: number;
  deliveryDays: { min: number; max: number } | null;
  requiresServicePoint: boolean;
  servicePointCarrier?: string;
}

const SHIPPING_COUNTRIES = [
  { code: "FR", label: "France" },
  { code: "BE", label: "Belgique" },
  { code: "CH", label: "Suisse" },
  { code: "LU", label: "Luxembourg" },
  { code: "DE", label: "Allemagne" },
  { code: "ES", label: "Espagne" },
  { code: "IT", label: "Italie" },
  { code: "NL", label: "Pays-Bas" },
  { code: "PT", label: "Portugal" },
  { code: "GB", label: "Royaume-Uni" },
  { code: "AT", label: "Autriche" },
  { code: "US", label: "États-Unis" },
  { code: "CA", label: "Canada" },
];

function formatDeliveryDays(days: { min: number; max: number }): string {
  if (days.min === days.max) {
    return `${days.min} jour${days.min > 1 ? "s" : ""} ouvré${days.min > 1 ? "s" : ""}`;
  }
  return `${days.min}–${days.max} jours ouvrés`;
}

function formatWeightRange(min: number, max: number): string {
  if (min <= 0) return `jusqu'à ${max} kg`;
  if (min === max) return `${min} kg`;
  return `${min}–${max} kg`;
}

interface CartSummaryProps {
  subtotal: number;
  totalWeight: number;
  isLoading: boolean;
  onCheckout: (
    methodId: number,
    shippingCost: number,
    shippingName: string,
    servicePoint: ServicePoint | null,
    country: string
  ) => void;
}

export function CartSummary({
  subtotal,
  totalWeight,
  isLoading,
  onCheckout,
}: CartSummaryProps) {
  const t = useTranslations("cart");

  const [selectedCountry, setSelectedCountry] = useState("FR");
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [shippingCost, setShippingCost] = useState(0);
  const [selectedDeliveryDays, setSelectedDeliveryDays] = useState<{
    min: number;
    max: number;
  } | null>(null);
  const [selectedServicePoint, setSelectedServicePoint] =
    useState<ServicePoint | null>(null);

  const selectedMethod = methods.find((m) => m.id === selectedId) ?? null;

  useEffect(() => {
    setLoadingMethods(true);
    setSelectedId(null);
    setShippingCost(0);
    setSelectedDeliveryDays(null);
    setSelectedServicePoint(null);

    const weightParam = totalWeight > 0 ? `&weight=${totalWeight.toFixed(3)}` : "";
    fetch(`/api/shipping/methods?country=${selectedCountry}${weightParam}`)
      .then((r) => r.json())
      .then((data: ShippingMethod[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setMethods(data);
          setSelectedId(data[0].id);
          setShippingCost(data[0].price);
          setSelectedDeliveryDays(data[0].deliveryDays);
        } else {
          setMethods([]);
        }
      })
      .catch(() => setMethods([]))
      .finally(() => setLoadingMethods(false));
  }, [totalWeight, selectedCountry]);

  const handleMethodChange = (id: string) => {
    const method = methods.find((m) => m.id === id);
    if (!method) return;
    setSelectedId(id);
    setShippingCost(method.price);
    setSelectedDeliveryDays(method.deliveryDays);
    if (!method.requiresServicePoint) setSelectedServicePoint(null);
  };

  const total = subtotal + shippingCost;
  const needsServicePoint =
    selectedMethod?.requiresServicePoint === true && selectedServicePoint === null;
  const checkoutDisabled =
    isLoading ||
    loadingMethods ||
    selectedId === null ||
    methods.length === 0 ||
    needsServicePoint;

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold">
          {t("orderSummaryTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Pays de destination */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Pays de livraison</Label>
          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger className="w-full rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SHIPPING_COUNTRIES.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Méthode de livraison */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">{t("shippingMethod")}</Label>

          {loadingMethods ? (
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground py-3">
              <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden="true" />
              {t("loadingShippingMethods")}
            </div>
          ) : methods.length === 0 ? (
            <p className="text-sm text-destructive py-2">
              Aucune livraison disponible vers{" "}
              {SHIPPING_COUNTRIES.find((c) => c.code === selectedCountry)?.label ?? selectedCountry}.
            </p>
          ) : (
            <div className="space-y-2" role="radiogroup" aria-label="Méthode de livraison">
              {methods.map((method) => (
                <label
                  key={method.id}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border p-3.5 cursor-pointer transition-all duration-150",
                    "hover:border-primary/50 hover:bg-primary/5",
                    selectedId === method.id
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border bg-background"
                  )}
                >
                  <input
                    type="radio"
                    name="shipping-method"
                    value={method.id}
                    checked={selectedId === method.id}
                    onChange={() => handleMethodChange(method.id)}
                    className="sr-only"
                  />

                  {/* Radio dot */}
                  <div
                    className={cn(
                      "h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors duration-150",
                      selectedId === method.id
                        ? "border-primary"
                        : "border-muted-foreground/30"
                    )}
                    aria-hidden="true"
                  >
                    {selectedId === method.id && (
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-sm font-medium leading-none">
                      {method.requiresServicePoint ? (
                        <MapPin
                          className="h-3.5 w-3.5 text-primary shrink-0"
                          aria-hidden="true"
                        />
                      ) : (
                        <Package
                          className="h-3.5 w-3.5 text-muted-foreground shrink-0"
                          aria-hidden="true"
                        />
                      )}
                      {method.carrier}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium leading-none",
                          method.requiresServicePoint
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {method.requiresServicePoint ? (
                          <MapPin className="h-2.5 w-2.5 shrink-0" aria-hidden="true" />
                        ) : (
                          <Package className="h-2.5 w-2.5 shrink-0" aria-hidden="true" />
                        )}
                        {method.requiresServicePoint ? "Point relais" : "À domicile"}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatWeightRange(method.min_weight, method.max_weight)}
                      </span>
                    </div>
                    {method.deliveryDays && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatDeliveryDays(method.deliveryDays)}
                      </div>
                    )}
                  </div>

                  {/* Prix */}
                  <div className="shrink-0 text-sm font-semibold tabular-nums">
                    {method.price === 0 ? (
                      <span className="text-emerald-600 font-medium">
                        {t("shippingFree")}
                      </span>
                    ) : (
                      `${method.price.toFixed(2)} €`
                    )}
                  </div>
                </label>
              ))}
            </div>
          )}

          {/* Sélecteur de point relais */}
          {selectedMethod?.requiresServicePoint && (
            <div className="mt-3 space-y-2 rounded-xl border border-dashed border-primary/30 bg-primary/3 p-3">
              <p className="text-xs font-medium text-primary flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                Choisissez votre point relais
              </p>
              {!selectedServicePoint && (
                <p className="text-xs text-muted-foreground">
                  Entrez votre code postal pour trouver un point relais proche.
                </p>
              )}
              <ServicePointPicker
                carrier={selectedMethod.servicePointCarrier}
                country={selectedCountry}
                value={selectedServicePoint}
                onChange={setSelectedServicePoint}
              />
            </div>
          )}
        </div>

        {/* Récapitulatif */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>{t("subtotal")}</span>
            <span className="tabular-nums text-foreground">
              {subtotal.toFixed(2)} €
            </span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span className="flex flex-col gap-0.5">
              {t("shipping")}
              {selectedDeliveryDays && (
                <span className="text-xs">
                  {formatDeliveryDays(selectedDeliveryDays)}
                </span>
              )}
            </span>
            <span
              className={cn(
                "tabular-nums",
                shippingCost === 0 ? "text-emerald-600 font-medium" : "text-foreground"
              )}
            >
              {shippingCost === 0 ? t("shippingFree") : `${shippingCost.toFixed(2)} €`}
            </span>
          </div>
          <div className="flex justify-between font-semibold text-base border-t border-border pt-2 mt-1">
            <span>{t("total")}</span>
            <span className="tabular-nums">{total.toFixed(2)} €</span>
          </div>
        </div>

        {/* Bouton paiement */}
        <Button
          className="w-full h-11 rounded-xl text-sm font-medium"
          onClick={() => {
            if (selectedId === null) return;
            const method = methods.find((m) => m.id === selectedId);
            onCheckout(
              method?.methodId ?? 0,
              shippingCost,
              method?.name ?? "Livraison",
              selectedServicePoint,
              selectedCountry
            );
          }}
          disabled={checkoutDisabled}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <CreditCard className="mr-2 h-4 w-4" aria-hidden="true" />
          )}
          {isLoading ? t("redirectingToStripe") : t("proceedToPayment")}
        </Button>

        {needsServicePoint && (
          <p className="text-center text-xs text-muted-foreground -mt-2">
            Veuillez choisir un point relais pour continuer.
          </p>
        )}

        {isLoading && (
          <p className="text-center text-xs text-muted-foreground" aria-live="polite">
            {t("popupBlockedMessage")}
          </p>
        )}

        {/* Trust badges */}
        <div className="space-y-2.5 border-t border-border pt-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden="true" />
            <span>{t("securePayment")}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Truck className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden="true" />
            <span>{t("fastDelivery")}</span>
          </div>
        </div>

        {/* Logos de paiement */}
        <div className="flex items-center justify-center gap-3">
          <Image src="/payment-method/1.png" alt="Visa" width={48} height={30} unoptimized />
          <Image src="/payment-method/2.png" alt="Mastercard" width={48} height={30} unoptimized />
          <Image src="/payment-method/5.png" alt="PayPal" width={48} height={30} unoptimized />
        </div>
      </CardContent>
    </Card>
  );
}
