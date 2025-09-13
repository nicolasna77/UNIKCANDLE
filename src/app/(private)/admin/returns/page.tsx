"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useAdminReturns,
  useUpdateReturnStatus,
  useDeleteReturn,
  useProcessRefund,
  ReturnItem,
} from "@/hooks/useReturns";
import { DataTableAdvanced } from "@/components/admin/data-table-advanced";
import {
  AdminHeader,
  AdminHeaderActions,
} from "@/components/admin/admin-header";
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
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  Package,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, Suspense } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const returnInstructionsSchema = z.object({
  returnInstructions: z.string().min(1, "Les instructions sont requises"),
  returnAddress: z.string().min(1, "L'adresse de retour est requise"),
  returnDeadline: z.string().min(1, "La date limite est requise"),
});

const refundSchema = z.object({
  refundAmount: z.number().min(0.01, "Le montant doit être supérieur à 0"),
});

export default function ReturnsPage() {
  const { data: returns, isLoading, refetch } = useAdminReturns();
  const updateStatus = useUpdateReturnStatus();
  const deleteReturn = useDeleteReturn();
  const processRefund = useProcessRefund();
  const [selectedReturn, setSelectedReturn] = useState<ReturnItem | null>(null);
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);

  const instructionsForm = useForm({
    resolver: zodResolver(returnInstructionsSchema),
    defaultValues: {
      returnInstructions: "",
      returnAddress: "",
      returnDeadline: "",
    },
  });

  const refundForm = useForm({
    resolver: zodResolver(refundSchema),
    defaultValues: {
      refundAmount: 0,
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "REQUESTED":
        return "bg-yellow-100 text-yellow-800";
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "REQUESTED":
        return "En attente";
      case "APPROVED":
        return "Approuvé";
      case "REJECTED":
        return "Rejeté";
      case "COMPLETED":
        return "Terminé";
      default:
        return status;
    }
  };

  const handleStatusUpdate = (id: string, status: string) => {
    updateStatus.mutate({ id, status });
  };

  const handleDelete = (id: string) => {
    if (
      confirm("Êtes-vous sûr de vouloir supprimer cette demande de retour ?")
    ) {
      deleteReturn.mutate(id);
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleInstructions = (returnItem: ReturnItem) => {
    setSelectedReturn(returnItem);
    instructionsForm.reset({
      returnInstructions: returnItem.returnInstructions || "",
      returnAddress: returnItem.returnAddress || "",
      returnDeadline: returnItem.returnDeadline || "",
    });
    setInstructionsOpen(true);
  };

  const handleRefund = (returnItem: ReturnItem) => {
    setSelectedReturn(returnItem);
    refundForm.reset({
      refundAmount: returnItem.orderItem.price,
    });
    setRefundOpen(true);
  };

  const onSubmitInstructions = async (values: {
    returnInstructions: string;
    returnAddress: string;
    returnDeadline: string;
  }) => {
    if (!selectedReturn) return;

    try {
      await updateStatus.mutateAsync({
        id: selectedReturn.id,
        status: selectedReturn.status,
        returnInstructions: values.returnInstructions,
        returnAddress: values.returnAddress,
        returnDeadline: values.returnDeadline,
      });
      setInstructionsOpen(false);
      setSelectedReturn(null);
    } catch (error) {
      console.error("Erreur lors de la mise à jour des instructions:", error);
    }
  };

  const onSubmitRefund = async (values: { refundAmount: number }) => {
    if (!selectedReturn) return;

    try {
      await processRefund.mutateAsync({
        id: selectedReturn.id,
        refundAmount: values.refundAmount,
      });
      setRefundOpen(false);
      setSelectedReturn(null);
    } catch (error) {
      console.error("Erreur lors du remboursement:", error);
    }
  };

  const handleExport = (data: ReturnItem[]) => {
    const csvContent = [
      ["ID", "Produit", "Raison", "Statut", "Date de création", "Client"],
      ...data.map((ret) => [
        ret.id,
        ret.orderItem.product.name,
        ret.reason,
        getStatusLabel(ret.status),
        format(new Date(ret.createdAt), "dd/MM/yyyy", { locale: fr }),
        ret.orderItem.order.user?.name || "N/A",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `retours-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns: ColumnDef<ReturnItem>[] = [
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
      header: "Actions",
      cell: ({ row }) => {
        const ret = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {ret.status === "REQUESTED" && (
                <>
                  <DropdownMenuItem
                    onClick={() => handleStatusUpdate(ret.id, "APPROVED")}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approuver
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleStatusUpdate(ret.id, "REJECTED")}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Rejeter
                  </DropdownMenuItem>
                </>
              )}
              {ret.status === "APPROVED" && (
                <>
                  <DropdownMenuItem onClick={() => handleInstructions(ret)}>
                    <Package className="mr-2 h-4 w-4" />
                    Instructions de renvoi
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleRefund(ret)}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Rembourser
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleStatusUpdate(ret.id, "COMPLETED")}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    Marquer comme terminé
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem
                onClick={() => handleDelete(ret.id)}
                className="text-red-600"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Gestion des retours"
        description="Gérez les demandes de retour des clients"
        breadcrumbs={[
          { label: "Administration", href: "/admin" },
          { label: "Retours" },
        ]}
        badge={{
          text: `${returns?.length || 0} retour${(returns?.length || 0) > 1 ? "s" : ""}`,
          variant: "secondary",
        }}
        actions={
          <AdminHeaderActions onRefresh={handleRefresh} isLoading={isLoading} />
        }
      />

      <Suspense fallback={<div>Chargement...</div>}>
        <DataTableAdvanced
          columns={columns}
          data={returns || []}
          searchPlaceholder="Rechercher par produit ou client..."
          onExport={handleExport}
          isLoading={isLoading}
          emptyMessage="Aucune demande de retour trouvée"
        />
      </Suspense>

      {/* Dialog Instructions de renvoi */}
      <Dialog open={instructionsOpen} onOpenChange={setInstructionsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Instructions de renvoi</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={instructionsForm.handleSubmit(onSubmitInstructions)}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="returnInstructions">
                Instructions pour le client
              </Label>
              <Textarea
                id="returnInstructions"
                placeholder="Instructions détaillées pour le renvoi..."
                rows={4}
                {...instructionsForm.register("returnInstructions")}
              />
            </div>
            <div>
              <Label htmlFor="returnAddress">Adresse de retour</Label>
              <Textarea
                id="returnAddress"
                placeholder="Adresse complète pour le renvoi..."
                rows={3}
                {...instructionsForm.register("returnAddress")}
              />
            </div>
            <div>
              <Label htmlFor="returnDeadline">Date limite de renvoi</Label>
              <Input
                id="returnDeadline"
                type="date"
                {...instructionsForm.register("returnDeadline")}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setInstructionsOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit">Envoyer les instructions</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Remboursement */}
      <Dialog open={refundOpen} onOpenChange={setRefundOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Remboursement Stripe</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={refundForm.handleSubmit(onSubmitRefund)}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="refundAmount">Montant du remboursement (€)</Label>
              <Input
                id="refundAmount"
                type="number"
                step="0.01"
                min="0"
                {...refundForm.register("refundAmount", {
                  valueAsNumber: true,
                })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setRefundOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={processRefund.isPending}>
                {processRefund.isPending
                  ? "Traitement..."
                  : "Effectuer le remboursement"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
