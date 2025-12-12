"use client";

import { JSX, useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  FileText,
  RefreshCw,
  XCircle,
  Calendar,
  MapPin,
  Package,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { Link } from "@/i18n/routing";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type {
  Order,
  OrderItem,
  Product,
  Scent,
  Image as PrismaImage,
  Address,
  QRCode,
} from "@prisma/client";
import ReturnRequestDialog from "./return-request-dialog";
import { CreditCard } from "lucide-react";
import { useCart } from "@/context/CartContext";

const OrderItemCard = ({
  order,
  getStatusDetails,
}: {
  order: Order & {
    items: (OrderItem & {
      product: Product & {
        images: PrismaImage[];
      };
      scent: Scent;
      qrCode: QRCode | null;
    })[];
    shippingAddress: Address;
  };
  getStatusDetails: (status: string) => {
    label: string;
    color: string;
    bgColor: string;
    icon: JSX.Element;
    badge: JSX.Element;
  };
}) => {
  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const { addToCart } = useCart();

  const statusDetails = getStatusDetails(order.status);
  const formattedDate = new Date(order.createdAt).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Fonction pour télécharger la facture
  const handleDownloadInvoice = async () => {
    setIsDownloadingInvoice(true);
    try {
      const response = await fetch(`/api/orders/${order.id}/invoice`);

      if (!response.ok) {
        throw new Error("Erreur lors du téléchargement de la facture");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `facture-${order.id.slice(0, 8)}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Facture téléchargée avec succès", {
        description: "Ouvrez le fichier et utilisez Imprimer pour l'enregistrer en PDF",
      });
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Impossible de télécharger la facture");
    } finally {
      setIsDownloadingInvoice(false);
    }
  };

  // Fonction pour recommander (ajouter les produits au panier)
  const handleReorder = async () => {
    setIsReordering(true);
    try {
      // Récupérer les détails complets de chaque produit et les ajouter au panier
      for (const item of order.items) {
        // Récupérer les détails complets du produit
        const productResponse = await fetch(`/api/products/${item.productId}`);
        if (!productResponse.ok) {
          throw new Error(`Erreur lors de la récupération du produit ${item.product.name}`);
        }

        const productData = await productResponse.json();

        // Créer l'objet CartItem avec toutes les données nécessaires
        const cartItem = {
          id: productData.id,
          name: productData.name,
          imageUrl: productData.images[0]?.url || "/placeholder-product.jpg",
          price: item.price,
          selectedScent: item.scent,
          category: productData.category,
          quantity: item.quantity,
          description: productData.description || "",
          subTitle: productData.subTitle || "",
          audioUrl: item.audioUrl ?? undefined,
          textMessage: item.textMessage ?? undefined,
          createdAt: new Date(productData.createdAt),
          updatedAt: new Date(productData.updatedAt),
          deletedAt: productData.deletedAt ? new Date(productData.deletedAt) : null,
        };

        // Ajouter chaque produit individuellement au panier via le CartContext
        for (let i = 0; i < item.quantity; i++) {
          addToCart(cartItem);
        }
      }

      toast.success(
        `${order.items.length} produit(s) ajouté(s) au panier avec succès`,
        {
          action: {
            label: "Voir le panier",
            onClick: () => (window.location.href = "/cart"),
          },
        }
      );
    } catch (error) {
      console.error("Erreur:", error);
      const errorMessage = error instanceof Error ? error.message : "Impossible d'ajouter les produits au panier";
      toast.error(errorMessage);
    } finally {
      setIsReordering(false);
    }
  };

  // Fonction pour annuler la commande
  const handleCancelOrder = async () => {
    setIsCancelling(true);
    try {
      const response = await fetch(`/api/orders/${order.id}/cancel`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erreur lors de l'annulation");
      }

      toast.success("Commande annulée avec succès");

      // Recharger la page pour afficher le nouveau statut
      window.location.reload();
    } catch (error) {
      console.error("Erreur:", error);
      const errorMessage = error instanceof Error ? error.message : "Impossible d'annuler la commande";
      toast.error(errorMessage);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-md border border-border/50 hover:border-border">
      <CardHeader className="relative bg-gradient-to-br from-muted/30 via-muted/10 to-transparent p-5 md:p-7 border-b border-border/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-xl font-bold tracking-tight text-foreground">
                Commande #{order.id.slice(0, 8)}
              </h3>
              {statusDetails.badge}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
              <Calendar className="h-4 w-4 text-primary/60" />
              <span>{formattedDate}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 hover:bg-muted/50 transition-colors"
              onClick={handleDownloadInvoice}
              disabled={isDownloadingInvoice}
            >
              {isDownloadingInvoice ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              <span className="font-medium">Facture</span>
            </Button>
            <Button
              size="sm"
              variant="default"
              className="gap-2 shadow-sm hover:shadow transition-shadow"
              onClick={handleReorder}
              disabled={isReordering}
            >
              {isReordering ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="font-medium">Recommander</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="p-5 md:p-7 space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Package className="h-4 w-4 text-primary" />
            </div>
            <h4 className="font-bold text-base tracking-tight">
              Produits ({order.items.length})
            </h4>
          </div>

          <div className="space-y-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="group/item flex gap-4 p-4 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm hover:bg-muted/30 hover:border-border transition-all duration-200 hover:shadow-sm"
              >
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-border/50 bg-muted/50 shadow-sm">
                  <Image
                    src={
                      item.product?.images?.[0]?.url ||
                      "/placeholder-product.jpg"
                    }
                    alt={item.product?.name || "Produit"}
                    fill
                    sizes="96px"
                    className="object-cover transition-transform duration-300 group-hover/item:scale-105"
                  />
                </div>
                <div className="flex-1 min-w-0 space-y-3">
                  <div>
                    <h5 className="font-bold text-base truncate mb-2">
                      {item.product?.name}
                    </h5>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3.5 w-3.5 rounded-full ring-2 ring-background shadow-sm"
                        style={{
                          backgroundColor: item.scent?.color || "#CBD5E1",
                        }}
                      />
                      <span className="text-sm font-medium text-muted-foreground">
                        {item.scent?.name}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <span className="font-bold text-foreground">
                      {item.quantity} × {item.price.toFixed(2)}€
                    </span>
                    <span className="text-muted-foreground font-medium">
                      Total: <span className="text-foreground font-bold">{(item.quantity * item.price).toFixed(2)}€</span>
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {item.qrCode && (
                      <Link
                        href={`/ar/${item.qrCode.code}`}
                        className={buttonVariants({
                          variant: "outline",
                          size: "sm",
                          className: "font-medium hover:bg-muted/50",
                        })}
                        prefetch
                      >
                        Voir en AR
                      </Link>
                    )}
                    <ReturnRequestDialog
                      orderItem={{
                        id: item.id,
                        product: { name: item.product.name },
                        scent: { name: item.scent.name },
                      }}
                      order={{
                        id: order.id,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}

            <Separator className="my-6" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <h4 className="font-bold text-sm tracking-tight">
                    Adresse de livraison
                  </h4>
                </div>
                <div className="rounded-xl bg-muted/30 border border-border/50 p-4 space-y-1.5 hover:bg-muted/40 transition-colors">
                  <p className="font-bold text-sm text-foreground">
                    {order.shippingAddress.street}
                  </p>
                  <p className="text-sm font-medium text-muted-foreground">
                    {order.shippingAddress.zipCode} {order.shippingAddress.city}
                  </p>
                  <p className="text-sm font-medium text-muted-foreground">
                    {order.shippingAddress.country}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                    {statusDetails.icon}
                  </div>
                  <h4 className="font-bold text-sm tracking-tight">
                    Statut de la commande
                  </h4>
                </div>
                <div className="rounded-xl bg-muted/30 border border-border/50 p-4 space-y-2.5 hover:bg-muted/40 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-sm ${statusDetails.color}`}>
                      {statusDetails.label}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                    {order.status === "DELIVERED"
                      ? "Votre commande a été livrée avec succès."
                      : order.status === "CANCELLED"
                        ? "Cette commande a été annulée."
                        : order.status === "SHIPPED"
                          ? "Votre commande est en cours de livraison."
                          : "Votre commande est en cours de préparation."}
                  </p>

                  {/* Affichage du statut de remboursement */}
                  {order.status === "CANCELLED" && order.stripeRefundId && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <div className="flex items-start gap-2.5">
                        <CreditCard className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-green-600">
                            Remboursement effectué
                          </p>
                          <p className="text-xs font-medium text-muted-foreground">
                            Montant : {order.refundAmount?.toFixed(2)}€
                          </p>
                          {order.refundedAt && (
                            <p className="text-xs font-medium text-muted-foreground">
                              Le{" "}
                              {new Date(order.refundedAt).toLocaleDateString(
                                "fr-FR",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Message si annulé mais pas encore remboursé */}
                  {order.status === "CANCELLED" && !order.stripeRefundId && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <div className="flex items-start gap-2.5">
                        <CreditCard className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-amber-600">
                            Remboursement en cours
                          </p>
                          <p className="text-xs font-medium text-muted-foreground">
                            Votre remboursement sera traité sous 5 à 7 jours ouvrés
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <Separator className="opacity-50" />

      <CardFooter className="flex flex-col sm:flex-row items-center justify-between p-5 md:p-7 gap-4 bg-gradient-to-br from-muted/20 via-muted/10 to-transparent">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {order.status === "PROCESSING" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20 hover:border-destructive/30 gap-2 font-medium transition-all"
                  disabled={isCancelling}
                >
                  {isCancelling ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  <span>Annuler la commande</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="sm:max-w-md">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-xl font-bold">
                    Annuler la commande
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-base font-medium leading-relaxed">
                    Êtes-vous sûr de vouloir annuler cette commande ? Cette
                    action est irréversible et vous serez remboursé sous 5 à 7
                    jours ouvrés.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="font-medium">
                    Non, conserver
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancelOrder}
                    className="bg-destructive hover:bg-destructive/90 font-bold"
                  >
                    Oui, annuler
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
          <span className="text-sm font-bold text-muted-foreground tracking-tight">
            Montant total
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-foreground tracking-tight">
              {order.total.toFixed(2)}
            </span>
            <span className="text-lg font-bold text-muted-foreground">
              €
            </span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};
export default OrderItemCard;
