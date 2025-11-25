"use client";

import { Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, Palette, Flower2 } from "lucide-react";
import { scentSchema, type ScentFormData } from "@/lib/admin-schemas";
import { DialogClose } from "@/components/ui/dialog";
import { useTransition } from "react";
import { createScentFromJSON } from "@/app/actions/scents";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function CreateScentForm() {
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();

  const form = useForm<ScentFormData>({
    resolver: zodResolver(scentSchema) as Resolver<ScentFormData>,
    defaultValues: {
      name: "",
      description: "",
      icon: "",
      color: "#000000",
      notes: [],
    },
  });

  const onSubmit = (data: ScentFormData) => {
    startTransition(async () => {
      try {
        // Appel de la Server Action (version JSON)
        const result = await createScentFromJSON(data);

        if (result.success) {
          // Invalidation manuelle du cache React Query
          queryClient.invalidateQueries({ queryKey: ["scents"] });

          toast.success("Parfum créé avec succès");
          form.reset();
        } else {
          // Afficher les erreurs de validation
          if (result.fieldErrors) {
            Object.entries(result.fieldErrors).forEach(([field, errors]) => {
              form.setError(field as keyof ScentFormData, {
                message: errors[0],
              });
            });
          }
          toast.error(result.error || "Erreur lors de la création du parfum");
        }
      } catch (error) {
        console.error("Erreur lors de la création:", error);
        toast.error("Erreur lors de la création du parfum");
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Alert d'aide */}
        <Alert>
          <Flower2 className="h-4 w-4" />
          <AlertDescription>
            Créez un parfum pour enrichir votre catalogue. Les champs marqués (*) sont obligatoires.
          </AlertDescription>
        </Alert>

        {/* Informations principales */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Informations principales</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du parfum *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Rose Éternelle, Lavande Provençale"
                      {...field}
                      aria-required="true"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    Nom affiché aux clients
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icône *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Flower2, Leaf, Sparkles"
                      {...field}
                      aria-required="true"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    Nom de l&apos;icône Lucide React
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-semibold">Description *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Décrivez le parfum : notes olfactives (tête, cœur, fond), ambiance, bienfaits..."
                  rows={4}
                  className="resize-none"
                  {...field}
                  aria-required="true"
                  disabled={isPending}
                />
              </FormControl>
              <FormDescription>
                Aide les clients à imaginer le parfum
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        {/* Apparence et 3D */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Apparence & Visualisation</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Couleur du parfum *</FormLabel>
                  <div className="flex gap-3 items-center">
                    <FormControl>
                      <Input
                        type="color"
                        className="w-24 h-12 cursor-pointer"
                        {...field}
                        disabled={isPending}
                        aria-required="true"
                      />
                    </FormControl>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="#000000"
                        className="flex-1 font-mono"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                  </div>
                  <FormDescription>
                    Couleur thématique du parfum
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => form.reset()}
            >
              Annuler
            </Button>
          </DialogClose>
          <Button
            type="submit"
            disabled={isPending || form.formState.isSubmitting}
            className="min-w-[130px]"
          >
            {isPending || form.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                Création...
              </>
            ) : (
              <>
                <Flower2 className="mr-2 h-4 w-4" aria-hidden="true" />
                Créer le parfum
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
