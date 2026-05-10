"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  CartItemCard,
  CartSummary,
  EmptyCart,
  useCheckout,
} from "./components";

export default function CartPage() {
  const t = useTranslations("cart");
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const { isLoading, handleCheckout } = useCheckout(cart);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleCheckoutWithShipping = (
    methodId: number,
    shippingCost: number,
    shippingName: string,
    servicePoint: unknown | null
  ) => {
    handleCheckout(methodId, shippingCost, shippingName, servicePoint);
  };

  const getItemKey = (item: (typeof cart)[0]) => {
    return `${item.id}-${item.selectedScent.id}-${item.audioUrl || "no-audio"}-${item.videoUrl || "no-video"}-${item.textMessage || "no-text"}-${item.engravingText || "no-engraving"}`;
  };

  const subtotal = cart.reduce((sum, item) => {
    const qty = item.quantity || 1;
    const engravingCost =
      item.engravingText && item.engravingPrice ? item.engravingPrice : 0;
    return sum + (item.price + engravingCost) * qty;
  }, 0);

  const totalWeight = cart.reduce(
    (sum, item) => sum + (item.quantity || 1) * 0.75,
    0
  );

  if (cart.length === 0) {
    return <EmptyCart />;
  }

  const productsWithCustomization = cart.filter(
    (item) => item.videoUrl || item.audioUrl || item.textMessage || item.engravingText
  );
  const productsWithoutCustomization = cart.filter(
    (item) => !item.videoUrl && !item.audioUrl && !item.textMessage && !item.engravingText
  );

  return (
    <div className="mx-auto w-full max-w-7xl p-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Section principale du panier */}
        <div className="space-y-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                {t("myCart")}
              </h1>
              <p className="text-muted-foreground">
                {cart.length} {cart.length === 1 ? t("item") : t("items")}{" "}
                {t("itemsInCart")}
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" aria-hidden="true" />
                  {t("emptyCart")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("emptyCartConfirmTitle")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("emptyCartConfirmDescription")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => {
                      clearCart();
                      toast.success(t("emptyCartSuccess"));
                    }}
                  >
                    {t("emptyCart")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="space-y-4">
            {/* Produits avec personnalisation (audio ou message) */}
            {productsWithCustomization.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground border-b pb-2">
                  {t("withAudio")} ({productsWithCustomization.length})
                </h3>
                {productsWithCustomization.map((item) => (
                  <CartItemCard
                    key={getItemKey(item)}
                    item={item}
                    itemKey={getItemKey(item)}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeFromCart}
                    hasCustomization
                  />
                ))}
              </div>
            )}

            {/* Produits sans personnalisation */}
            {productsWithoutCustomization.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground border-b pb-2">
                  {t("standardProducts")} ({productsWithoutCustomization.length})
                </h3>
                {productsWithoutCustomization.map((item) => (
                  <CartItemCard
                    key={getItemKey(item)}
                    item={item}
                    itemKey={getItemKey(item)}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeFromCart}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Récapitulatif de commande */}
        <div className="space-y-6">
          <CartSummary
            subtotal={subtotal}
            totalWeight={totalWeight}
            isLoading={isLoading}
            onCheckout={handleCheckoutWithShipping}
          />
        </div>
      </div>
    </div>
  );
}
