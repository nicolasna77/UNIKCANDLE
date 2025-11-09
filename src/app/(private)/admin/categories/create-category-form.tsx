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
import { Loader2, X, FolderOpen, Palette, Image as ImageIcon } from "lucide-react";
import { categorySchema, type CategoryFormData } from "@/lib/admin-schemas";
import { useState, useTransition } from "react";
import Image from "next/image";
import { createCategoryFromJSON } from "@/app/actions/categories";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CreateCategoryFormProps {
  onSuccess: () => void;
}

export default function CreateCategoryForm({
  onSuccess,
}: CreateCategoryFormProps) {
  const queryClient = useQueryClient();
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema) as Resolver<CategoryFormData>,
    defaultValues: {
      name: "",
      description: "",
      icon: "",
      color: "#000000",
      imageUrl: "",
    },
  });

  const onSubmit = (data: CategoryFormData) => {
    startTransition(async () => {
      try {
        // Appel de la Server Action (version JSON)
        const result = await createCategoryFromJSON(data);

        if (result.success) {
          // Invalidation manuelle du cache React Query
          queryClient.invalidateQueries({ queryKey: ["categories"] });

          toast.success("Catégorie créée avec succès");
          form.reset();
          onSuccess();
        } else {
          // Afficher les erreurs de validation
          if (result.fieldErrors) {
            Object.entries(result.fieldErrors).forEach(([field, errors]) => {
              form.setError(field as keyof CategoryFormData, {
                message: errors[0],
              });
            });
          }
          toast.error(result.error || "Erreur lors de la création de la catégorie");
        }
      } catch (error) {
        console.error("Erreur lors de la création:", error);
        toast.error("Erreur lors de la création de la catégorie");
      }
    });
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'upload");
      }

      const { url } = await response.json();
      form.setValue("imageUrl", url);
      toast.success("Image téléchargée avec succès");
    } catch (error) {
      toast.error("Erreur lors du téléchargement de l'image");
      console.error(error);
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Alert d'aide */}
        <Alert>
          <FolderOpen className="h-4 w-4" />
          <AlertDescription>
            Créez une catégorie pour organiser vos produits. Les champs marqués (*) sont obligatoires.
          </AlertDescription>
        </Alert>

        {/* Informations principales */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Informations principales</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de la catégorie *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Relaxation, Romance, Énergie"
                      {...field}
                      aria-required="true"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormDescription>
                    Nom affiché dans la navigation
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
                      placeholder="Ex: Flame, Sparkles, Heart"
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
                  placeholder="Décrivez cette catégorie et les types de produits qu'elle contient..."
                  rows={4}
                  className="resize-none"
                  {...field}
                  aria-required="true"
                  disabled={isPending}
                />
              </FormControl>
              <FormDescription>
                Aide les clients à comprendre cette catégorie
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        {/* Apparence */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Apparence</h3>
          </div>
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Couleur de la catégorie *</FormLabel>
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
                  Couleur thématique pour cette catégorie
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* Image */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Image de bannière</h3>
            <span className="text-sm text-muted-foreground">(optionnel)</span>
          </div>
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image de la catégorie</FormLabel>
                <FormControl>
                  <div className="space-y-4">
                    {field.value && (
                      <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border bg-muted">
                        <Image
                          src={field.value}
                          alt="Aperçu de la catégorie"
                          fill
                          className="object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 shadow-lg"
                          onClick={() => form.setValue("imageUrl", "")}
                          disabled={isPending}
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Supprimer l&apos;image</span>
                        </Button>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleImageUpload(file);
                            }
                          }}
                          disabled={uploadingImage || isPending}
                          className="cursor-pointer"
                        />
                      </div>
                      {uploadingImage && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Upload...</span>
                        </div>
                      )}
                    </div>
                    {field.value && (
                      <Input
                        type="text"
                        placeholder="URL de l'image"
                        {...field}
                        disabled
                        className="text-xs text-muted-foreground font-mono bg-muted"
                      />
                    )}
                  </div>
                </FormControl>
                <FormDescription>
                  Format recommandé : 800x600px, max 2MB
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.reset();
              onSuccess();
            }}
            disabled={isPending}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={isPending || form.formState.isSubmitting}
            className="min-w-[140px]"
          >
            {isPending || form.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                Création...
              </>
            ) : (
              <>
                <FolderOpen className="mr-2 h-4 w-4" aria-hidden="true" />
                Créer la catégorie
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
