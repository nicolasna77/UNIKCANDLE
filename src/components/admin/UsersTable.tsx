"use client";

import { User } from "@/types";
import { Badge } from "@/components/ui/badge";
import { UserActions } from "./UserActions";

interface UsersTableProps {
  users: User[];
  onDelete: (userId: string) => void;
  onBan: (userId: string) => void;
  onUnban: (userId: string) => void;
  onUpdateRole: (userId: string, role: "admin" | "user") => void;
}

export function UsersTable({
  users,
  onDelete,
  onBan,
  onUnban,
  onUpdateRole,
}: UsersTableProps) {
  return (
    <div className="rounded-md border">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="p-4 text-left">Email</th>
            <th className="p-4 text-left">Nom</th>
            <th className="p-4 text-left">Rôle</th>
            <th className="p-4 text-left">Statut</th>
            <th className="p-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b">
              <td className="p-4">{user.email}</td>
              <td className="p-4">{user.name}</td>
              <td className="p-4">
                <Badge
                  variant={user.role === "admin" ? "default" : "secondary"}
                >
                  {user.role}
                </Badge>
              </td>
              <td className="p-4">
                <Badge variant={user.banned ? "destructive" : "default"}>
                  {user.banned ? "Banni" : "Actif"}
                </Badge>
              </td>
              <td className="p-4">
                <UserActions
                  user={user}
                  onDelete={() => onDelete(user.id)}
                  onBan={() => onBan(user.id)}
                  onUnban={() => onUnban(user.id)}
                  onUpdateRole={(role) => onUpdateRole(user.id, role)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
