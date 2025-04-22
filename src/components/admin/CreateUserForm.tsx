"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserForm } from "@/types";
import { AtSign, KeyRound, User, Shield } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export function CreateUserForm() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const [newUser, setNewUser] = useState<UserForm>({
    email: "",
    password: "",
    name: "",
    role: "user",
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: UserForm) => {
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
      setNewUser({
        email: "",
        password: "",
        name: "",
        role: "user",
      });
      setIsOpen(false);
    },
    onError: (error: Error) => {
      toast.error(
        error.message ||
          "Une erreur est survenue lors de la création de l&apos;utilisateur"
      );
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createUserMutation.mutate(newUser);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Créer un nouvel utilisateur</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <AtSign className="h-4 w-4 text-gray-500" />
              </div>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                className="pl-10"
                placeholder="email@exemple.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <KeyRound className="h-4 w-4 text-gray-500" />
              </div>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                className="pl-10"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nom</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <User className="h-4 w-4 text-gray-500" />
              </div>
              <Input
                id="name"
                value={newUser.name}
                onChange={(e) =>
                  setNewUser({ ...newUser, name: e.target.value })
                }
                className="pl-10"
                placeholder="Jean Dupont"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Rôle</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Shield className="h-4 w-4 text-gray-500" />
              </div>
              <Select
                value={newUser.role}
                onValueChange={(value: "admin" | "user") =>
                  setNewUser({ ...newUser, role: value })
                }
              >
                <SelectTrigger className="pl-10">
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrateur</SelectItem>
                  <SelectItem value="user">Utilisateur</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={createUserMutation.isPending}
          >
            {createUserMutation.isPending
              ? "Création en cours..."
              : "Créer l'utilisateur"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
