"use client";

import { Button } from "@/components/ui/button";
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

  // Helper function to generate unique key for cart items (must match CartContext)
  const getItemKey = (item: (typeof cart)[0]) => {
    return `${item.id}-${item.selectedScent.id}-${item.audioUrl || "no-audio"}-${item.textMessage || "no-text"}`;
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0
  );

  if (cart.length === 0) {
    return <EmptyCart />;
  }

  // Grouper les produits par type (avec/sans personnalisation)
  const productsWithCustomization = cart.filter(
    (item) => item.audioUrl || item.textMessage
  );
  const productsWithoutCustomization = cart.filter(
    (item) => !item.audioUrl && !item.textMessage
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                clearCart();
                toast.success(t("emptyCartSuccess"));
              }}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t("emptyCart")}
            </Button>
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
            isLoading={isLoading}
            onCheckout={handleCheckout}
          />
        </div>
      </div>
    </div>
  );
}
