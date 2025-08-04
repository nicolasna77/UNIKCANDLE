"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";

interface DebugReturnInfoProps {
  order: {
    id: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  orderItem: {
    id: string;
    returns?: Array<{
      status: string;
    }>;
  };
}

export default function DebugReturnInfo({
  order,
  orderItem,
}: DebugReturnInfoProps) {
  // Vérifier les conditions de retour
  const isDelivered = order.status === "DELIVERED";

  const hasActiveReturn = orderItem.returns?.some(
    (ret) =>
      ret.status === "REQUESTED" ||
      ret.status === "APPROVED" ||
      ret.status === "PROCESSING"
  );

  const deliveryDate = new Date(order.updatedAt);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const isWithinTimeLimit = deliveryDate > thirtyDaysAgo;

  const remainingDays = () => {
    const thirtyDaysLater = new Date(deliveryDate);
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
    const today = new Date();
    const diffTime = thirtyDaysLater.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const canReturn = isDelivered && !hasActiveReturn && isWithinTimeLimit;

  return (
    <Card className="border-dashed border-blue-200 bg-blue-50/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-700">
          <AlertCircle className="h-5 w-5" />
          Debug - Informations de retour
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Statut de la commande */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Statut de la commande</h4>
            <div className="flex items-center gap-2">
              {isDelivered ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <Badge variant={isDelivered ? "default" : "destructive"}>
                {order.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {isDelivered
                ? "✅ Commande livrée - OK pour retour"
                : "❌ Commande non livrée - Pas de retour possible"}
            </p>
          </div>

          {/* Délai de retour */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Délai de retour</h4>
            <div className="flex items-center gap-2">
              {isWithinTimeLimit ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">
                {remainingDays()} jour(s) restant(s)
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Livré le: {new Date(order.updatedAt).toLocaleDateString("fr-FR")}
            </p>
          </div>

          {/* Retours existants */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Retours existants</h4>
            <div className="flex items-center gap-2">
              {!hasActiveReturn ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">
                {orderItem.returns?.length || 0} retour(s)
              </span>
            </div>
            {orderItem.returns?.map((ret, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {ret.status}
              </Badge>
            ))}
          </div>

          {/* Résultat final */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Peut retourner?</h4>
            <div className="flex items-center gap-2">
              {canReturn ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <Badge variant={canReturn ? "default" : "destructive"}>
                {canReturn ? "OUI" : "NON"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Informations techniques */}
        <div className="pt-4 border-t space-y-2">
          <h4 className="font-medium text-sm">Informations techniques</h4>
          <div className="text-xs space-y-1 text-muted-foreground">
            <p>• Order ID: {order.id}</p>
            <p>• Order Item ID: {orderItem.id}</p>
            <p>• Status: {order.status}</p>
            <p>• Created: {order.createdAt}</p>
            <p>• Updated: {order.updatedAt}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
