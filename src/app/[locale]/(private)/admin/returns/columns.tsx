"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  Package,
} from "lucide-react";
import type { ReturnItemWithDetails } from "@/services/returns";

interface ColumnsActions {
  onStatusUpdate: (id: string, status: string) => void;
  onInstructions: (returnItem: ReturnItemWithDetails) => void;
  onRefund: (returnItem: ReturnItemWithDetails) => void;
  onDelete: (id: string) => void;
}

export const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    REQUESTED: "Demandé",
    APPROVED: "Approuvé",
    REJECTED: "Rejeté",
    RETURN_SHIPPING_SENT: "Étiquette envoyée",
    RETURN_IN_TRANSIT: "En transit",
    RETURN_DELIVERED: "Livré",
    PROCESSING: "En traitement",
    COMPLETED: "Terminé",
  };
  return labels[status] || status;
};

export const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    REQUESTED: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
    RETURN_SHIPPING_SENT: "bg-blue-100 text-blue-800",
    RETURN_IN_TRANSIT: "bg-purple-100 text-purple-800",
    RETURN_DELIVERED: "bg-indigo-100 text-indigo-800",
    PROCESSING: "bg-orange-100 text-orange-800",
    COMPLETED: "bg-green-100 text-green-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

export function createReturnsColumns(
  actions: ColumnsActions
): ColumnDef<ReturnItemWithDetails>[] {
  return [
    {
      accessorKey: "product",
      header: "Produit",
      cell: ({ row }) => {
        const ret = row.original;
        return (
          <div className="space-y-1">
            <div className="font-medium">{ret.orderItem.product.name}</div>
            <div className="text-sm text-muted-foreground">
              {ret.orderItem.scent.name}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "reason",
      header: "Raison",
      cell: ({ row }) => {
        const ret = row.original;
        return (
          <div className="space-y-1">
            <div className="font-medium">{ret.reason}</div>
            {ret.description && (
              <div className="text-sm text-muted-foreground">
                {ret.description}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => {
        const ret = row.original;
        return (
          <div className="space-y-1">
            <Badge className={getStatusColor(ret.status)}>
              {getStatusLabel(ret.status)}
            </Badge>
            {ret.refundStatus && (
              <Badge variant="outline" className="text-xs">
                Remboursement: {ret.refundStatus}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "customer",
      header: "Client",
      cell: ({ row }) => {
        const ret = row.original;
        return (
          <div className="space-y-1">
            <div className="font-medium">
              {ret.orderItem.order.user?.name || "N/A"}
            </div>
            <div className="text-sm text-muted-foreground">
              {ret.orderItem.order.user?.email || "N/A"}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Date de création",
      cell: ({ row }) => {
        const ret = row.original;
        return (
          <div className="text-sm">
            {format(new Date(ret.createdAt), "dd/MM/yyyy HH:mm", {
              locale: fr,
            })}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const ret = row.original;
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0 data-[state=open]:bg-muted"
                >
                  <span className="sr-only">Ouvrir le menu</span>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[180px]">
              {ret.status === "REQUESTED" && (
                <>
                  <DropdownMenuItem
                    onClick={() => actions.onStatusUpdate(ret.id, "APPROVED")}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approuver
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => actions.onStatusUpdate(ret.id, "REJECTED")}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Rejeter
                  </DropdownMenuItem>
                </>
              )}
              {ret.status === "APPROVED" && (
                <>
                  <DropdownMenuItem onClick={() => actions.onInstructions(ret)}>
                    <Package className="mr-2 h-4 w-4" />
                    Instructions de renvoi
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => actions.onRefund(ret)}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Rembourser
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => actions.onStatusUpdate(ret.id, "COMPLETED")}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    Marquer comme terminé
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem
                onClick={() => actions.onDelete(ret.id)}
                className="text-red-600"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>
        );
      },
    },
  ];
}
