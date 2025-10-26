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
import { Loader2, Upload, X } from "lucide-react";
import { categorySchema, type CategoryFormData } from "@/lib/admin-schemas";
import { useState } from "react";
import Image from "next/image";

interface CreateCategoryFormProps {
  onSuccess: () => void;
}

export default function CreateCategoryForm({
  onSuccess,
}: CreateCategoryFormProps) {
  const queryClient = useQueryClient();
  const [uploadingImage, setUploadingImage] = useState(false);

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

  const createCategory = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || "Erreur lors de la création de la catégorie"
        );
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Catégorie créée avec succès");
      form.reset();
      onSuccess();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: CategoryFormData) => {
    createCategory.mutate(data);
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom de la catégorie</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: Bougies parfumées, Accessoires..."
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
                  <Input placeholder="Ex: Flame, Star, Heart" {...field} />
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
                  placeholder="Description détaillée de la catégorie..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Couleur de la catégorie</FormLabel>
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
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image de la catégorie (optionnel)</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  {field.value && (
                    <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border">
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
                        className="absolute top-2 right-2"
                        onClick={() => form.setValue("imageUrl", "")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUpload(file);
                        }
                      }}
                      disabled={uploadingImage}
                    />
                    {uploadingImage && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                  </div>
                  {field.value && (
                    <Input
                      type="text"
                      placeholder="URL de l'image"
                      {...field}
                      disabled
                      className="text-sm text-muted-foreground"
                    />
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onSuccess}
            disabled={createCategory.isPending}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={createCategory.isPending}>
            {createCategory.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Création...
              </>
            ) : (
              "Créer la catégorie"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
