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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
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
      description: initialData.description,
      price: initialData.price,
      subTitle: initialData.subTitle,
      categoryId: initialData.category?.id || "",
      scentId: initialData.scent?.id || "",
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
      <DialogContent className="max-w-5xl overflow-y-auto ">
        <DialogHeader>
          <DialogTitle>Modifier le produit</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            onKeyDown={(e) => {
              // Empêcher la soumission avec Enter
              if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
                e.preventDefault();
              }
            }}
            className="max-h-[90vh]  "
          >
            {/* Informations générales */}
            <div className="grid grid-cols-1 gap-5">
              <div className="py-8">
                <UploadFiles
                  initialFiles={selectedFiles}
                  onFilesChange={handleFilesChange}
                  key={selectedFiles.length} // Force re-render when files change
                />
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du produit</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom du produit" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prix (€)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Prix du produit"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sous-titre</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Sous-titre du produit"
                        {...field}
                        rows={2}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />


              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <TipTapEditor
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder="Description détaillée du produit"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Catégories et parfums */}

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catégorie</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parfum</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un parfum" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {scents.map((scent) => (
                          <SelectItem key={scent.id} value={scent.id}>
                            {scent.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="flex justify-end gap-2  ">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onSuccess}
                  disabled={isPending}
                >
                  Annuler
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isPending || form.formState.isSubmitting}>
                {isPending || form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  "Mettre à jour"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
