"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataTableAdvanced } from "@/components/admin/data-table-advanced";
import {
  AdminHeader,
  AdminHeaderActions,
} from "@/components/admin/admin-header";
import { CreateUserForm } from "@/components/admin/CreateUserForm";
import { BanUserForm } from "@/components/admin/BanUserForm";
import { type ColumnDef } from "@tanstack/react-table";
import {
  Shield,
  Ban,
  Unlock,
  Trash2,
  Mail,
  Calendar,
  Crown,
  AlertTriangle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface User {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "USER";
  banned: boolean;
  banReason?: string;
  banExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  image?: string;
  emailVerified: boolean;
  lastSignedInAt?: Date;
}

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const {
    data: usersData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const data = await authClient.admin.listUsers(
        {
          query: {
            limit: 100,
            offset: 0,
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

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await authClient.admin.removeUser({ userId }, { throw: true });
    },
    onSuccess: () => {
      toast.success("Utilisateur supprimé avec succès");
      queryClient.invalidateQueries({ queryKey: ["users"] });
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
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsBanDialogOpen(false);
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
      queryClient.invalidateQueries({ queryKey: ["users"] });
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
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la mise à jour du rôle");
    },
  });

  const handleDeleteUser = (userId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      deleteUserMutation.mutate(userId);
    }
  };

  const handleBanUser = (user: User) => {
    setSelectedUser(user);
    setIsBanDialogOpen(true);
  };

  const handleUnbanUser = (userId: string) => {
    unbanUserMutation.mutate(userId);
  };

  const handleUpdateRole = (userId: string, role: "admin" | "user") => {
    updateRoleMutation.mutate({ userId, role });
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleExport = (data: User[]) => {
    const csvContent = [
      ["ID", "Email", "Nom", "Rôle", "Statut", "Créé le", "Dernière connexion"],
      ...data.map((user) => [
        user.id,
        user.email,
        user.name || "",
        user.role,
        user.banned ? "Banni" : "Actif",
        format(user.createdAt, "dd/MM/yyyy HH:mm", { locale: fr }),
        user.lastSignedInAt
          ? format(user.lastSignedInAt, "dd/MM/yyyy HH:mm", { locale: fr })
          : "Jamais",
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

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "user",
      header: "Utilisateur",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.image} alt={user.name} />
              <AvatarFallback className="bg-primary/10">
                {user.name?.charAt(0).toUpperCase() ||
                  user.email.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium">
                {user.name || "Nom non défini"}
              </span>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Mail className="h-3 w-3" />
                {user.email}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: "Rôle",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
            {user.role === "ADMIN" && <Crown className="mr-1 h-3 w-3" />}
            {user.role === "ADMIN" ? "Administrateur" : "Utilisateur"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex flex-col gap-1">
            <Badge variant={user.banned ? "destructive" : "default"}>
              {user.banned ? (
                <>
                  <Ban className="mr-1 h-3 w-3" />
                  Banni
                </>
              ) : (
                "Actif"
              )}
            </Badge>
            {!user.emailVerified && (
              <Badge variant="outline" className="text-xs">
                <AlertTriangle className="mr-1 h-3 w-3" />
                Email non vérifié
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Créé le",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-1 text-sm">
            <Calendar className="h-3 w-3" />
            {format(user.createdAt, "dd/MM/yyyy", { locale: fr })}
          </div>
        );
      },
    },
    {
      accessorKey: "lastSignedInAt",
      header: "Dernière connexion",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <span className="text-sm text-muted-foreground">
            {user.lastSignedInAt
              ? format(user.lastSignedInAt, "dd/MM/yyyy HH:mm", { locale: fr })
              : "Jamais"}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() =>
                  handleUpdateRole(
                    user.id,
                    user.role === "ADMIN" ? "USER" : "ADMIN"
                  )
                }
              >
                <Shield className="mr-2 h-4 w-4" />
                {user.role === "ADMIN" ? "Rétrograder" : "Promouvoir"}
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {user.banned ? (
                <DropdownMenuItem onClick={() => handleUnbanUser(user.id)}>
                  <Unlock className="mr-2 h-4 w-4" />
                  Débannir
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => handleBanUser(user)}>
                  <Ban className="mr-2 h-4 w-4" />
                  Bannir
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => handleDeleteUser(user.id)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const users = usersData?.users || [];

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Gestion des utilisateurs"
        description="Gérez les utilisateurs, leurs rôles et permissions"
        breadcrumbs={[
          { label: "Administration", href: "/admin" },
          { label: "Utilisateurs" },
        ]}
        actions={
          <AdminHeaderActions
            onRefresh={handleRefresh}
            onAdd={() => setIsCreateDialogOpen(true)}
            addLabel="Nouvel utilisateur"
          />
        }
      />

      <DataTableAdvanced
        data={users as unknown as User[]}
        columns={columns}
        isLoading={isLoading}
        onRefresh={handleRefresh}
        onExport={handleExport}
        emptyMessage="Aucun utilisateur trouvé"
        searchPlaceholder="Rechercher par nom ou email..."
      />

      {/* Dialogue de création d&apos;utilisateur */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
          </DialogHeader>
          <CreateUserForm onSuccess={() => setIsCreateDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Dialogue de bannissement */}
      <Dialog open={isBanDialogOpen} onOpenChange={setIsBanDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bannir l&apos;utilisateur</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <BanUserForm
              user={selectedUser}
              onSuccess={() => setIsBanDialogOpen(false)}
              onBan={(data) =>
                banUserMutation.mutate({
                  userId: selectedUser.id,
                  reason: data.reason,
                  expiresIn: data.expirationDate
                    ? Math.floor(
                        (data.expirationDate.getTime() - new Date().getTime()) /
                          1000
                      )
                    : undefined,
                })
              }
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
