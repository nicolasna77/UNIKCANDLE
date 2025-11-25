"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import Loading from "@/components/loading";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const redirectToCheckout = async () => {
      if (!sessionId) return;

      try {
        const stripe = await stripePromise;
        if (!stripe) throw new Error("Stripe n'a pas pu être initialisé");

        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
          console.error("Erreur lors de la redirection vers Stripe:", error);
        }
      } catch (error) {
        console.error("Erreur lors du paiement:", error);
      }
    };

    redirectToCheckout();
  }, [sessionId]);

  return <Loading />;
}
