import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

interface ErrorResponse {
  error: string;
}

export function useUsers() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    name: "",
    role: "user" as const,
  });
  const [banForm, setBanForm] = useState({
    userId: "",
    reason: "",
    expirationDate: undefined as Date | undefined,
  });

  // Query pour récupérer les utilisateurs
  const { data: usersData, isLoading: isUsersLoading } = useQuery({
    queryKey: ["users", currentPage],
    queryFn: async () => {
      const data = await authClient.admin.listUsers(
        {
          query: {
            limit: pageSize,
            offset: (currentPage - 1) * pageSize,
            sortBy: "createdAt",
            sortDirection: "desc",
          },
        },
        {
          throw: true,
        }
      );
      return data;
    },
  });

  // Mutation pour créer un utilisateur
  const createUserMutation = useMutation({
    mutationFn: async (userData: typeof newUser) => {
      return await authClient.admin.createUser(
        {
          name: userData.name,
          email: userData.email,
          password: userData.password,
          role: userData.role,
        },
        {
          throw: true,
        }
      );
    },
    onSuccess: () => {
      toast.success("Utilisateur créé avec succès");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsDialogOpen(false);
      setNewUser({
        email: "",
        password: "",
        name: "",
        role: "user",
      });
    },
    onError: (error: Error) => {
      toast.error(
        error.message ||
          "Une erreur est survenue lors de la création de l&apos;utilisateur"
      );
    },
  });

  // Mutation pour supprimer un utilisateur
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await authClient.admin.removeUser(
        {
          userId,
        },
        {
          throw: true,
        }
      );
    },
    onSuccess: () => {
      toast.success("Utilisateur supprimé avec succès");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: Error) => {
      toast.error(
        error.message ||
          "Une erreur est survenue lors de la suppression de l&apos;utilisateur"
      );
    },
  });

  // Mutation pour bannir un utilisateur
  const banUserMutation = useMutation({
    mutationFn: async (data: {
      userId: string;
      reason: string;
      expirationDate?: Date;
    }) => {
      return await authClient.admin.banUser(
        {
          userId: data.userId,
          banReason: data.reason,
          banExpiresIn: data.expirationDate
            ? Math.floor(
                (data.expirationDate.getTime() - new Date().getTime()) / 1000
              )
            : undefined,
        },
        {
          throw: true,
        }
      );
    },
    onSuccess: () => {
      toast.success("Utilisateur banni avec succès");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsBanDialogOpen(false);
      setBanForm({
        userId: "",
        reason: "",
        expirationDate: undefined,
      });
    },
    onError: (error: Error) => {
      toast.error(
        error.message || "Une erreur est survenue lors du bannissement"
      );
    },
  });

  // Mutation pour débannir un utilisateur
  const unbanUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await authClient.admin.unbanUser(
        {
          userId,
        },
        {
          throw: true,
        }
      );
    },
    onSuccess: () => {
      toast.success("Utilisateur débanni avec succès");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: Error) => {
      toast.error(
        error.message || "Une erreur est survenue lors du débannissement"
      );
    },
  });

  // Mutation pour révoquer les sessions
  const revokeSessionsMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/admin/users/${userId}/sessions`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData: ErrorResponse = await response.json();
        throw new Error(errorData.error);
      }
      return response;
    },
    onSuccess: () => {
      toast.success("Sessions révoquées avec succès");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Une erreur est survenue");
    },
  });

  // Mutation pour mettre à jour le rôle
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      return await authClient.admin.setRole(
        {
          userId,
          role: role as "user" | "admin",
        },
        {
          throw: true,
        }
      );
    },
    onSuccess: () => {
      toast.success("Rôle mis à jour avec succès");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: Error) => {
      toast.error(
        error.message ||
          "Une erreur est survenue lors de la mise à jour du rôle"
      );
    },
  });

  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createUserMutation.mutate(newUser);
  };

  const handleDeleteUser = (userId: string) => {
    deleteUserMutation.mutate(userId);
  };

  const handleBanSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    banUserMutation.mutate({
      userId: banForm.userId,
      reason: banForm.reason,
      expirationDate: banForm.expirationDate,
    });
  };

  const handleUnbanUser = (userId: string) => {
    unbanUserMutation.mutate(userId);
  };

  const handleRevokeSessions = (userId: string) => {
    revokeSessionsMutation.mutate(userId);
  };

  const handleUpdateUser = (userId: string, formData: { role: string }) => {
    updateRoleMutation.mutate({ userId, role: formData.role });
  };

  return {
    usersData,
    isUsersLoading,
    currentPage,
    setCurrentPage,
    pageSize,
    isDialogOpen,
    setIsDialogOpen,
    isBanDialogOpen,
    setIsBanDialogOpen,
    newUser,
    setNewUser,
    banForm,
    setBanForm,
    handleCreateUser,
    handleDeleteUser,
    handleBanSubmit,
    handleUnbanUser,
    handleRevokeSessions,
    handleUpdateUser,
  };
}
