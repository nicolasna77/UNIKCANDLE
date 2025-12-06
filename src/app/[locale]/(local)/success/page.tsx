"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { useCart } from "@/context/CartContext";
import confetti from "canvas-confetti";
import { useSearchParams } from "next/navigation";
import { createOrder } from "./confirm.action";

interface OrderItem {
  id: string;
  product?: {
    name: string;
  };
  audioUrl?: string;
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

  const handleCreateOrder = useCallback(async () => {
    if (sessionId) {
      try {
        setIsLoading(true);
        const order = await createOrder({ sessionId: sessionId });
        setOrderDetails(order);
        console.log("Commande créée:", order);
      } catch (error) {
        console.error("Erreur lors de la création de la commande:", error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [sessionId]);

  useEffect(() => {
    handleCreateOrder();
  }, [handleCreateOrder]);

  const fireConfetti = useCallback(() => {
    const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];
    const end = Date.now() + 3 * 1000; // 3 seconds
    const frame = () => {
      if (Date.now() > end) return;

      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        startVelocity: 60,
        origin: { x: 0, y: 0.5 },
        colors: colors,
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        startVelocity: 60,
        origin: { x: 1, y: 0.5 },
        colors: colors,
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
    <section className="bg-white min-h-screen flex items-center justify-center py-8 antialiased md:py-16">
      <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-8 text-center ">
            <div className="mb-4 rounded-full bg-green-100 p-4 ">
              <svg
                className="h-8 w-8 text-green-500 "
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900 ">
              Commande confirmée !
            </h3>
            <p className="mb-4 text-gray-500 ">
              Merci pour votre achat. Nous vous enverrons un email de
              confirmation avec les détails de votre commande.
            </p>

            {/* Debug: Affichage des détails de la commande */}
            {process.env.NODE_ENV === "development" && (
              <div className="w-full mt-4 p-4 bg-gray-100  rounded-lg text-left">
                <h4 className="font-semibold mb-2">
                  Debug - Détails de la commande:
                </h4>
                {isLoading ? (
                  <p>Chargement...</p>
                ) : orderDetails ? (
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>ID:</strong> {orderDetails.id}
                    </p>
                    <p>
                      <strong>Total:</strong> {orderDetails.total}€
                    </p>
                    <p>
                      <strong>Items:</strong>
                    </p>
                    <ul className="ml-4 space-y-1">
                      {orderDetails.items?.map(
                        (item: OrderItem, index: number) => (
                          <li key={index}>
                            - {item.product?.name} (Audio:{" "}
                            {item.audioUrl ? "✅" : "❌"})
                            {item.audioUrl && (
                              <span className="text-green-600 ml-2">
                                URL: {item.audioUrl.substring(0, 50)}...
                              </span>
                            )}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                ) : (
                  <p className="text-red-500">Aucune commande trouvée</p>
                )}
              </div>
            )}

            <div className="flex gap-4">
              <Link href="/products">
                <Button variant="outline">Continuer les achats</Button>
              </Link>
              <Link href="/profil/orders">
                <Button>Voir mes commandes</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SuccessPage;
