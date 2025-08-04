import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Types simplifiés pour les retours
export interface ReturnItem {
  id: string;
  orderItemId: string;
  reason: string;
  description?: string;
  status:
    | "REQUESTED"
    | "APPROVED"
    | "REJECTED"
    | "COMPLETED"
    | "RETURN_SHIPPING_SENT"
    | "RETURN_IN_TRANSIT"
    | "RETURN_DELIVERED"
    | "PROCESSING";
  createdAt: string;
  updatedAt: string;
  adminNote?: string;
  refundAmount?: number;

  // Remboursement Stripe
  stripeRefundId?: string;
  refundedAt?: string;
  refundStatus: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

  // Instructions de renvoi
  returnInstructions?: string;
  returnAddress?: string;
  returnDeadline?: string;

  // Informations de suivi
  trackingNumber?: string;
  carrier?: string;
  trackingUrl?: string;
  shippedAt?: string;
  deliveredAt?: string;

  orderItem: {
    id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      name: string;
      images: Array<{ url: string }>;
    };
    scent: {
      id: string;
      name: string;
    };
    order: {
      id: string;
      createdAt: string;
      status: string;
      user?: {
        name: string;
        email: string;
      };
    };
  };
}

export interface CreateReturnData {
  orderItemId: string;
  reason: string;
  description?: string;
}

// Hook pour récupérer les retours d'un utilisateur
export function useReturns(orderItemId?: string) {
  return useQuery<ReturnItem[]>({
    queryKey: ["returns", orderItemId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (orderItemId) {
        params.append("orderItemId", orderItemId);
      }

      const response = await fetch(`/api/returns?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des retours");
      }
      return response.json();
    },
  });
}

// Hook pour créer une demande de retour
export function useCreateReturn() {
  const queryClient = useQueryClient();

  return useMutation<ReturnItem, Error, CreateReturnData>({
    mutationFn: async (data) => {
      const response = await fetch("/api/returns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || "Erreur lors de la création de la demande de retour"
        );
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["returns"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Demande de retour créée avec succès");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

// Hook pour récupérer toutes les demandes de retour (admin)
export function useAdminReturns() {
  return useQuery<ReturnItem[]>({
    queryKey: ["admin", "returns"],
    queryFn: async () => {
      const response = await fetch("/api/admin/returns");
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des retours");
      }
      return response.json();
    },
  });
}

// Hook pour mettre à jour le statut d'un retour (admin)
export function useUpdateReturnStatus() {
  const queryClient = useQueryClient();

  return useMutation<
    ReturnItem,
    Error,
    {
      id: string;
      status: string;
      adminNote?: string;
      refundAmount?: number;
      returnInstructions?: string;
      returnAddress?: string;
      returnDeadline?: string;
    }
  >({
    mutationFn: async ({
      id,
      status,
      adminNote,
      refundAmount,
      returnInstructions,
      returnAddress,
      returnDeadline,
    }) => {
      const response = await fetch(`/api/admin/returns/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          adminNote,
          refundAmount,
          returnInstructions,
          returnAddress,
          returnDeadline,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || "Erreur lors de la mise à jour du retour"
        );
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "returns"] });
      queryClient.invalidateQueries({ queryKey: ["returns"] });
      toast.success("Statut du retour mis à jour avec succès");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

// Hook pour mettre à jour le suivi d'un retour (admin)
export function useUpdateReturnTracking() {
  const queryClient = useQueryClient();

  return useMutation<
    ReturnItem,
    Error,
    {
      id: string;
      status?: string;
      trackingNumber?: string;
      carrier?: string;
      trackingUrl?: string;
    }
  >({
    mutationFn: async ({
      id,
      status,
      trackingNumber,
      carrier,
      trackingUrl,
    }) => {
      const response = await fetch(`/api/admin/returns/${id}/tracking`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          trackingNumber,
          carrier,
          trackingUrl,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || "Erreur lors de la mise à jour du suivi"
        );
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "returns"] });
      queryClient.invalidateQueries({ queryKey: ["returns"] });
      toast.success("Informations de suivi mises à jour avec succès");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

// Hook pour supprimer une demande de retour (admin)
export function useDeleteReturn() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const response = await fetch(`/api/admin/returns/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || "Erreur lors de la suppression du retour"
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "returns"] });
      queryClient.invalidateQueries({ queryKey: ["returns"] });
      toast.success("Demande de retour supprimée avec succès");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

// Hook pour traiter un remboursement Stripe (admin)
export function useProcessRefund() {
  const queryClient = useQueryClient();

  return useMutation<
    {
      success: boolean;
      refund: { id: string; amount: number; status: string };
      return: ReturnItem;
      message: string;
    },
    Error,
    {
      id: string;
      refundAmount?: number;
    }
  >({
    mutationFn: async ({ id, refundAmount }) => {
      const response = await fetch(`/api/admin/returns/${id}/refund`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refundAmount,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors du remboursement");
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "returns"] });
      queryClient.invalidateQueries({ queryKey: ["returns"] });
      toast.success(data.message || "Remboursement effectué avec succès");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
