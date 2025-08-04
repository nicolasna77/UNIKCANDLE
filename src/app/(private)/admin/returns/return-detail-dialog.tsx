"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import type { ReturnItem } from "@/hooks/useReturns";
import Image from "next/image";

interface ReturnDetailDialogProps {
  returnItem: ReturnItem;
}

export default function ReturnDetailDialog({
  returnItem,
}: ReturnDetailDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Eye className="h-4 w-4" />
          Détails
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Détails de la demande de retour</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informations du produit */}
          <div>
            <h3 className="font-semibold mb-3">Produit</h3>
            <div className="flex gap-3 p-3 border rounded-lg">
              {returnItem.orderItem.product.images?.[0] && (
                <Image
                  src={returnItem.orderItem.product.images[0].url}
                  alt={returnItem.orderItem.product.name}
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-md object-cover"
                />
              )}
              <div>
                <p className="font-medium">
                  {returnItem.orderItem.product.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Parfum: {returnItem.orderItem.scent.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Quantité: {returnItem.orderItem.quantity}
                </p>
                <p className="text-sm font-medium">
                  Prix: {returnItem.orderItem.price.toFixed(2)}€
                </p>
              </div>
            </div>
          </div>

          {/* Raison du retour */}
          <div>
            <h3 className="font-semibold mb-3">Raison du retour</h3>
            <div className="p-3 border rounded-lg">
              <p className="font-medium capitalize">
                {returnItem.reason.replace("_", " ")}
              </p>
              {returnItem.description && (
                <p className="text-sm text-muted-foreground mt-2">
                  {returnItem.description}
                </p>
              )}
            </div>
          </div>

          {/* Note admin */}
          {returnItem.adminNote && (
            <div>
              <h3 className="font-semibold mb-3">
                Note de l&apos;administrateur
              </h3>
              <div className="p-3 border rounded-lg bg-muted/30">
                <p className="text-sm">{returnItem.adminNote}</p>
              </div>
            </div>
          )}

          {/* Montant du remboursement */}
          {returnItem.refundAmount && (
            <div>
              <h3 className="font-semibold mb-3">Remboursement</h3>
              <div className="p-3 border rounded-lg">
                <p className="text-lg font-medium text-green-600">
                  {returnItem.refundAmount.toFixed(2)}€
                </p>
              </div>
            </div>
          )}

          {/* Statut et dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-3">Statut</h3>
              <Badge className="text-sm">{returnItem.status}</Badge>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Dates importantes</h3>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Demandé le:</span>{" "}
                  {new Date(returnItem.createdAt).toLocaleDateString("fr-FR")}
                </p>
                {returnItem.updatedAt &&
                  returnItem.updatedAt !== returnItem.createdAt && (
                    <p>
                      <span className="font-medium">Traité le:</span>{" "}
                      {new Date(returnItem.updatedAt).toLocaleDateString(
                        "fr-FR"
                      )}
                    </p>
                  )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
