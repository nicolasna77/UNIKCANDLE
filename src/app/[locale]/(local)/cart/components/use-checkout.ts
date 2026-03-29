"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { useTranslations } from "next-intl";
import type { CartItem } from "@/context/CartContext";

export function useCheckout(cart: CartItem[]) {
  const t = useTranslations("cart");
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shippingRef = useRef<{ methodId: number; cost: number; name: string } | null>(null);

  // Vérifier si l'utilisateur revient après annulation
  useEffect(() => {
    if (searchParams.get("cancelled") === "true") {
      toast.info(t("paymentCancelled"));
      router.replace("/cart");
    }
  }, [searchParams, router, t]);

  // Gérer le retour de l'utilisateur depuis Stripe
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isLoading) {
        setIsLoading(false);
        console.log("Utilisateur revenu sur la page, arrêt du loading");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isLoading]);

  const handleCheckout = async (methodId: number, shippingCost: number, shippingName: string) => {
    shippingRef.current = { methodId, cost: shippingCost, name: shippingName };
    try {
      setIsLoading(true);

      // Timeout de sécurité pour réinitialiser le loading après 5 minutes
      timeoutRef.current = setTimeout(
        () => {
          setIsLoading(false);
        },
        5 * 60 * 1000
      );

      // Vérifier si l'utilisateur est connecté
      const { data: session } = await authClient.getSession();

      if (!session) {
        router.push(`/auth/signin?callbackUrl=${encodeURIComponent("/cart")}`);
        return;
      }

      if (cart.length === 0) {
        toast.error(t("cartIsEmpty"));
        return;
      }

      const invalidItems = cart.filter(
        (item) => !item.quantity || item.quantity < 1
      );
      if (invalidItems.length > 0) {
        toast.error(t("invalidQuantity"));
        return;
      }

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartItems: cart,
          selectedMethodId: shippingRef.current?.methodId,
          shippingCost: shippingRef.current?.cost ?? 0,
          shippingName: shippingRef.current?.name ?? "Livraison",
          returnUrl: `${window.location.origin}/cart`,
        }),
      });

      const responseText = await response.text();

      if (!response.ok) {
        let errorMessage = "Erreur lors de la création de la session de paiement";

        switch (response.status) {
          case 400:
            errorMessage = t("invalidCartData");
            break;
          case 401:
            errorMessage = t("mustBeLoggedIn");
            break;
          case 500:
            errorMessage = t("serverError");
            break;
          default:
            try {
              const errorData = JSON.parse(responseText);
              if (errorData.message) {
                errorMessage = errorData.message;
              }
            } catch {
              if (responseText && responseText.length < 100) {
                errorMessage = responseText;
              }
            }
        }

        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      const data = JSON.parse(responseText);

      if (!data.url) {
        throw new Error("URL de paiement manquante");
      }

      // Redirection directe vers l'URL Stripe Checkout (API moderne)
      window.location.href = data.url;
    } catch (error) {
      console.error("Erreur lors du paiement:", error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors du paiement";

      if (
        !errorMessage.includes("Données du panier") &&
        !errorMessage.includes("Vous devez être connecté") &&
        !errorMessage.includes("Erreur du serveur")
      ) {
        toast.error(errorMessage);
      }
    } finally {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setIsLoading(false);
    }
  };

  return { isLoading, handleCheckout };
}
