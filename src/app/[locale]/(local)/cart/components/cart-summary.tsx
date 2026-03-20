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
import {
  CreditCard,
  Truck,
  Shield,
  Package,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

interface ShippingMethod {
  id: number;
  name: string;
  carrier: string;
  price: number;
}

interface CartSummaryProps {
  subtotal: number;
  isLoading: boolean;
  onCheckout: (methodId: number, shippingCost: number) => void;
}

export function CartSummary({
  subtotal,
  isLoading,
  onCheckout,
}: CartSummaryProps) {
  const t = useTranslations("cart");

  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [selectedMethodId, setSelectedMethodId] = useState<number | null>(null);
  const [shippingCost, setShippingCost] = useState(0);

  useEffect(() => {
    fetch("/api/shipping/methods?country=FR")
      .then((r) => r.json())
      .then((data: ShippingMethod[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setMethods(data);
          setSelectedMethodId(data[0].id);
          setShippingCost(data[0].price);
        }
      })
      .catch(() => {
        // Fallback silencieux
      })
      .finally(() => setLoadingMethods(false));
  }, []);

  const handleMethodChange = (value: string) => {
    const id = parseInt(value, 10);
    const method = methods.find((m) => m.id === id);
    if (method) {
      setSelectedMethodId(id);
      setShippingCost(method.price);
    }
  };

  const total = subtotal + shippingCost;

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>{t("orderSummaryTitle")}</CardTitle>
        <CardDescription>{t("orderSummaryDescription")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Méthode de livraison */}
        <div className="space-y-2">
          <Label>{t("shippingMethod")}</Label>
          {loadingMethods ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground h-10">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("loadingShippingMethods")}
            </div>
          ) : methods.length === 0 ? (
            <div className="text-sm text-muted-foreground h-10 flex items-center">
              {t("noShippingMethods")}
            </div>
          ) : (
            <Select
              value={selectedMethodId?.toString()}
              onValueChange={handleMethodChange}
            >
              <SelectTrigger className="w-full max-w-none data-[size=default]:h-auto">
                <SelectValue placeholder={t("selectShippingMethod")} />
              </SelectTrigger>
              <SelectContent className="!h-auto">
                {methods.map((method) => (
                  <SelectItem
                    key={method.id}
                    value={method.id.toString()}
                    className="!h-auto"
                  >
                    <div className="flex flex-col justify-between text-start py-1">
                      <div className="font-medium">{method.name}</div>
                      <div className="text-muted-foreground text-sm">
                        {method.carrier}
                      </div>
                      <div className="font-medium text-primary">
                        {method.price === 0
                          ? t("shippingFree")
                          : `${method.price.toFixed(2)} €`}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Résumé */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{t("subtotal")}</span>
            <span>{subtotal.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>{t("shipping")}</span>
            <span className={shippingCost === 0 ? "text-green-600" : ""}>
              {shippingCost === 0
                ? t("shippingFree")
                : `${shippingCost.toFixed(2)} €`}
            </span>
          </div>
          <div className="flex justify-between font-medium">
            <span>{t("total")}</span>
            <span>{total.toFixed(2)} €</span>
          </div>
        </div>

        {/* Avantages */}
        <div className="space-y-4 border-t border-border pt-4">
          <div className="flex items-center gap-2 text-sm">
            <Package className="text-primary h-4 w-4" />
            <span>{t("freeReturns")}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Shield className="text-primary h-4 w-4" />
            <span>{t("securePayment")}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Truck className="text-primary h-4 w-4" />
            <span>{t("fastDelivery")}</span>
          </div>
        </div>

        {/* Bouton paiement */}
        <Button
          className="w-full"
          onClick={() => {
            if (selectedMethodId !== null) {
              onCheckout(selectedMethodId, shippingCost);
            }
          }}
          disabled={isLoading || loadingMethods || selectedMethodId === null}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CreditCard className="mr-2 h-4 w-4" />
          )}
          {isLoading ? t("redirectingToStripe") : t("proceedToPayment")}
        </Button>

        {isLoading && (
          <p className="text-center text-sm text-muted-foreground mt-2">
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
