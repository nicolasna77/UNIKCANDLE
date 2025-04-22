"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCart();

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (sessionId) {
      // Vider le panier après un paiement réussi
      clearCart();
    }
  }, [searchParams, clearCart]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted">
      <div className="max-w-md w-full mx-auto p-6 text-center space-y-6">
        <div className="space-y-2">
          <div className="flex justify-center">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Paiement réussi !
          </h1>
          <p className="text-muted-foreground">
            Merci pour votre achat. Vous recevrez un email de confirmation avec
            les détails de votre commande.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => router.push("/products")}>
            Continuer vos achats
          </Button>
          <Button variant="outline" onClick={() => router.push("/")}>
            Retour à l&apos;accueil
          </Button>
        </div>
      </div>
    </div>
  );
}
