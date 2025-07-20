"use client";

import { useState } from "react";
import { Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, User, Mail, Lock, Shield } from "lucide-react";
import { authClient } from "@/lib/auth-client";

const createUserSchema = z.object({
  email: z.string().email("Email invalide"),
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  role: z.enum(["admin", "user"]).default("user"),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

interface CreateUserFormProps {
  onSuccess: () => void;
}

export function CreateUserForm({ onSuccess }: CreateUserFormProps) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema) as Resolver<CreateUserFormData>,
    defaultValues: {
      email: "",
      name: "",
      password: "",
      role: "user",
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (data: CreateUserFormData) => {
      setIsLoading(true);
      try {
        const response = await authClient.admin.createUser(
          {
            email: data.email,
            name: data.name,
            password: data.password,
            role: data.role,
          },
          { throw: true }
        );
        return response;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      toast.success("Utilisateur créé avec succès");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      form.reset();
      onSuccess();
    },
    onError: (error: Error) => {
      toast.error(
        error.message || "Erreur lors de la création de l'utilisateur"
      );
    },
  });

  const onSubmit = (data: CreateUserFormData) => {
    createUserMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Informations personnelles */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Informations personnelles</h3>
            <p className="text-sm text-muted-foreground">
              Définissez les informations de base de l&apos;utilisateur
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Nom complet
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Jean Dupont" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Adresse email
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Ex: jean.dupont@exemple.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Sécurité et permissions */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Sécurité et permissions</h3>
            <p className="text-sm text-muted-foreground">
              Définissez le mot de passe et les permissions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Mot de passe
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Minimum 8 caractères"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Rôle
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un rôle" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="user">Utilisateur</SelectItem>
                      <SelectItem value="admin">Administrateur</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onSuccess}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Création...
              </>
            ) : (
              "Créer l'utilisateur"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
