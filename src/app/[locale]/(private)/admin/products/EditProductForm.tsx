"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState, useEffect, useTransition } from "react";
import { updateProductFromJSON } from "@/app/actions/products";
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
import { TipTapEditor } from "@/components/ui/tiptap-editor";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Upload, Info, Package, Tag, Sparkles, Medal, Check, ChevronsUpDown } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery } from "@tanstack/react-query";
import { fetchCategories, type CategoryWithProducts } from "@/services/categories";
import { fetchScents } from "@/services/scents";
import { type Scent } from "@prisma/client";
import UploadFiles from "@/components/upload-files";
import { FileMetadata } from "@/hooks/use-file-upload";
import {
  productUpdateSchema,
  type ProductUpdateData,
  type ProductWithRelations,
} from "@/lib/admin-schemas";
import { Category } from "@prisma/client";

interface EditProductFormProps {
  productId: string;
  onSuccess: () => void;
  initialData: ProductWithRelations;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditProductForm({
  productId,
  onSuccess,
  initialData,
  open,
  onOpenChange,
}: EditProductFormProps) {
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  const [selectedFiles, setSelectedFiles] = useState<FileMetadata[]>([]);
  const [deletedImages, setDeletedImages] = useState<string[]>([]);

  const { data: categories = [] } = useQuery<CategoryWithProducts[]>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });
  const { data: scents = [] } = useQuery<Scent[]>({
    queryKey: ["scents"],
    queryFn: fetchScents,
  });

  // Initialiser les fichiers après le montage du composant
  useEffect(() => {
    if (initialData.images && initialData.images.length > 0) {
      const initialFiles = initialData.images.map((image) => ({
        id: image.id,
        name: image.url.split("/").pop() || "image",
        size: 0,
        type: "image/jpeg",
        url: image.url,
      }));
      setSelectedFiles(initialFiles);
    }
  }, [initialData.images]);

  // Fonction pour supprimer une image du blob storage
  const deleteImageFromBlob = async (imageUrl: string) => {
    try {
      const response = await fetch("/api/admin/products/upload", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error || "Erreur lors de la suppression de l'image"
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la suppression de l'image:", error);
      throw error;
    }
  };

  const form = useForm<ProductUpdateData>({
    resolver: zodResolver(productUpdateSchema),
    defaultValues: {
      id: productId,
      name: initialData.name,
      nameEN: initialData.nameEN || "",
      description: initialData.description,
      descriptionEN: initialData.descriptionEN || "",
      price: initialData.price,
      subTitle: initialData.subTitle,
      subTitleEN: initialData.subTitleEN || "",
      slogan: initialData.slogan || "",
      sloganEN: initialData.sloganEN || "",
      categoryId: initialData.category?.id || "",
      scentIds: initialData.scents?.map(s => s.id) || [],
      messageType: initialData.messageType || "audio",
      hasEngraving: initialData.hasEngraving ?? false,
      engravingPrice: initialData.engravingPrice ?? null,
    },
  });

  const uploadImages = async (files: FileMetadata[]) => {
    console.log("Tentative d'upload de", files.length, "fichiers");

    const uploadPromises = files
      .filter((file) => file.file && !file.url.startsWith("http"))
      .map(async (file) => {
        if (!file.file) throw new Error("Fichier non trouvé");
        console.log("Upload du fichier:", file.name, file.file.size, "bytes");

        const formData = new FormData();
        formData.append("file", file.file);
        const response = await fetch("/api/admin/products/upload", {
          method: "POST",
          body: formData,
        });

        console.log("Réponse upload:", response.status, response.statusText);

        if (!response.ok) {
          const error = await response.json();
          console.error("Erreur upload:", error);
          throw new Error(error.error || "Échec de l'upload de l'image");
        }
        const data = await response.json();
        console.log("Upload réussi:", data);
        return data.url;
      });

    return Promise.all(uploadPromises);
  };

  const onSubmit = async (values: ProductUpdateData) => {
    console.log("=== Début de la soumission du formulaire ===");
    console.log("Valeurs du formulaire:", values);
    console.log("Fichiers sélectionnés:", selectedFiles);

    startTransition(async () => {
      try {
        // Supprimer les images supprimées du blob storage
        if (deletedImages.length > 0) {
          console.log("Suppression de", deletedImages.length, "images");
          await Promise.all(
            deletedImages.map((imageUrl) => deleteImageFromBlob(imageUrl))
          );
        }

        // Gérer l'upload des nouvelles images
        const newFiles = selectedFiles.filter(
          (file) => file.file && !file.url.startsWith("http")
        );
        console.log("Nouveaux fichiers à uploader:", newFiles.length);

        const uploadedUrls =
          newFiles.length > 0 ? await uploadImages(newFiles) : [];

        // Construire la liste finale des URLs d'images
        const finalImageUrls = selectedFiles.map((file) => {
          if (file.url.startsWith("http")) return file.url;
          const newUrl = uploadedUrls.shift();
          if (!newUrl) throw new Error("Échec de l'upload de l'image");
          return newUrl;
        });

        console.log("URLs finales:", finalImageUrls);

        // Appel de la Server Action
        const finalData = {
          ...values,
          images: finalImageUrls.map((url) => ({ url })),
        };

        const result = await updateProductFromJSON(productId, finalData);

        if (result.success) {
          // Invalidation manuelle du cache React Query
          queryClient.invalidateQueries({ queryKey: ["products"] });
          queryClient.invalidateQueries({ queryKey: ["admin-products"] });

          toast.success("Produit mis à jour avec succès");
          onSuccess();
        } else {
          // Afficher les erreurs de validation
          if (result.fieldErrors) {
            Object.entries(result.fieldErrors).forEach(([field, errors]) => {
              form.setError(field as keyof ProductUpdateData, {
                message: errors[0],
              });
            });
          }
          toast.error(result.error || "Erreur lors de la mise à jour du produit");
        }
      } catch (error) {
        console.error("Erreur lors de la mise à jour:", error);
        toast.error("Erreur lors de la mise à jour du produit");
      }
    });
  };

  const handleFilesChange = (files: FileMetadata[]) => {
    // Détecter les images supprimées
    const currentUrls = files.map((f) => f.url);
    const previousUrls = selectedFiles.map((f) => f.url);
    const removedUrls = previousUrls.filter(
      (url) => !currentUrls.includes(url)
    );

    if (removedUrls.length > 0) {
      setDeletedImages((prev) => [...prev, ...removedUrls]);
    }

    setSelectedFiles(files);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Modifier le produit
          </DialogTitle>
          <DialogDescription>
            Modifiez les informations du produit dans le catalogue
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Alert d'aide */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Les champs marqués d&apos;un astérisque (*) sont obligatoires.
                Assurez-vous d&apos;avoir au moins une image pour le produit.
              </AlertDescription>
            </Alert>

            {/* Images du produit */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold">Images du produit *</h3>
                  <p className="text-sm text-muted-foreground">
                    Téléchargez au moins une image (recommandé : 3-5 images)
                  </p>
                </div>
                {selectedFiles.length > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {selectedFiles.length} {selectedFiles.length === 1 ? "image" : "images"}
                  </Badge>
                )}
              </div>
              <UploadFiles
                onFilesChange={handleFilesChange}
                initialFiles={selectedFiles}
              />
            </div>

            <Separator />

            {/* Informations générales avec onglets FR/EN */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold">Informations générales *</h3>
                  <p className="text-sm text-muted-foreground">
                    Nom, description et prix du produit (disponible en FR et EN)
                  </p>
                </div>
              </div>

              {/* Prix (commun aux deux langues) */}
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prix (€) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="29.99"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                        aria-required="true"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormDescription>
                      Prix de vente en euros
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
                        <FormLabel>Nom du produit *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Bougie Lavande Relaxante"
                            {...field}
                            aria-required="true"
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormDescription>
                          Le nom principal affiché aux clients français
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sous-titre *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Détente et sérénité"
                            {...field}
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormDescription>
                          Court texte descriptif en français
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="slogan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slogan</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Votre moment de paix"
                            {...field}
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormDescription>
                          Phrase d&apos;accroche en français (optionnel)
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
                          <TipTapEditor
                            value={field.value || ""}
                            onChange={field.onChange}
                            placeholder="Décrivez votre produit en détail : caractéristiques, utilisation, bienfaits..."
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormDescription>
                          Minimum 10 caractères - Description en français
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
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Lavender Relaxing Candle"
                            {...field}
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormDescription>
                          Product name displayed to English customers (optional, falls back to French)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subTitleEN"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subtitle</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Relaxation and serenity"
                            {...field}
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormDescription>
                          Short descriptive text in English (optional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sloganEN"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slogan</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Your moment of peace"
                            {...field}
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormDescription>
                          Catchphrase in English (optional)
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
                          <TipTapEditor
                            value={field.value || ""}
                            onChange={field.onChange}
                            placeholder="Describe your product in detail: features, usage, benefits..."
                            disabled={isPending}
                          />
                        </FormControl>
                        <FormDescription>
                          Minimum 10 characters - Description in English (optional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>
            </div>

            <Separator />

            {/* Catégories et parfums */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold">Classification *</h3>
                  <p className="text-sm text-muted-foreground">
                    Catégorie, parfum et type de message personnalisé
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Catégorie *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isPending}
                      >
                        <FormControl>
                          <SelectTrigger aria-required="true">
                            <SelectValue placeholder="Sélectionner une catégorie" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category: Category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Type de bougie (ex: Relaxation, Romance)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="scentIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parfums *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <button
                              type="button"
                              disabled={isPending}
                              className="flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <span className={field.value?.length ? "" : "text-muted-foreground"}>
                                {field.value?.length
                                  ? scents.filter(s => field.value?.includes(s.id)).map(s => s.name).join(", ")
                                  : "Sélectionner des parfums"}
                              </span>
                              <ChevronsUpDown className="h-4 w-4 opacity-50" />
                            </button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-2">
                          <div className="space-y-1">
                            {scents.map((scent) => {
                              const checked = field.value?.includes(scent.id);
                              return (
                                <label
                                  key={scent.id}
                                  className="flex items-center gap-2 rounded-sm px-2 py-1.5 cursor-pointer hover:bg-accent"
                                >
                                  <Checkbox
                                    checked={!!checked}
                                    onCheckedChange={(val) => {
                                      const current = field.value || [];
                                      field.onChange(
                                        val
                                          ? [...current, scent.id]
                                          : current.filter((id: string) => id !== scent.id)
                                      );
                                    }}
                                  />
                                  <span className="text-sm">{scent.icon} {scent.name}</span>
                                  {checked && <Check className="ml-auto h-4 w-4 text-primary" />}
                                </label>
                              );
                            })}
                          </div>
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Fragrances disponibles pour cette bougie (une ou plusieurs)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="messageType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type de message personnalisé *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isPending}
                      >
                        <FormControl>
                          <SelectTrigger aria-required="true">
                            <SelectValue placeholder="Sélectionner le type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="audio">
                            🎤 Audio (enregistrement vocal)
                          </SelectItem>
                          <SelectItem value="text">
                            ✍️ Texte (message gravé dans la cire)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Format de personnalisation proposé aux clients
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Gravure médaillon */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Medal className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold">Gravure médaillon</h3>
                  <p className="text-sm text-muted-foreground">
                    Option de gravure personnalisée sur le médaillon
                  </p>
                </div>
              </div>

              <FormField
                control={form.control}
                name="hasEngraving"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Activer la gravure</FormLabel>
                      <FormDescription>
                        Propose aux clients de graver un texte sur le médaillon
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                        disabled={isPending}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.watch("hasEngraving") && (
                <FormField
                  control={form.control}
                  name="engravingPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prix de la gravure (€)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00 (gratuit)"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === "" ? null : parseFloat(e.target.value)
                            )
                          }
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormDescription>
                        Laisser vide ou 0 pour une gravure gratuite
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Actions */}
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                }}
                disabled={isPending}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isPending || form.formState.isSubmitting}
                className="min-w-[120px]"
              >
                {isPending || form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                    Mise à jour...
                  </>
                ) : (
                  <>
                    <Package className="mr-2 h-4 w-4" aria-hidden="true" />
                    Mettre à jour
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
