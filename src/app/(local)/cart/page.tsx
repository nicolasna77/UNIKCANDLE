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
  Trash2,
  Plus,
  Minus,
  Package,
  CreditCard,
  Truck,
  Shield,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { useState, useEffect, useRef } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Vérifier si l'utilisateur revient après annulation
  useEffect(() => {
    if (searchParams.get("cancelled") === "true") {
      toast.info("Paiement annulé. Vous pouvez continuer vos achats.");
      // Nettoyer l'URL
      router.replace("/cart");
    }
  }, [searchParams, router]);

  // Gérer le retour de l'utilisateur depuis Stripe
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isLoading) {
        // L'utilisateur est revenu sur la page, arrêter le loading
        setIsLoading(false);
        console.log("Utilisateur revenu sur la page, arrêt du loading");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isLoading]);
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0
  );
  const handleCheckout = async () => {
    try {
      setIsLoading(true);

      // Timeout de sécurité pour réinitialiser le loading après 5 minutes
      timeoutRef.current = setTimeout(
        () => {
          setIsLoading(false);
          console.log("Timeout atteint, réinitialisation du loading");
        },
        5 * 60 * 1000
      ); // 5 minutes

      // Vérifier si l'utilisateur est connecté
      const { data: session } = await authClient.getSession();
      console.log("Session utilisateur:", session);

      if (!session) {
        console.log(
          "Utilisateur non connecté, redirection vers la page de connexion"
        );
        router.push(`/auth/signin?callbackUrl=${encodeURIComponent("/cart")}`);
        return;
      }

      // Vérifier que le panier n'est pas vide
      if (cart.length === 0) {
        toast.error("Votre panier est vide");
        return;
      }

      // Vérifier que tous les articles ont une quantité valide
      const invalidItems = cart.filter(
        (item) => !item.quantity || item.quantity < 1
      );
      if (invalidItems.length > 0) {
        toast.error("Certains articles ont une quantité invalide");
        return;
      }

      console.log("Contenu du panier avant envoi:", cart);

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cartItems: cart,
          returnUrl: `${window.location.origin}/cart`,
        }),
      });

      console.log("Réponse du serveur:", response.status);
      const responseText = await response.text();
      console.log("Contenu de la réponse:", responseText);

      if (!response.ok) {
        console.error("Erreur détaillée:", responseText);
        throw new Error("Erreur lors de la création de la session de paiement");
      }

      const data = JSON.parse(responseText);
      console.log("Données reçues du serveur:", data);

      if (!data.sessionId) {
        console.error("Session ID manquant dans la réponse:", data);
        throw new Error("Session ID manquant");
      }

      console.log("Session ID reçu:", data.sessionId);
      console.log("Type de sessionId:", typeof data.sessionId);
      console.log("Longueur sessionId:", data.sessionId.length);

      // Rediriger directement vers Stripe
      const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
      console.log("Clé Stripe:", stripeKey ? "Présente" : "Manquante");
      console.log(
        "Clé Stripe (première partie):",
        stripeKey ? stripeKey.substring(0, 10) + "..." : "Aucune"
      );

      if (!stripeKey) {
        throw new Error("Clé publique Stripe manquante");
      }

      const stripe = await loadStripe(stripeKey);
      if (!stripe) {
        console.error(
          "Stripe n'a pas pu être initialisé avec la clé:",
          stripeKey.substring(0, 10) + "..."
        );
        throw new Error("Stripe n'a pas pu être initialisé");
      }

      console.log("Stripe initialisé, redirection vers:", data.sessionId);

      // Validation du sessionId
      if (
        !data.sessionId.startsWith("cs_test_") &&
        !data.sessionId.startsWith("cs_live_")
      ) {
        throw new Error("Session ID invalide - format incorrect");
      }

      console.log("Début de la redirection Stripe...");
      const result = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      console.log("Résultat de redirectToCheckout:", result);

      if (result.error) {
        console.error("Erreur détaillée Stripe:", {
          error: result.error,
          message: result.error.message,
          type: result.error.type,
          code: result.error.code,
          isEmptyObject: Object.keys(result.error).length === 0,
        });

        const errorMessage =
          result.error.message ||
          `Erreur Stripe (${result.error.type || "unknown"})` ||
          "Erreur inconnue lors de la redirection";

        toast.error(
          `Erreur lors de la redirection vers le paiement: ${errorMessage}`
        );
        throw new Error(errorMessage);
      } else {
        console.log(
          "Redirection Stripe réussie - cette ligne ne devrait pas s'afficher"
        );
        // Note: Cette ligne ne devrait jamais s'exécuter car redirectToCheckout()
        // redirige la page vers Stripe
      }
    } catch (error) {
      console.error("Erreur lors du paiement:", error);
      toast.error("Une erreur est survenue lors du paiement");
    } finally {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setIsLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <section className="py-8 antialiased md:py-16">
        <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
          <Card className="max-w-md mx-auto p-8 text-center">
            <CardHeader>
              <CardTitle>Votre panier est vide</CardTitle>
              <CardDescription>
                Découvrez nos produits et trouvez votre bougie parfaite !
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/products">
                <Button>Découvrir nos produits</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl p-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Section principale du panier */}
        <div className="space-y-6 lg:col-span-2">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Mon panier
            </h1>
            <p className="text-muted-foreground">
              {cart.length} {cart.length === 1 ? "article" : "articles"} dans
              votre panier
            </p>
          </div>

          <div className="space-y-4">
            {cart.map((item) => (
              <Card
                key={item.id + (item.selectedScent?.id || "")}
                className="overflow-hidden border-border p-0"
              >
                <CardContent className="p-0">
                  <div className="flex h-full flex-col md:flex-row">
                    {/* Image produit */}
                    <div className="relative h-auto w-full md:w-32">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        width={500}
                        height={500}
                        className="h-full w-full object-cover md:w-32"
                      />
                    </div>

                    {/* Détails produit */}
                    <div className="flex-1 p-6 pb-3">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-medium text-foreground">
                            {item.name}
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            {item.selectedScent?.name}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              updateQuantity(item.id, (item.quantity || 1) - 1)
                            }
                            disabled={(item.quantity || 1) <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center text-foreground">
                            {item.quantity || 1}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              updateQuantity(item.id, (item.quantity || 1) + 1)
                            }
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="text-right">
                          <div className="font-medium text-foreground">
                            {(item.price * (item.quantity || 1)).toFixed(2)} €
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Récapitulatif de commande */}
        <div className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Récapitulatif de la commande</CardTitle>
              <CardDescription>
                Vérifiez les détails de votre commande et la livraison
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Méthode de livraison */}
              <div className="space-y-2">
                <Label>Méthode de livraison</Label>
                <Select value="standard" disabled>
                  <SelectTrigger className="w-full max-w-none data-[size=default]:h-auto">
                    <SelectValue placeholder="Livraison standard gratuite" />
                  </SelectTrigger>
                  <SelectContent className="!h-auto">
                    <SelectItem value="standard" className="!h-auto">
                      <div className="flex flex-col justify-between text-start">
                        <div className="font-medium">Livraison standard</div>
                        <div className="text-muted-foreground text-sm">
                          3-5 jours
                        </div>
                        <div className="font-medium text-green-600">
                          Gratuite
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Résumé */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Sous-total</span>
                  <span>{subtotal.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Livraison</span>
                  <span className="text-green-600">Gratuite</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>{subtotal.toFixed(2)} €</span>
                </div>
              </div>

              {/* Avantages */}
              <div className="space-y-4 border-t border-border pt-4">
                <div className="flex items-center gap-2 text-sm">
                  <Package className="text-primary h-4 w-4" />
                  <span>Retours gratuits sous 30 jours</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="text-primary h-4 w-4" />
                  <span>Paiement sécurisé</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Truck className="text-primary h-4 w-4" />
                  <span>Livraison rapide</span>
                </div>
              </div>

              {/* Bouton paiement */}
              <Button
                className="w-full"
                onClick={handleCheckout}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="mr-2 h-4 w-4" />
                )}
                {isLoading
                  ? "Redirection vers Stripe..."
                  : "Procéder au paiement"}
              </Button>

              {isLoading && (
                <p className="text-center text-sm text-muted-foreground mt-2">
                  Si la page Stripe ne s&apos;ouvre pas, vérifiez que les
                  pop-ups ne sont pas bloqués.
                </p>
              )}

              {/* Logos de paiement */}
              <div className="flex items-center justify-center gap-4 mt-4">
                <Image
                  src="/payment-method/1.png"
                  alt="Visa"
                  width={64}
                  height={40}
                />
                <Image
                  src="/payment-method/2.png"
                  alt="Mastercard"
                  width={64}
                  height={40}
                />
                <Image
                  src="/payment-method/5.png"
                  alt="PayPal"
                  width={64}
                  height={40}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
