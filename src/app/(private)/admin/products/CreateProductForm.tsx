"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";
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
import { Plus, Loader2 } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { useScents } from "@/hooks/useScents";
import UploadFiles from "@/components/upload-files";
import { FileMetadata } from "@/hooks/use-file-upload";
import CreateScentForm from "@/app/(private)/admin/scents/create-scent-form";
import CreateCategoryForm from "@/app/(private)/admin/categories/create-category-form";
import { productSchema, type ProductFormData } from "@/lib/admin-schemas";
import { Category } from "@prisma/client";
import { CardFooter } from "@/components/ui/card";

interface CreateProductFormProps {
  onSuccess: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateProductForm({
  onSuccess,
  open,
  onOpenChange,
}: CreateProductFormProps) {
  const queryClient = useQueryClient();
  const [selectedFiles, setSelectedFiles] = useState<FileMetadata[]>([]);
  const [isScentDialogOpen, setIsScentDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);

  const { data: categories = [] } = useCategories();
  const { data: scents = [] } = useScents();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      subTitle: "",
      slogan: "",
      categoryId: "",
      scentId: "",
      imageUrl: "",
    },
  });

  const uploadImages = async (files: FileMetadata[]) => {
    const uploadPromises = files
      .filter((file) => file.file)
      .map(async (file) => {
        if (!file.file) throw new Error("Fichier non trouvé");
        const formData = new FormData();
        formData.append("file", file.file);
        const response = await fetch("/api/upload/image", {
          method: "POST",
          body: formData,
        });
        if (!response.ok) throw new Error("Échec de l'upload de l'image");
        const data = await response.json();
        return data.url;
      });

    return Promise.all(uploadPromises);
  };

  const createProduct = useMutation({
    mutationFn: async (
      values: ProductFormData & { images?: Array<{ url: string }> }
    ) => {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Une erreur est survenue");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Produit créé avec succès");
      onSuccess();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = async (values: ProductFormData) => {
    try {
      // Gérer l'upload des images
      const uploadedUrls =
        selectedFiles.length > 0 ? await uploadImages(selectedFiles) : [];

      // Utiliser la première image comme imageUrl principale et toutes comme images
      const finalData = {
        ...values,
        imageUrl: uploadedUrls[0] || "",
        images: uploadedUrls.map((url) => ({ url })),
      };

      await createProduct.mutateAsync(finalData);
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      toast.error("Erreur lors de la création du produit");
    }
  };

  const handleFilesChange = (files: FileMetadata[]) => {
    setSelectedFiles(files);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer un produit</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Informations générales */}
            {/* Images du produit */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Images du produit</h3>
                <p className="text-sm text-muted-foreground">
                  Téléchargez les images du produit
                </p>
              </div>
              <UploadFiles
                onFilesChange={handleFilesChange}
                initialFiles={[]}
              />
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Informations générales</h3>
                <p className="text-sm text-muted-foreground">
                  Nom, description et prix du produit
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <Input placeholder="Sous-titre du produit" {...field} />
                      </FormControl>
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
                        <Input placeholder="Slogan du produit" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Description</h3>
                <p className="text-sm text-muted-foreground">
                  Description détaillée du produit
                </p>
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Description détaillée du produit"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Catégories et parfums */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Catégories et parfums</h3>
                <p className="text-sm text-muted-foreground">
                  Assignez une catégorie et un parfum au produit
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        Catégorie
                        <Dialog
                          open={isCategoryDialogOpen}
                          onOpenChange={setIsCategoryDialogOpen}
                        >
                          <DialogTrigger asChild>
                            <Button type="button" variant="outline" size="sm">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>
                                Créer une nouvelle catégorie
                              </DialogTitle>
                            </DialogHeader>
                            <CreateCategoryForm
                              onSuccess={() => setIsCategoryDialogOpen(false)}
                            />
                          </DialogContent>
                        </Dialog>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
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
                      <FormLabel className="flex items-center gap-2">
                        Parfum
                        <Dialog
                          open={isScentDialogOpen}
                          onOpenChange={setIsScentDialogOpen}
                        >
                          <DialogTrigger asChild>
                            <Button type="button" variant="outline" size="sm">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Créer un nouveau parfum</DialogTitle>
                            </DialogHeader>
                            <CreateScentForm />
                          </DialogContent>
                        </Dialog>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
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
            </div>

            {/* Actions */}
            <CardFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onSuccess}
                disabled={createProduct.isPending}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={createProduct.isPending}>
                {createProduct.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  "Créer le produit"
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
