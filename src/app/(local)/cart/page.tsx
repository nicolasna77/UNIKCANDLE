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
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart } = useCart();

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * (item.quantity || 1),
    0
  );

  // Gestion panier vide
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
              <Button className="w-full">
                <CreditCard className="mr-2 h-4 w-4" />
                Procéder au paiement
              </Button>

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
