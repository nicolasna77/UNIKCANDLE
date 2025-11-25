"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Truck,
  CreditCard,
  Package,
  ExternalLink,
  Calendar,
  User,
  MapPin,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateReturnStatus, processRefund } from "@/app/actions/returns";
import { toast } from "sonner";
import type { ReturnItemWithDetails } from "@/services/returns";

interface TrackingDialogProps {
  returnItem: ReturnItemWithDetails;
  trigger?: React.ReactNode;
}

export default function TrackingDialog({
  returnItem,
  trigger,
}: TrackingDialogProps) {
  const [open, setOpen] = useState(false);
  const [trackingData, setTrackingData] = useState({
    trackingNumber: returnItem.trackingNumber || "",
    carrier: returnItem.carrier || "",
    trackingUrl: returnItem.trackingUrl || "",
  });
  const [refundAmount, setRefundAmount] = useState(
    returnItem.refundAmount || returnItem.orderItem.price
  );

  const queryClient = useQueryClient();

  const updateTrackingMutation = useMutation({
    mutationFn: async (data: unknown) => {
      const result = await updateReturnStatus(returnItem.id, data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "returns"] });
      toast.success("Suivi mis à jour");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la mise à jour du suivi");
    },
  });

  const processRefundMutation = useMutation({
    mutationFn: async (data: { refundAmount: number }) => {
      const result = await processRefund(returnItem.id, data.refundAmount);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "returns"] });
      toast.success("Remboursement traité");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors du remboursement");
    },
  });

  const handleUpdateTracking = async () => {
    if (!trackingData.trackingNumber) return;

    await updateTrackingMutation.mutateAsync({
      data: {
        trackingNumber: trackingData.trackingNumber,
        carrier: trackingData.carrier,
        trackingUrl: trackingData.trackingUrl,
        status: "RETURN_SHIPPING_SENT",
      },
    });
  };

  const handleMarkInTransit = async () => {
    await updateTrackingMutation.mutateAsync({
      data: {
        status: "RETURN_IN_TRANSIT",
      },
    });
  };

  const handleMarkDelivered = async () => {
    await updateTrackingMutation.mutateAsync({
      data: {
        status: "RETURN_DELIVERED",
      },
    });
  };

  const handleProcessRefund = async () => {
    await processRefundMutation.mutateAsync({
      refundAmount,
    });
  };

  const canRefund =
    ["RETURN_DELIVERED", "PROCESSING"].includes(returnItem.status) &&
    returnItem.refundStatus === "PENDING";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Truck className="h-4 w-4" />
            Gérer
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Gestion du retour #{returnItem.id.slice(-8)}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informations du retour */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Informations client
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Client</Label>
                <p className="text-sm">
                  {returnItem.orderItem.order.user?.name || "N/A"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {returnItem.orderItem.order.user?.email || "N/A"}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium">Produit</Label>
                <p className="text-sm">{returnItem.orderItem.product.name}</p>
                <p className="text-sm text-muted-foreground">
                  {returnItem.orderItem.scent.name} -{" "}
                  {returnItem.orderItem.quantity} ×{" "}
                  {returnItem.orderItem.price.toFixed(2)}€
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium">Raison du retour</Label>
                <p className="text-sm">{returnItem.reason}</p>
                {returnItem.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {returnItem.description}
                  </p>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium">Statut actuel</Label>
                <div className="mt-1">
                  <Badge>{returnItem.status}</Badge>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Créé le</Label>
                <p className="text-sm">
                  {format(new Date(returnItem.createdAt), "PPP à HH:mm", {
                    locale: fr,
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-6">
            <Tabs defaultValue="tracking" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="tracking">Suivi</TabsTrigger>
                <TabsTrigger value="refund">Remboursement</TabsTrigger>
              </TabsList>

              <TabsContent value="tracking" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Informations de suivi
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="trackingNumber">Numéro de suivi</Label>
                        <Input
                          id="trackingNumber"
                          value={trackingData.trackingNumber}
                          onChange={(e) =>
                            setTrackingData((prev) => ({
                              ...prev,
                              trackingNumber: e.target.value,
                            }))
                          }
                          placeholder="Ex: 1Z123456789"
                        />
                      </div>

                      <div>
                        <Label htmlFor="carrier">Transporteur</Label>
                        <Input
                          id="carrier"
                          value={trackingData.carrier}
                          onChange={(e) =>
                            setTrackingData((prev) => ({
                              ...prev,
                              carrier: e.target.value,
                            }))
                          }
                          placeholder="Ex: Colissimo, UPS, DHL"
                        />
                      </div>

                      <div>
                        <Label htmlFor="trackingUrl">URL de suivi</Label>
                        <Input
                          id="trackingUrl"
                          value={trackingData.trackingUrl}
                          onChange={(e) =>
                            setTrackingData((prev) => ({
                              ...prev,
                              trackingUrl: e.target.value,
                            }))
                          }
                          placeholder="https://..."
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        onClick={handleUpdateTracking}
                        disabled={
                          !trackingData.trackingNumber ||
                          updateTrackingMutation.isPending
                        }
                      >
                        Envoyer étiquette retour
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleMarkInTransit}
                        disabled={updateTrackingMutation.isPending}
                      >
                        <MapPin className="h-4 w-4 mr-1" />
                        Marquer en transit
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleMarkDelivered}
                        disabled={updateTrackingMutation.isPending}
                      >
                        <Package className="h-4 w-4 mr-1" />
                        Marquer livré
                      </Button>
                    </div>

                    {/* Informations de suivi actuelles */}
                    {returnItem.trackingNumber && (
                      <div className="border-t pt-4 mt-4">
                        <h5 className="font-medium mb-2">Suivi actuel</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Numéro:</span>
                            <span className="font-mono">
                              {returnItem.trackingNumber}
                            </span>
                          </div>
                          {returnItem.carrier && (
                            <div className="flex justify-between">
                              <span>Transporteur:</span>
                              <span>{returnItem.carrier}</span>
                            </div>
                          )}
                          {returnItem.trackingUrl && (
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0 h-auto"
                              onClick={() =>
                                returnItem.trackingUrl && window.open(returnItem.trackingUrl, "_blank")
                              }
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Suivre en ligne
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="refund" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Remboursement Stripe
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="refundAmount">
                        Montant du remboursement
                      </Label>
                      <Input
                        id="refundAmount"
                        type="number"
                        step="0.01"
                        value={refundAmount}
                        onChange={(e) =>
                          setRefundAmount(parseFloat(e.target.value))
                        }
                        disabled={!canRefund}
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Montant original:{" "}
                        {returnItem.orderItem.price.toFixed(2)}€
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          returnItem.refundStatus === "COMPLETED"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {returnItem.refundStatus === "COMPLETED"
                          ? "Remboursé"
                          : returnItem.refundStatus === "PROCESSING"
                            ? "En cours"
                            : returnItem.refundStatus === "FAILED"
                              ? "Échec"
                              : "En attente"}
                      </Badge>
                      {returnItem.refundedAt && (
                        <span className="text-sm text-muted-foreground">
                          le{" "}
                          {format(new Date(returnItem.refundedAt), "PPP", {
                            locale: fr,
                          })}
                        </span>
                      )}
                    </div>

                    {canRefund && (
                      <Button
                        onClick={handleProcessRefund}
                        disabled={processRefundMutation.isPending}
                        className="w-full"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        {processRefundMutation.isPending
                          ? "Traitement..."
                          : "Traiter le remboursement"}
                      </Button>
                    )}

                    {returnItem.stripeRefundId && (
                      <div className="border-t pt-4 mt-4">
                        <h5 className="font-medium mb-2">
                          Informations Stripe
                        </h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>ID Refund:</span>
                            <span className="font-mono">
                              {returnItem.stripeRefundId}
                            </span>
                          </div>
                          {returnItem.refundAmount && (
                            <div className="flex justify-between">
                              <span>Montant:</span>
                              <span>{returnItem.refundAmount.toFixed(2)}€</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Timeline */}
        {(returnItem.shippedAt ||
          returnItem.deliveredAt ||
          returnItem.refundedAt) && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Historique
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div>
                    <p className="text-sm">Demande créée</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(returnItem.createdAt), "PPP à HH:mm", {
                        locale: fr,
                      })}
                    </p>
                  </div>
                </div>

                {returnItem.shippedAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="text-sm">Étiquette envoyée</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(returnItem.shippedAt), "PPP à HH:mm", {
                          locale: fr,
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {returnItem.deliveredAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm">Colis reçu</p>
                      <p className="text-xs text-muted-foreground">
                        {format(
                          new Date(returnItem.deliveredAt),
                          "PPP à HH:mm",
                          { locale: fr }
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {returnItem.refundedAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <div>
                      <p className="text-sm">Remboursement effectué</p>
                      <p className="text-xs text-muted-foreground">
                        {format(
                          new Date(returnItem.refundedAt),
                          "PPP à HH:mm",
                          { locale: fr }
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
}
