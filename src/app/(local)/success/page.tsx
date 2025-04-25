"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { clearCart } = useCart();

  useEffect(() => {
    if (sessionId) {
      clearCart();
      toast.success("Paiement effectué avec succès !");
    }
  }, [sessionId]);

  return (
    <section className="bg-white min-h-screen flex items-center justify-center py-8 antialiased dark:bg-gray-900 md:py-16">
      <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 rounded-full bg-green-100 p-4 dark:bg-green-900">
              <svg
                className="h-8 w-8 text-green-500 dark:text-green-400"
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
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              Commande confirmée !
            </h3>
            <p className="mb-4 text-gray-500 dark:text-gray-400">
              Merci pour votre achat. Nous vous enverrons un email de
              confirmation avec les détails de votre commande.
            </p>
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
}
