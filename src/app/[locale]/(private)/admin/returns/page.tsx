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
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useState, Suspense } from "react";
import { ReturnInstructionsDialog } from "./return-instructions-dialog";
import { RefundDialog } from "./refund-dialog";
import { createReturnsColumns, getStatusLabel } from "./columns";

export default function ReturnsPage() {
  const queryClient = useQueryClient();
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] =
    useState<ReturnItemWithDetails | null>(null);

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
      toast.success("Statut du retour mis à jour avec succès");
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
      toast.success("Demande de retour supprimée avec succès");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleRefresh = async () => {
    await refetch();
    toast.success("Liste des retours rafraîchie");
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await updateStatusMutation.mutateAsync({
        id,
        data: { status },
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette demande de retour ?")) {
      return;
    }

    try {
      await deleteReturnMutation.mutateAsync(id);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
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
    </div>
  );
}
