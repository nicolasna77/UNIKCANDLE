"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTransition, useState, useEffect } from "react";
import Image from "next/image";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  X,
  FolderOpen,
  Palette,
  Image as ImageIcon,
  Save,
} from "lucide-react";
import { categorySchema, type CategoryFormData } from "@/lib/admin-schemas";
import { updateCategoryFromJSON } from "@/app/actions/categories";
import { type CategoryWithProducts } from "@/services/categories";

interface EditCategoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: CategoryWithProducts;
  onSuccess: () => void;
}

export default function EditCategoryForm({
  open,
  onOpenChange,
  category,
  onSuccess,
}: EditCategoryFormProps) {
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  const [uploadingImage, setUploadingImage] = useState(false);

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category.name,
      nameEN: category.nameEN || "",
      description: category.description,
      descriptionEN: category.descriptionEN || "",
      icon: category.icon,
      color: category.color,
      imageUrl: category.imageUrl || "",
    },
  });

  // Reset form when category changes
  useEffect(() => {
    form.reset({
      name: category.name,
      nameEN: category.nameEN || "",
      description: category.description,
      descriptionEN: category.descriptionEN || "",
      icon: category.icon,
      color: category.color,
      imageUrl: category.imageUrl || "",
    });
  }, [category, form]);

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Erreur lors de l'upload");

      const { url } = await response.json();
      form.setValue("imageUrl", url);
      toast.success("Image uploadée avec succès");
    } catch (error) {
      toast.error("Erreur lors du téléchargement de l'image");
      console.error(error);
    } finally {
      setUploadingImage(false);
    }
  };

  const onSubmit = (data: CategoryFormData) => {
    startTransition(async () => {
      try {
        const result = await updateCategoryFromJSON(category.id, data);

        if (result.success) {
          queryClient.invalidateQueries({ queryKey: ["categories"] });
          toast.success("Catégorie mise à jour avec succès");
          onSuccess();
          onOpenChange(false);
        } else {
          if (result.fieldErrors) {
            Object.entries(result.fieldErrors).forEach(([field, errors]) => {
              form.setError(field as keyof CategoryFormData, {
                message: errors[0],
              });
            });
          }
          toast.error(result.error || "Erreur lors de la mise à jour");
        }
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Une erreur est survenue");
      }
    });
  };

  const handleClose = () => {
    form.reset({
      name: category.name,
      nameEN: category.nameEN || "",
      description: category.description,
      descriptionEN: category.descriptionEN || "",
      icon: category.icon,
      color: category.color,
      imageUrl: category.imageUrl || "",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Modifier la catégorie
          </DialogTitle>
          <DialogDescription>
            Modifiez les informations de la catégorie &quot;{category.name}
            &quot;
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Alert>
              <FolderOpen className="h-4 w-4" />
              <AlertDescription>
                Les champs marqués (*) sont obligatoires.
              </AlertDescription>
            </Alert>

            {/* Informations principales avec onglets FR/EN */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold">
                    Informations principales
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Nom et description (disponible en FR et EN)
                  </p>
                </div>
              </div>

              {/* Icône (commun aux deux langues) */}
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icône *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Flame, Heart, Sparkles"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormDescription>
                      Nom de l&apos;icône Lucide
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Onglets FR/EN */}
              <Tabs defaultValue="fr" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="fr">🇫🇷 Français</TabsTrigger>
                  <TabsTrigger value="en">🇬🇧 English</TabsTrigger>
                </TabsList>

                {/* Onglet Français */}
                <TabsContent value="fr" className="space-y-4 mt-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Relaxation, Romance"
                            {...field}
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormDescription>
                          Nom affiché aux clients français
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Décrivez cette catégorie..."
                            rows={4}
                            className="resize-none"
                            {...field}
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormDescription>
                          Aide les clients français à comprendre cette catégorie
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                {/* Onglet English */}
                <TabsContent value="en" className="space-y-4 mt-4">
                  <FormField
                    control={form.control}
                    name="nameEN"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Relaxation, Romance"
                            {...field}
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormDescription>
                          Name displayed to English customers (optional, falls
                          back to French)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="descriptionEN"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe this category..."
                            rows={4}
                            className="resize-none"
                            {...field}
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormDescription>
                          Help English customers understand this category
                          (optional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Palette className="h-5 w-5 text-muted-foreground" />
                Apparence
              </h3>
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Couleur *</FormLabel>
                    <div className="flex gap-3 items-center">
                      <FormControl>
                        <Input
                          type="color"
                          className="w-16 h-10 cursor-pointer p-1"
                          {...field}
                          disabled={isPending}
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
                    <FormDescription>Couleur thématique</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                Image de bannière
                <span className="text-sm font-normal text-muted-foreground">
                  (optionnel)
                </span>
              </h3>
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="space-y-4">
                        {field.value && (
                          <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border bg-muted">
                            <Image
                              src={field.value}
                              alt="Aperçu"
                              fill
                              className="object-cover"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2"
                              onClick={() => form.setValue("imageUrl", "")}
                              disabled={isPending}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        <div className="flex items-center gap-3">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(file);
                            }}
                            disabled={uploadingImage || isPending}
                            className="cursor-pointer"
                          />
                          {uploadingImage && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Upload...</span>
                            </div>
                          )}
                        </div>
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

            <DialogFooter className="gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isPending}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isPending || uploadingImage}
                className="min-w-[120px]"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Enregistrer
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
