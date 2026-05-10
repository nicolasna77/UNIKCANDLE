"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import { CreditCard, Truck, Shield, Loader2, MapPin } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ServicePointPicker } from "@/components/service-point-picker";
import type { ServicePoint } from "@/lib/sendcloud";

interface ShippingMethod {
  id: string;
  methodId: number;
  name: string;
  carrier: string;
  price: number;
  deliveryDays: { min: number; max: number } | null;
  requiresServicePoint: boolean;
  servicePointCarrier?: string;
}

interface CartSummaryProps {
  subtotal: number;
  totalWeight: number;
  isLoading: boolean;
  onCheckout: (
    methodId: number,
    shippingCost: number,
    shippingName: string,
    servicePoint: ServicePoint | null
  ) => void;
}

export function CartSummary({
  subtotal,
  totalWeight,
  isLoading,
  onCheckout,
}: CartSummaryProps) {
  const t = useTranslations("cart");

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
    const fallback: ShippingMethod = {
      id: "0",
      methodId: 0,
      name: "Livraison standard",
      carrier: "Transporteur",
      price: 0,
      deliveryDays: { min: 3, max: 5 },
      requiresServicePoint: false,
    };

    const weightParam = totalWeight > 0 ? `&weight=${totalWeight.toFixed(3)}` : "";
    fetch(`/api/shipping/methods?country=FR${weightParam}`)
      .then((r) => r.json())
      .then((data: ShippingMethod[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setMethods(data);
          setSelectedId(data[0].id);
          setShippingCost(data[0].price);
          setSelectedDeliveryDays(data[0].deliveryDays);
        } else {
          setMethods([fallback]);
          setSelectedId(fallback.id);
          setShippingCost(fallback.price);
          setSelectedDeliveryDays(fallback.deliveryDays);
        }
      })
      .catch(() => {
        setMethods([fallback]);
        setSelectedId(fallback.id);
        setShippingCost(fallback.price);
        setSelectedDeliveryDays(fallback.deliveryDays);
      })
      .finally(() => setLoadingMethods(false));
  }, [totalWeight]);

  const handleMethodChange = (value: string) => {
    const method = methods.find((m) => m.id === value);
    if (method) {
      setSelectedId(value);
      setShippingCost(method.price);
      setSelectedDeliveryDays(method.deliveryDays);
      // Réinitialiser le point relais si la nouvelle méthode n'en requiert pas
      if (!method.requiresServicePoint) {
        setSelectedServicePoint(null);
      }
    }
  };

  const total = subtotal + shippingCost;
  const checkoutDisabled =
    isLoading ||
    loadingMethods ||
    selectedId === null ||
    (selectedMethod?.requiresServicePoint === true && selectedServicePoint === null);

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>{t("orderSummaryTitle")}</CardTitle>
        <CardDescription>{t("orderSummaryDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Méthode de livraison */}
        <div className="space-y-3">
          <Label>{t("shippingMethod")}</Label>
          {loadingMethods ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground h-10">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              {t("loadingShippingMethods")}
            </div>
          ) : methods.length === 0 ? (
            <div className="text-sm text-muted-foreground h-10 flex items-center">
              {t("noShippingMethods")}
            </div>
          ) : (
            <Select
              value={selectedId ?? undefined}
              onValueChange={handleMethodChange}
            >
              <SelectTrigger className="w-full max-w-none data-[size=default]:h-auto">
                <SelectValue placeholder={t("selectShippingMethod")} />
              </SelectTrigger>
              <SelectContent className="h-auto!">
                {methods.map((method) => (
                  <SelectItem
                    key={method.id}
                    value={method.id}
                    className="h-auto!"
                  >
                    <div className="flex items-center justify-between gap-4 py-1 w-full">
                      <div className="flex flex-col text-start">
                        <div className="flex items-center gap-1.5 font-medium">
                          {method.requiresServicePoint && (
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
                          )}
                          {method.name}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {method.carrier}
                          {method.deliveryDays && (
                            <span className="ml-2">
                              &bull;{" "}
                              {method.deliveryDays.min === method.deliveryDays.max
                                ? `${method.deliveryDays.min} jour${method.deliveryDays.min > 1 ? "s" : ""} ouvré${method.deliveryDays.min > 1 ? "s" : ""}`
                                : `${method.deliveryDays.min}–${method.deliveryDays.max} jours ouvrés`}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="font-semibold text-sm shrink-0">
                        {method.price === 0 ? (
                          <span className="text-green-600">
                            {t("shippingFree")}
                          </span>
                        ) : (
                          `${method.price.toFixed(2)} €`
                        )}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Sélecteur de point relais */}
          {selectedMethod?.requiresServicePoint && (
            <div className="space-y-2 pt-1">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
                Point relais
              </Label>
              {!selectedServicePoint && (
                <p className="text-xs text-muted-foreground">
                  Recherchez un point relais par code postal pour continuer.
                </p>
              )}
              <ServicePointPicker
                carrier={selectedMethod.servicePointCarrier}
                country="FR"
                value={selectedServicePoint}
                onChange={setSelectedServicePoint}
              />
            </div>
          )}
        </div>

        {/* Résumé */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{t("subtotal")}</span>
            <span className="tabular-nums">{subtotal.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="flex flex-col">
              {t("shipping")}
              {selectedDeliveryDays && (
                <span className="text-xs text-muted-foreground">
                  {selectedDeliveryDays.min === selectedDeliveryDays.max
                    ? `${selectedDeliveryDays.min} jour${selectedDeliveryDays.min > 1 ? "s" : ""} ouvré${selectedDeliveryDays.min > 1 ? "s" : ""}`
                    : `${selectedDeliveryDays.min}–${selectedDeliveryDays.max} jours ouvrés`}
                </span>
              )}
            </span>
            <span
              className={`tabular-nums ${shippingCost === 0 ? "text-green-600" : ""}`}
            >
              {shippingCost === 0
                ? t("shippingFree")
                : `${shippingCost.toFixed(2)} €`}
            </span>
          </div>
          <div className="flex justify-between font-medium">
            <span>{t("total")}</span>
            <span className="tabular-nums">{total.toFixed(2)} €</span>
          </div>
        </div>

        {/* Avantages */}
        <div className="space-y-4 border-t border-border pt-4">
          <div className="flex items-center gap-2 text-sm">
            <Shield className="text-primary h-4 w-4" aria-hidden="true" />
            <span>{t("securePayment")}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Truck className="text-primary h-4 w-4" aria-hidden="true" />
            <span>{t("fastDelivery")}</span>
          </div>
        </div>

        {/* Bouton paiement */}
        <Button
          className="w-full"
          onClick={() => {
            if (selectedId !== null) {
              const method = methods.find((m) => m.id === selectedId);
              onCheckout(
                method?.methodId ?? 0,
                shippingCost,
                method?.name ?? "Livraison",
                selectedServicePoint
              );
            }
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

        {selectedMethod?.requiresServicePoint && !selectedServicePoint && (
          <p className="text-center text-xs text-muted-foreground">
            Veuillez choisir un point relais pour continuer.
          </p>
        )}

        {isLoading && (
          <p
            className="text-center text-sm text-muted-foreground mt-2"
            aria-live="polite"
          >
            {t("popupBlockedMessage")}
          </p>
        )}

        {/* Logos de paiement */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <Image
            src="/payment-method/1.png"
            alt="Visa"
            width={64}
            height={40}
            unoptimized
          />
          <Image
            src="/payment-method/2.png"
            alt="Mastercard"
            width={64}
            height={40}
            unoptimized
          />
          <Image
            src="/payment-method/5.png"
            alt="PayPal"
            width={64}
            height={40}
            unoptimized
          />
        </div>
      </CardContent>
    </Card>
  );
}
