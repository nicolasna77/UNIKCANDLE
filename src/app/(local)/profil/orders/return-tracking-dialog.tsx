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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Truck,
  Package,
  CheckCircle,
  Clock,
  CreditCard,
  MapPin,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ReturnStatus } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { fetchReturns, type ReturnItemWithDetails } from "@/services/returns";

interface ReturnTrackingDialogProps {
  orderItemId: string;
}

export default function ReturnTrackingDialog({
  orderItemId,
}: ReturnTrackingDialogProps) {
  const [open, setOpen] = useState(false);

  const { data: returns, isLoading } = useQuery<ReturnItemWithDetails[]>({
    queryKey: ["returns", orderItemId],
    queryFn: () => fetchReturns(orderItemId),
    enabled: !!orderItemId,
  });

  const returnItem = returns?.find((r) => r.orderItemId === orderItemId);

  if (!returnItem) return null;

  const getStatusInfo = (status: ReturnStatus) => {
    switch (status) {
      case "REQUESTED":
        return {
          label: "Demande reçue",
          icon: <Clock className="h-4 w-4" />,
          color: "bg-yellow-100 text-yellow-800",
          description:
            "Votre demande de retour a été reçue et est en cours d'examen.",
        };
      case "APPROVED":
        return {
          label: "Retour approuvé",
          icon: <CheckCircle className="h-4 w-4" />,
          color: "bg-green-100 text-green-800",
          description:
            "Votre retour a été approuvé. Vous allez recevoir les instructions d'expédition.",
        };
      case "RETURN_SHIPPING_SENT":
        return {
          label: "Étiquette envoyée",
          icon: <Package className="h-4 w-4" />,
          color: "bg-blue-100 text-blue-800",
          description:
            "L'étiquette de retour vous a été envoyée. Emballez votre article et expédiez-le.",
        };
      case "RETURN_IN_TRANSIT":
        return {
          label: "Colis en transit",
          icon: <Truck className="h-4 w-4" />,
          color: "bg-purple-100 text-purple-800",
          description:
            "Votre colis retour est en cours d'acheminement vers nos entrepôts.",
        };
      case "RETURN_DELIVERED":
        return {
          label: "Colis reçu",
          icon: <MapPin className="h-4 w-4" />,
          color: "bg-indigo-100 text-indigo-800",
          description:
            "Nous avons reçu votre retour et procédons à sa vérification.",
        };
      case "PROCESSING":
        return {
          label: "Traitement en cours",
          icon: <Clock className="h-4 w-4" />,
          color: "bg-orange-100 text-orange-800",
          description:
            "Votre retour est en cours de traitement. Le remboursement sera effectué sous peu.",
        };
      case "COMPLETED":
        return {
          label: "Remboursé",
          icon: <CreditCard className="h-4 w-4" />,
          color: "bg-green-100 text-green-800",
          description:
            "Le remboursement a été effectué sur votre moyen de paiement original.",
        };
      default:
        return {
          label: status,
          icon: <Clock className="h-4 w-4" />,
          color: "bg-gray-100 text-gray-800",
          description: "Statut inconnu",
        };
    }
  };

  const statusInfo = getStatusInfo(returnItem.status);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Truck className="h-4 w-4" />
          Suivre le retour
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Suivi du retour
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Statut actuel */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-full bg-primary/10">
                    {statusInfo.icon}
                  </div>
                  <div>
                    <Badge className={statusInfo.color}>
                      {statusInfo.label}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      {statusInfo.description}
                    </p>
                  </div>
                </div>

                {/* Instructions de renvoi */}
                {returnItem.returnInstructions && (
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-medium mb-2">Instructions de renvoi</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Instructions
                        </p>
                        <p className="text-sm">
                          {returnItem.returnInstructions}
                        </p>
                      </div>
                      {returnItem.returnAddress && (
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Adresse de retour
                          </p>
                          <p className="text-sm">{returnItem.returnAddress}</p>
                        </div>
                      )}
                      {returnItem.returnDeadline && (
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Date limite
                          </p>
                          <p className="text-sm">
                            {new Date(returnItem.returnDeadline).toLocaleDateString(
                              "fr-FR",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Informations de remboursement */}
                {returnItem.refundAmount && (
                  <div className="border-t pt-4 mt-4">
                    <h4 className="font-medium mb-2">Remboursement</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Montant</p>
                        <p className="text-lg font-semibold text-green-600">
                          {returnItem.refundAmount.toFixed(2)}€
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Statut</p>
                        <Badge
                          variant={
                            returnItem.refundStatus === "COMPLETED"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {returnItem.refundStatus === "COMPLETED"
                            ? "Effectué"
                            : returnItem.refundStatus === "PROCESSING"
                              ? "En cours"
                              : returnItem.refundStatus === "FAILED"
                                ? "Échec"
                                : "En attente"}
                        </Badge>
                      </div>
                    </div>

                    {returnItem.refundedAt && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Remboursé le{" "}
                        {format(new Date(returnItem.refundedAt), "PPP", {
                          locale: fr,
                        })}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Timeline des événements */}
            <Card>
              <CardContent className="p-6">
                <h4 className="font-medium mb-4">Historique</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <div>
                      <p className="text-sm">Demande de retour créée</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(returnItem.createdAt), "PPP à HH:mm", {
                          locale: fr,
                        })}
                      </p>
                    </div>
                  </div>

                  {returnItem.updatedAt &&
                    returnItem.updatedAt !== returnItem.createdAt && (
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="text-sm">Demande mise à jour</p>
                          <p className="text-xs text-muted-foreground">
                            {format(
                              new Date(returnItem.updatedAt),
                              "PPP à HH:mm",
                              { locale: fr }
                            )}
                          </p>
                        </div>
                      </div>
                    )}

                  {returnItem.refundedAt && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
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

            {/* Note admin si présente */}
            {returnItem.adminNote && (
              <Card>
                <CardContent className="p-6">
                  <h4 className="font-medium mb-2">Note du service client</h4>
                  <p className="text-sm text-muted-foreground">
                    {returnItem.adminNote}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
