"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { DataTableAdvanced } from "@/components/admin/data-table-advanced";
import {
  AdminHeader,
  AdminHeaderActions,
} from "@/components/admin/admin-header";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  type User,
  type UsersResponse,
  UserStatsCards,
  UserFilters,
  createUserColumns,
  useUserMutations,
  CreateUserDialog,
  BanUserDialog,
} from "./components";

export default function UsersPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { deleteUser, banUser, unbanUser, updateRole } = useUserMutations();

  const { data, isLoading, refetch } = useQuery<UsersResponse>({
    queryKey: ["admin-users", page, limit, search, roleFilter, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search,
        role: roleFilter,
        status: statusFilter,
      });
      const response = await fetch(`/api/admin/users?${params}`);
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json();
    },
  });

  const handleDeleteUser = (userId: string) => {
    setUserToDelete(userId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteUser = () => {
    if (userToDelete) {
      deleteUser(userToDelete);
      setUserToDelete(null);
    }
  };

  const handleBanUser = (user: User) => {
    setSelectedUser(user);
    setIsBanDialogOpen(true);
  };

  const handleExport = (exportData: User[]) => {
    const csvContent = [
      [
        "ID",
        "Email",
        "Nom",
        "Rôle",
        "Statut",
        "Commandes",
        "Dépensé",
        "Créé le",
      ],
      ...exportData.map((user) => [
        user.id,
        user.email,
        user.name || "",
        user.role || "user",
        user.banned ? "Banni" : "Actif",
        user.orderCount.toString(),
        `${user.totalSpent.toFixed(2)}€`,
        format(new Date(user.createdAt), "dd/MM/yyyy HH:mm", { locale: fr }),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `utilisateurs-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns = useMemo(
    () =>
      createUserColumns({
        onUpdateRole: (userId, role) => updateRole({ userId, role }),
        onBanUser: handleBanUser,
        onUnbanUser: unbanUser,
        onDeleteUser: handleDeleteUser,
      }),
    [updateRole, unbanUser]
  );

  const users = data?.users || [];
  const stats = data?.stats;
  const pagination = data?.pagination;

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value);
    setPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Utilisateurs"
        description="Gérez les utilisateurs, leurs rôles et permissions"
        breadcrumbs={[
          { label: "Administration", href: "/admin/dashboard" },
          { label: "Utilisateurs" },
        ]}
        badge={{
          text: `${data?.pagination?.total ?? 0} utilisateur${(data?.pagination?.total ?? 0) !== 1 ? "s" : ""}`,
          variant: "secondary",
        }}
        actions={
          <AdminHeaderActions
            onRefresh={() => refetch()}
            onAdd={() => setIsCreateDialogOpen(true)}
            addLabel="Nouvel utilisateur"
            isLoading={isLoading}
          />
        }
      />

      {stats && <UserStatsCards stats={stats} />}

      <UserFilters
        search={search}
        onSearchChange={handleSearchChange}
        roleFilter={roleFilter}
        onRoleFilterChange={handleRoleFilterChange}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
      />

      
        <DataTableAdvanced
          data={users}
          columns={columns}
          isLoading={isLoading}
          onRefresh={() => refetch()}
          onExport={handleExport}
          emptyMessage="Aucun utilisateur trouvé"
          searchPlaceholder="Rechercher par nom ou email..."
          pagination={pagination}
          onPageChange={setPage}
        />

      <CreateUserDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => refetch()}
      />

      <BanUserDialog
        open={isBanDialogOpen}
        onOpenChange={(open) => {
          setIsBanDialogOpen(open);
          if (!open) setSelectedUser(null);
        }}
        user={selectedUser}
        onBan={banUser}
      />

      <ConfirmDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) setUserToDelete(null);
        }}
        onConfirm={confirmDeleteUser}
        title="Supprimer cet utilisateur ?"
        description="Cette action est irréversible. Toutes les données liées à cet utilisateur seront perdues."
        isLoading={false}
      />
    </div>
  );
}
