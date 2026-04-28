"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  updateReturnStatus,
  deleteReturn,
} from "@/app/actions/returns";
import {
  fetchAdminReturns,
  type ReturnItemWithDetails,
} from "@/services/returns";
import { DataTableAdvanced } from "@/components/admin/data-table-advanced";
import {
  AdminHeader,
  AdminHeaderActions,
} from "@/components/admin/admin-header";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";
import { ReturnInstructionsDialog } from "./return-instructions-dialog";
import { RefundDialog } from "./refund-dialog";
import { createReturnsColumns, getStatusLabel } from "./columns";

export default function ReturnsPage() {
  const queryClient = useQueryClient();
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] =
    useState<ReturnItemWithDetails | null>(null);
  const [returnToDelete, setReturnToDelete] = useState<string | null>(null);

  const { data: returns, isLoading, refetch } = useQuery<
    ReturnItemWithDetails[]
  >({
    queryKey: ["admin", "returns"],
    queryFn: fetchAdminReturns,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (variables: { id: string; data: unknown }) => {
      const result = await updateReturnStatus(variables.id, variables.data);
      if (!result.success) {
        throw new Error(result.error || "Erreur lors de la mise à jour");
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "returns"] });
      toast.success("Statut du retour mis à jour");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteReturnMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteReturn(id);
      if (!result.success) {
        throw new Error(result.error || "Erreur lors de la suppression");
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "returns"] });
      toast.success("Demande de retour supprimée");
      setDeleteDialogOpen(false);
      setReturnToDelete(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
      setDeleteDialogOpen(false);
    },
  });

  const handleStatusUpdate = async (id: string, status: string) => {
    await updateStatusMutation.mutateAsync({ id, data: { status } });
  };

  const handleDelete = (id: string) => {
    setReturnToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (returnToDelete) {
      deleteReturnMutation.mutate(returnToDelete);
    }
  };

  const handleInstructions = (returnItem: ReturnItemWithDetails) => {
    setSelectedReturn(returnItem);
    setInstructionsOpen(true);
  };

  const handleRefund = (returnItem: ReturnItemWithDetails) => {
    setSelectedReturn(returnItem);
    setRefundOpen(true);
  };

  const handleExport = (data: ReturnItemWithDetails[]) => {
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

  const columns = createReturnsColumns({
    onStatusUpdate: handleStatusUpdate,
    onInstructions: handleInstructions,
    onRefund: handleRefund,
    onDelete: handleDelete,
  });

  const total = returns?.length ?? 0;

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Retours"
        description="Gérez les demandes de retour des clients"
        breadcrumbs={[
          { label: "Administration", href: "/admin/dashboard" },
          { label: "Retours" },
        ]}
        badge={{
          text: `${total} retour${total !== 1 ? "s" : ""}`,
          variant: "secondary",
        }}
        actions={
          <AdminHeaderActions
            onRefresh={() => refetch()}
            isLoading={isLoading}
          />
        }
      />

      
        <DataTableAdvanced
          columns={columns}
          data={returns || []}
          searchPlaceholder="Rechercher par produit ou client..."
          onExport={handleExport}
          isLoading={isLoading}
          emptyMessage="Aucune demande de retour"
        />

      <ReturnInstructionsDialog
        returnItem={selectedReturn}
        open={instructionsOpen}
        onOpenChange={setInstructionsOpen}
      />

      <RefundDialog
        returnItem={selectedReturn}
        open={refundOpen}
        onOpenChange={setRefundOpen}
      />

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setReturnToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Supprimer cette demande de retour ?"
        description="Cette action est irréversible. La demande de retour sera définitivement supprimée."
        isLoading={deleteReturnMutation.isPending}
      />
    </div>
  );
}
