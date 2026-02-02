"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

export function useUserMutations() {
  const queryClient = useQueryClient();

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await authClient.admin.removeUser({ userId }, { throw: true });
    },
    onSuccess: () => {
      toast.success("Utilisateur supprimé avec succès");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la suppression");
    },
  });

  const banUserMutation = useMutation({
    mutationFn: async (data: {
      userId: string;
      reason: string;
      expiresIn?: number;
    }) => {
      return await authClient.admin.banUser(
        {
          userId: data.userId,
          banReason: data.reason,
          banExpiresIn: data.expiresIn,
        },
        { throw: true }
      );
    },
    onSuccess: () => {
      toast.success("Utilisateur banni avec succès");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors du bannissement");
    },
  });

  const unbanUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await authClient.admin.unbanUser({ userId }, { throw: true });
    },
    onSuccess: () => {
      toast.success("Utilisateur débanni avec succès");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors du débannissement");
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async (data: { userId: string; role: "admin" | "user" }) => {
      return await authClient.admin.setRole(
        {
          userId: data.userId,
          role: data.role,
        },
        { throw: true }
      );
    },
    onSuccess: () => {
      toast.success("Rôle mis à jour avec succès");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la mise à jour du rôle");
    },
  });

  return {
    deleteUser: deleteUserMutation.mutate,
    banUser: banUserMutation.mutate,
    unbanUser: unbanUserMutation.mutate,
    updateRole: updateRoleMutation.mutate,
    isBanning: banUserMutation.isPending,
  };
}
