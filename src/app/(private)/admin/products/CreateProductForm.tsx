"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState, useTransition } from "react";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Loader2, Upload, Info, Package, Tag, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchCategories, type CategoryWithProducts } from "@/services/categories";
import { fetchScents } from "@/services/scents";
import { type Scent } from "@prisma/client";
import UploadFiles from "@/components/upload-files";
import { FileMetadata } from "@/hooks/use-file-upload";
import CreateScentForm from "@/app/(private)/admin/scents/create-scent-form";
import CreateCategoryForm from "@/app/(private)/admin/categories/create-category-form";
import { productSchema, type ProductFormData } from "@/lib/admin-schemas";
import { Category } from "@prisma/client";
import { createProductFromJSON } from "@/app/actions/products";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CreateProductFormProps {
  onSuccess: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EMPTY_FILES: FileMetadata[] = [];

export default function CreateProductForm({
  onSuccess,
  open,
  onOpenChange,
}: CreateProductFormProps) {
  const queryClient = useQueryClient();
  const [selectedFiles, setSelectedFiles] = useState<FileMetadata[]>([]);
  const [isScentDialogOpen, setIsScentDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { data: categories = [] } = useQuery<CategoryWithProducts[]>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });
  const { data: scents = [] } = useQuery<Scent[]>({
    queryKey: ["scents"],
    queryFn: fetchScents,
  });

  const form = useForm({
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
      messageType: "audio" as const,
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

  const onSubmit = async (values: ProductFormData) => {
    startTransition(async () => {
      try {
        console.log("🚀 Début de la soumission du formulaire");
        console.log("📝 Valeurs du formulaire:", values);
        console.log("📁 Fichiers sélectionnés:", selectedFiles);

        // Vérifier que les champs requis sont présents
        if (
          !values.name ||
          !values.description ||
          !values.categoryId ||
          !values.scentId
        ) {
          console.error("❌ Champs requis manquants");
          toast.error("Veuillez remplir tous les champs requis");
          return;
        }

        // Gérer l'upload des images
        console.log("📤 Upload des images en cours...");
        const uploadedUrls =
          selectedFiles.length > 0 ? await uploadImages(selectedFiles) : [];
        console.log("✅ Images uploadées:", uploadedUrls);

        // Utiliser la première image comme imageUrl principale et toutes comme images
        const finalData = {
          ...values,
          arAnimation: values.arAnimation || "default",
          imageUrl: uploadedUrls[0] || "",
          images: uploadedUrls.map((url) => ({ url })),
        };

        console.log("📦 Données finales à envoyer:", finalData);

        // Appel de la Server Action (version JSON)
        const result = await createProductFromJSON(finalData);

        if (result.success) {
          // Invalidation manuelle du cache React Query
          queryClient.invalidateQueries({ queryKey: ["products"] });
          queryClient.invalidateQueries({ queryKey: ["admin-products"] });

          toast.success("Produit créé avec succès");
          form.reset();
          setSelectedFiles([]);
          onOpenChange(false);
          onSuccess();
          console.log("✅ Produit créé avec succès!");
        } else {
          // Afficher les erreurs de validation
          if (result.fieldErrors) {
            Object.entries(result.fieldErrors).forEach(([field, errors]) => {
              form.setError(field as keyof ProductFormData, {
                message: errors[0],
              });
            });
          }
          toast.error(result.error || "Erreur lors de la création du produit");
        }
      } catch (error) {
        console.error("❌ Erreur lors de la création:", error);
        toast.error("Erreur lors de la création du produit");
      }
    });
  };

  const handleFilesChange = (files: FileMetadata[]) => {
    console.log("📸 Fichiers changés:", files);
    setSelectedFiles(files);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Créer un nouveau produit
          </DialogTitle>
          <DialogDescription>
            Remplissez les informations pour créer un nouveau produit dans le catalogue
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
                initialFiles={EMPTY_FILES}
              />
            </div>

            <Separator />
            {/* Informations générales */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold">Informations générales *</h3>
                  <p className="text-sm text-muted-foreground">
                    Nom, description et prix du produit
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        Le nom principal affiché aux clients
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                        Court texte descriptif
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
                        Phrase d&apos;accroche (optionnel)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold">Description *</FormLabel>
                    <FormControl>
                      <TipTapEditor
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Décrivez votre produit en détail : caractéristiques, utilisation, bienfaits..."
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormDescription>
                      Minimum 10 caractères - Soyez précis et engageant
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                      <FormLabel className="flex items-center gap-2">
                        Catégorie *
                        <Dialog
                          open={isCategoryDialogOpen}
                          onOpenChange={setIsCategoryDialogOpen}
                        >
                          <DialogTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-6 px-2"
                              disabled={isPending}
                            >
                              <Plus className="h-3 w-3" />
                              <span className="sr-only">Nouvelle catégorie</span>
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
                  name="scentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        Parfum *
                        <Dialog
                          open={isScentDialogOpen}
                          onOpenChange={setIsScentDialogOpen}
                        >
                          <DialogTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-6 px-2"
                              disabled={isPending}
                            >
                              <Plus className="h-3 w-3" />
                              <span className="sr-only">Nouveau parfum</span>
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
                        disabled={isPending}
                      >
                        <FormControl>
                          <SelectTrigger aria-required="true">
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
                      <FormDescription>
                        Fragrance de la bougie
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
                        defaultValue={field.value}
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

            {/* Actions */}
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  setSelectedFiles([]);
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
                    Création...
                  </>
                ) : (
                  <>
                    <Package className="mr-2 h-4 w-4" aria-hidden="true" />
                    Créer le produit
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
