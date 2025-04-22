"use client";
import { useState } from "react";

import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UsersTable } from "@/components/admin/UsersTable";
import { CreateUserForm } from "@/components/admin/CreateUserForm";
import { BanUserForm } from "@/components/admin/BanUserForm";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { BanForm } from "@/types";
import Loading from "@/components/loading";

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);

  const [banForm, setBanForm] = useState<BanForm>({
    userId: "",
    reason: "",
    expirationDate: undefined,
  });

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

  const totalPages = Math.ceil((usersData?.total || 0) / pageSize);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      pages.push(
        <PaginationItem key="1">
          <PaginationLink onClick={() => handlePageChange(1)}>1</PaginationLink>
        </PaginationItem>
      );
      if (startPage > 2) {
        pages.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => handlePageChange(i)}
            isActive={i === currentPage}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      pages.push(
        <PaginationItem key={totalPages}>
          <PaginationLink onClick={() => handlePageChange(totalPages)}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => handlePageChange(currentPage - 1)}
            />
          </PaginationItem>
          {pages}
          <PaginationItem>
            <PaginationNext onClick={() => handlePageChange(currentPage + 1)} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

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

  const banUserMutation = useMutation({
    mutationFn: async (data: BanForm) => {
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

  const updateRoleMutation = useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: string;
      role: "admin" | "user";
    }) => {
      return await authClient.admin.setRole(
        {
          userId,
          role,
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

  const handleDeleteUser = (userId: string) => {
    deleteUserMutation.mutate(userId);
  };

  const handleBanSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    banUserMutation.mutate(banForm);
  };

  const handleUnbanUser = (userId: string) => {
    unbanUserMutation.mutate(userId);
  };

  const handleUpdateUser = (userId: string, role: "admin" | "user") => {
    updateRoleMutation.mutate({ userId, role });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-row items-center justify-between">
        <h1 className="text-3xl font-bold">Gestion des utilisateurs</h1>

        <CreateUserForm />

        <Dialog open={isBanDialogOpen} onOpenChange={setIsBanDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bannir un utilisateur</DialogTitle>
            </DialogHeader>
            <BanUserForm
              isOpen={isBanDialogOpen}
              onOpenChange={setIsBanDialogOpen}
              onSubmit={handleBanSubmit}
              banData={banForm}
              onBanDataChange={setBanForm}
            />
          </DialogContent>
        </Dialog>
      </div>
      {isUsersLoading ? (
        <Loading />
      ) : (
        <UsersTable
          users={
            usersData?.users?.map((user) => ({
              ...user,
              role: (user.role || "user") as "admin" | "user",
              banned: user.banned || false,
              createdAt: user.createdAt.toISOString(),
              updatedAt: user.updatedAt.toISOString(),
            })) || []
          }
          onDelete={handleDeleteUser}
          onBan={(userId) => {
            setBanForm({
              userId,
              reason: "",
              expirationDate: undefined,
            });
            setIsBanDialogOpen(true);
          }}
          onUnban={handleUnbanUser}
          onUpdateRole={handleUpdateUser}
        />
      )}
      {renderPagination()}
    </div>
  );
}
