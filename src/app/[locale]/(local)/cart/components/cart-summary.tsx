"use client";

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

interface CartSummaryProps {
  subtotal: number;
  isLoading: boolean;
  onCheckout: () => void;
}

export function CartSummary({
  subtotal,
  isLoading,
  onCheckout,
}: CartSummaryProps) {
  const t = useTranslations("cart");

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
          <Select value="standard" disabled>
            <SelectTrigger className="w-full max-w-none data-[size=default]:h-auto">
              <SelectValue placeholder={t("standardShippingPlaceholder")} />
            </SelectTrigger>
            <SelectContent className="!h-auto">
              <SelectItem value="standard" className="!h-auto">
                <div className="flex flex-col justify-between text-start">
                  <div className="font-medium">{t("standardShipping")}</div>
                  <div className="text-muted-foreground text-sm">
                    {t("deliveryTime")}
                  </div>
                  <div className="font-medium text-green-600">
                    {t("shippingFree")}
                  </div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Résumé */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{t("subtotal")}</span>
            <span>{subtotal.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>{t("shipping")}</span>
            <span className="text-green-600">{t("shippingFree")}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>{t("total")}</span>
            <span>{subtotal.toFixed(2)} €</span>
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
        <Button className="w-full" onClick={onCheckout} disabled={isLoading}>
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
