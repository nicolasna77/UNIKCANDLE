"use client";

import { Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { scentSchema, type ScentFormData } from "@/lib/admin-schemas";

interface CreateScentFormProps {
  onSuccess: () => void;
}

export default function CreateScentForm({ onSuccess }: CreateScentFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<ScentFormData>({
    resolver: zodResolver(scentSchema) as Resolver<ScentFormData>,
    defaultValues: {
      name: "",
      description: "",
      icon: "",
      color: "#000000",
      model3dUrl: "",
      notes: [],
    },
  });

  const createScent = useMutation({
    mutationFn: async (data: ScentFormData) => {
      const response = await fetch("/api/admin/scents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la création du parfum");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scents"] });
      toast.success("Parfum créé avec succès");
      form.reset();
      onSuccess();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: ScentFormData) => {
    createScent.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom du parfum</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: Rose Éternelle, Lavande Provençale..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Icône</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Flower, Leaf, Sparkle" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Description détaillée du parfum, ses notes olfactives..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Couleur du parfum</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input type="color" className="w-20 h-10" {...field} />
                  </FormControl>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="#000000"
                      className="flex-1"
                      {...field}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="model3dUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Modèle 3D (optionnel)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="URL du modèle 3D pour la visualisation AR"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onSuccess}
            disabled={createScent.isPending}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={createScent.isPending}>
            {createScent.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Création...
              </>
            ) : (
              "Créer le parfum"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
