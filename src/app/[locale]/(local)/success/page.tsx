"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { useCart } from "@/context/CartContext";
import confetti from "canvas-confetti";
import { useSearchParams } from "next/navigation";
import { createOrder } from "./confirm.action";
import { CheckCircle2, Package, ShoppingBag, Loader2, ArrowRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product?: { name: string };
  videoUrl?: string | null;
  audioUrl?: string | null;
}

interface OrderDetails {
  id: string;
  total: number;
  items?: OrderItem[];
}

const SuccessPage = () => {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const { clearCart } = useCart();
  const hasClearedCart = useRef(false);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleCreateOrder = useCallback(async () => {
    if (!sessionId) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const order = await createOrder({ sessionId });
      setOrderDetails(order);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    handleCreateOrder();
  }, [handleCreateOrder]);

  const fireConfetti = useCallback(() => {
    const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];
    const end = Date.now() + 3000;
    const frame = () => {
      if (Date.now() > end) return;
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        startVelocity: 60,
        origin: { x: 0, y: 0.5 },
        colors,
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        startVelocity: 60,
        origin: { x: 1, y: 0.5 },
        colors,
      });
      requestAnimationFrame(frame);
    };
    frame();
  }, []);

  useEffect(() => {
    fireConfetti();
  }, [fireConfetti]);

  useEffect(() => {
    if (!hasClearedCart.current) {
      clearCart();
      hasClearedCart.current = true;
    }
  }, [clearCart]);

  return (
    <section className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          {/* Header vert */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 px-8 py-10 flex flex-col items-center gap-4 border-b border-border">
            <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/40 p-4">
              <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-center space-y-1.5">
              <h1 className="text-2xl font-bold tracking-tight">Commande confirmée !</h1>
              <p className="text-sm text-muted-foreground">
                Merci pour votre achat. Un email de confirmation vous sera envoyé.
              </p>
            </div>
          </div>

          {/* Corps */}
          <div className="px-8 py-6 space-y-5">
            {isLoading ? (
              <div className="flex flex-col items-center gap-3 py-4 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
                <p className="text-sm">Finalisation de la commande…</p>
              </div>
            ) : hasError ? (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive text-center">
                Une erreur est survenue. Votre commande a peut-être quand même été enregistrée — vérifiez vos emails.
              </div>
            ) : orderDetails ? (
              <div className="space-y-3">
                {/* Numéro de commande */}
                <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Package className="h-4 w-4" />
                    Commande
                  </div>
                  <span className="font-mono text-sm font-semibold">
                    #{orderDetails.id.slice(-8).toUpperCase()}
                  </span>
                </div>

                {/* Articles */}
                {orderDetails.items && orderDetails.items.length > 0 && (
                  <div className="rounded-lg border border-border divide-y divide-border overflow-hidden">
                    {orderDetails.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between px-4 py-3 gap-3">
                        <p className="text-sm font-medium truncate flex-1">
                          {item.product?.name ?? "Produit"}
                        </p>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs text-muted-foreground">×{item.quantity}</span>
                          <span className="text-sm font-semibold">
                            {(item.price * item.quantity).toFixed(2)} €
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Separator />

                {/* Total */}
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-sm">Total payé</span>
                  <span className="text-primary">{orderDetails.total.toFixed(2)} €</span>
                </div>
              </div>
            ) : null}

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-2">
              <Link href="/profil/orders" className="w-full">
                <Button className="w-full gap-2">
                  Voir mes commandes
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/products" className="w-full">
                <Button variant="outline" className="w-full gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  Continuer les achats
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SuccessPage;
