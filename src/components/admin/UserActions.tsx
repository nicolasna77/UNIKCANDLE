"use client";

import { User } from "@/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Trash2, Shield, Ban, Unlock } from "lucide-react";

interface UserActionsProps {
  user: User;
  onDelete: () => void;
  onBan: () => void;
  onUnban: () => void;
  onUpdateRole: (role: "admin" | "user") => void;
}

export function UserActions({
  user,
  onDelete,
  onBan,
  onUnban,
  onUpdateRole,
}: UserActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => onUpdateRole(user.role === "admin" ? "user" : "admin")}
        >
          <Shield className="mr-2 h-4 w-4" />
          {user.role === "admin"
            ? "Rétrograder en utilisateur"
            : "Promouvoir en admin"}
        </DropdownMenuItem>

        {user.banned ? (
          <DropdownMenuItem onClick={onUnban}>
            <Unlock className="mr-2 h-4 w-4" />
            Débannir
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={onBan}>
            <Ban className="mr-2 h-4 w-4" />
            Bannir
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={onDelete} className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
