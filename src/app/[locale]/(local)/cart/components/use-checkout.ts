"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { loadStripe } from "@stripe/stripe-js";
import { useTranslations } from "next-intl";
import type { CartItem } from "@/context/CartContext";

export function useCheckout(cart: CartItem[]) {
  const t = useTranslations("cart");
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  const handleCheckout = async () => {
    try {
      setIsLoading(true);

      const stripePublishableKey =
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
      if (!stripePublishableKey) {
        toast.error(t("stripeConfigMissing"));
        console.error("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY manquante");
        return;
      }

      // Timeout de sécurité pour réinitialiser le loading après 5 minutes
      timeoutRef.current = setTimeout(
        () => {
          setIsLoading(false);
          console.log("Timeout atteint, réinitialisation du loading");
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

      if (!data.sessionId) {
        throw new Error("Session ID manquant");
      }

      const stripe = await loadStripe(stripePublishableKey);
      if (!stripe) {
        toast.error(t("cannotInitializePayment"));
        throw new Error("Stripe n'a pas pu être initialisé");
      }

      if (
        !data.sessionId.startsWith("cs_test_") &&
        !data.sessionId.startsWith("cs_live_")
      ) {
        throw new Error("Session ID invalide - format incorrect");
      }

      const result = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (result.error) {
        const errorMessage =
          result.error.message ||
          `Erreur Stripe (${result.error.type || "unknown"})`;

        toast.error(`${t("redirectionError")}: ${errorMessage}`);
        throw new Error(errorMessage);
      }
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
