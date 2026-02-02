"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Shield,
  Ban,
  Unlock,
  Trash2,
  Mail,
  Calendar,
  Crown,
  AlertTriangle,
  ShoppingCart,
  Euro,
  Star,
  MoreVertical,
} from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { User } from "./types";

interface CreateColumnsOptions {
  onUpdateRole: (userId: string, role: "admin" | "user") => void;
  onBanUser: (user: User) => void;
  onUnbanUser: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
}

export function createUserColumns({
  onUpdateRole,
  onBanUser,
  onUnbanUser,
  onDeleteUser,
}: CreateColumnsOptions): ColumnDef<User>[] {
  return [
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
          <Badge variant={user.role === "admin" ? "default" : "secondary"}>
            {user.role === "admin" && <Crown className="mr-1 h-3 w-3" />}
            {user.role === "admin" ? "Administrateur" : "Utilisateur"}
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
      accessorKey: "stats",
      header: "Activité",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex flex-col gap-1 text-sm">
            <div className="flex items-center gap-1">
              <ShoppingCart className="h-3 w-3 text-muted-foreground" />
              <span>
                {user.orderCount} commande{user.orderCount !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Euro className="h-3 w-3 text-muted-foreground" />
              <span className="font-medium">{user.totalSpent.toFixed(2)}€</span>
            </div>
            {user.reviewCount > 0 && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-muted-foreground" />
                <span>{user.reviewCount} avis</span>
              </div>
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
            {format(new Date(user.createdAt), "dd/MM/yyyy", { locale: fr })}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 data-[state=open]:bg-muted"
                >
                  <span className="sr-only">Ouvrir le menu</span>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[180px]">
                <DropdownMenuItem
                  onClick={() =>
                    onUpdateRole(
                      user.id,
                      user.role === "admin" ? "user" : "admin"
                    )
                  }
                >
                  <Shield className="mr-2 h-4 w-4" />
                  {user.role === "admin" ? "Rétrograder" : "Promouvoir"}
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {user.banned ? (
                  <DropdownMenuItem onClick={() => onUnbanUser(user.id)}>
                    <Unlock className="mr-2 h-4 w-4" />
                    Débannir
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => onBanUser(user)}>
                    <Ban className="mr-2 h-4 w-4" />
                    Bannir
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => onDeleteUser(user.id)}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
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
