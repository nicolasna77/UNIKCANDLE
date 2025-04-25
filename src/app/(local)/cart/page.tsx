"use client";

import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Star, Trash2, Plus, Minus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart } = useCart();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const calculateTotal = () => {
    return cart.reduce(
      (total, item) => total + item.price * (item.quantity || 1),
      0
    );
  };

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(id, newQuantity);
    toast.success("Quantité mise à jour");
  };

  const handleRemoveItem = (id: string) => {
    removeFromCart(id);
    toast.error("Produit retiré du panier");
  };

  const handleCheckout = async () => {
    try {
      setIsLoading(true);
      console.log("Début du processus de paiement");
      console.log("Contenu du panier:", cart);

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

      console.log("Envoi de la requête à l'API Stripe");
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cart }),
      });

      console.log("Réponse de l'API Stripe:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erreur détaillée:", errorData);
        throw new Error("Erreur lors de la création de la session de paiement");
      }

      const { url } = await response.json();
      console.log("URL de redirection Stripe:", url);

      if (!url) {
        throw new Error("URL de redirection manquante");
      }

      router.push(url);
    } catch (error) {
      console.error("Erreur lors du paiement:", error);
      toast.error("Une erreur est survenue lors du paiement");
    } finally {
      setIsLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <section className=" py-8 antialiased dark:bg-gray-900 md:py-16">
        <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
            Panier
          </h2>
          <div className="mt-8 flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-700">
              <svg
                className="h-8 w-8 text-gray-500 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              Votre panier est vide
            </h3>
            <p className="mb-4 text-gray-500 dark:text-gray-400">
              Découvrez nos produits et trouvez votre bougie parfaite
            </p>
            <Link href="/products">
              <Button>Découvrir nos produits</Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-8 antialiased dark:bg-gray-900 md:py-16">
      <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
          Panier ({cart.length} {cart.length > 1 ? "articles" : "article"})
        </h2>

        <div className="mt-6 sm:mt-8 md:gap-6 lg:flex lg:items-start xl:gap-8">
          <div className="mx-auto w-full flex-none lg:max-w-2xl xl:max-w-4xl">
            <div className="space-y-6">
              {cart.map((item) => (
                <div
                  key={`${item.id}-${item.selectedScent.id}`}
                  className="group rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:shadow-gray-700 md:p-6"
                >
                  <div className="space-y-4 md:flex md:items-center md:justify-between md:gap-6 md:space-y-0">
                    <Link
                      href={`/products/${item.id}`}
                      className="shrink-0 md:order-1"
                    >
                      <div className="relative h-20 w-20 overflow-hidden rounded-lg">
                        <Image
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                          src={item.imageUrl}
                          alt={item.name}
                          width={80}
                          height={80}
                          priority
                        />
                      </div>
                    </Link>

                    <div className="flex items-center justify-between md:order-3 md:justify-end">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() =>
                            handleUpdateQuantity(
                              item.id,
                              (item.quantity || 1) - 1
                            )
                          }
                          disabled={(item.quantity || 1) <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-medium">
                          {item.quantity || 1}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() =>
                            handleUpdateQuantity(
                              item.id,
                              (item.quantity || 1) + 1
                            )
                          }
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-end md:order-4 md:w-32">
                        <p className="text-base font-bold text-gray-900 dark:text-white">
                          {(item.price * (item.quantity || 1)).toFixed(2)} €
                        </p>
                      </div>
                    </div>

                    <div className="w-full min-w-0 flex-1 space-y-4 md:order-2 md:max-w-md">
                      <div>
                        <Link
                          href={`/products/${item.id}`}
                          className="text-base font-medium text-gray-900 hover:underline dark:text-white"
                        >
                          {item.name}
                        </Link>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          Senteur : {item.selectedScent.name}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                        >
                          <Star className="mr-1.5 h-5 w-5" />
                          Ajouter aux favoris
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-500"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <Trash2 className="mr-1.5 h-5 w-5" />
                          Supprimer
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mx-auto mt-6 max-w-4xl flex-1 space-y-6 lg:mt-0 lg:w-full">
            <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6">
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                Récapitulatif de la commande
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <dl className="flex items-center justify-between gap-4">
                    <dt className="text-base font-normal text-gray-500 dark:text-gray-400">
                      Sous-total
                    </dt>
                    <dd className="text-base font-medium text-gray-900 dark:text-white">
                      {calculateTotal().toFixed(2)} €
                    </dd>
                  </dl>
                  <dl className="flex items-center justify-between gap-4">
                    <dt className="text-base font-normal text-gray-500 dark:text-gray-400">
                      Livraison
                    </dt>
                    <dd className="text-base font-medium text-gray-900 dark:text-white">
                      Gratuite
                    </dd>
                  </dl>
                </div>

                <dl className="flex items-center justify-between gap-4 border-t border-gray-200 pt-2 dark:border-gray-700">
                  <dt className="text-base font-bold text-gray-900 dark:text-white">
                    Total
                  </dt>
                  <dd className="text-base font-bold text-gray-900 dark:text-white">
                    {calculateTotal().toFixed(2)} €
                  </dd>
                </dl>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleCheckout}
                disabled={isLoading}
              >
                {isLoading ? "Chargement..." : "Passer à la caisse"}
              </Button>

              <div className="flex items-center justify-center gap-2">
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                  ou
                </span>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary-700 underline hover:no-underline dark:text-primary-500"
                >
                  Continuer les achats
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
