"use client";

import { useState, useCallback } from "react";
import { useUpdateProduct } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Image as PrismaImage, Scent, Category } from "@/generated/client";
import UploadFiles from "@/components/upload-files";
import { FileMetadata } from "@/hooks/use-file-upload";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { Info, Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCategories } from "@/hooks/useCategories";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CreateScentForm from "@/app/(private)/admin/scents/create-scent-form";
import CreateCategoryForm from "@/app/(private)/admin/categories/create-category-form";
import { useQueryClient } from "@tanstack/react-query";

interface EditProductFormProps {
  productId: string;
  onSuccess: () => void;
  initialData: {
    id: string;
    name: string;
    description: string;
    price: number;
    subTitle: string;
    slogan: string;
    category: {
      id: string;
      name: string;
      description: string;
      icon: string;
      color: string;
    };
    arAnimation: string;
    scent: Scent;
    images: PrismaImage[];
  };
  scents: Scent[];
}

type ProductField = {
  name: string;
  description: string;
  price: number;
  subTitle: string;
  slogan: string;
  categoryId: string;
  arAnimation: string;
};

type FieldValue = string | number;

export default function EditProductForm({
  productId,
  onSuccess,
  initialData,
  scents,
}: EditProductFormProps) {
  const [editingProduct, setEditingProduct] = useState({
    ...initialData,
    categoryId: initialData.category.id,
  });
  const [selectedFiles, setSelectedFiles] = useState<FileMetadata[]>(() =>
    initialData.images.map((image) => ({
      id: image.id,
      name: image.url.split("/").pop() || "image",
      size: 0,
      type: "image/jpeg",
      url: image.url,
    }))
  );
  const [selectedScentId, setSelectedScentId] = useState(initialData.scent.id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const updateProduct = useUpdateProduct();
  const { data: categories = [] } = useCategories();
  const queryClient = useQueryClient();

  const validateField = useCallback(
    (name: keyof ProductField, value: FieldValue) => {
      if (typeof value !== "string" && typeof value !== "number") {
        return "Type de valeur invalide";
      }

      switch (name) {
        case "name":
        case "subTitle":
        case "slogan":
        case "arAnimation":
          return typeof value === "string" && value.length < 3
            ? "Le champ doit contenir au moins 3 caractères"
            : "";
        case "price":
          return typeof value === "number" && value <= 0
            ? "Le prix doit être supérieur à 0"
            : "";
        case "description":
          return typeof value === "string" && value.length < 10
            ? "La description doit contenir au moins 10 caractères"
            : "";
        default:
          return "";
      }
    },
    []
  );

  const handleFieldChange = useCallback(
    (name: keyof ProductField, value: FieldValue) => {
      setEditingProduct((prev) => ({ ...prev, [name]: value }));
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    },
    [validateField]
  );

  const handleFilesChange = useCallback((files: FileMetadata[]) => {
    setSelectedFiles(files);
  }, []);

  const uploadNewImages = useCallback(async (files: FileMetadata[]) => {
    const uploadPromises = files.map(async (file) => {
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
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (isSubmitting) return;

      const newErrors: Record<string, string> = {};
      Object.entries(editingProduct).forEach(([key, value]) => {
        if (key === "category" || key === "scent" || key === "images") return;
        const error = validateField(
          key as keyof ProductField,
          value as FieldValue
        );
        if (error) newErrors[key] = error;
      });

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        toast.error("Veuillez corriger les erreurs avant de soumettre");
        return;
      }

      setIsSubmitting(true);
      try {
        const newFiles = selectedFiles.filter(
          (file) => !file.url.startsWith("http")
        );

        const uploadedUrls =
          newFiles.length > 0 ? await uploadNewImages(newFiles) : [];

        const finalImageUrls = selectedFiles.map((file) => {
          if (file.url.startsWith("http")) return file.url;
          const newUrl = uploadedUrls.shift();
          if (!newUrl) throw new Error("Échec de l'upload de l'image");
          return newUrl;
        });

        const data = {
          id: productId,
          name: editingProduct.name,
          description: editingProduct.description,
          price: editingProduct.price,
          subTitle: editingProduct.subTitle,
          slogan: editingProduct.slogan,
          categoryId: editingProduct.categoryId,
          arAnimation: editingProduct.arAnimation,
          scentId: selectedScentId,
          images: finalImageUrls.map((url) => ({ url })),
        };

        await updateProduct.mutateAsync(data);
        toast.success("Produit mis à jour avec succès");
        onSuccess();
      } catch (error) {
        console.error("Erreur lors de la mise à jour du produit:", error);
        toast.error("Erreur lors de la mise à jour du produit");
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      editingProduct,
      isSubmitting,
      productId,
      selectedFiles,
      selectedScentId,
      updateProduct,
      uploadNewImages,
      validateField,
      onSuccess,
    ]
  );

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.3 }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div className="space-y-2" variants={itemVariants}>
          <div className="flex items-center gap-2">
            <Label htmlFor="name">Nom</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Le nom principal du produit</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="name"
            value={editingProduct.name}
            onChange={(e) => handleFieldChange("name", e.target.value)}
            required
            disabled={isSubmitting}
            className={cn(errors.name && "border-red-500")}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </motion.div>

        <motion.div className="space-y-2" variants={itemVariants}>
          <div className="flex items-center gap-2">
            <Label htmlFor="price">Prix</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Le prix en euros</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={editingProduct.price}
            onChange={(e) => handleFieldChange("price", Number(e.target.value))}
            required
            disabled={isSubmitting}
            className={cn(errors.price && "border-red-500")}
          />
          {errors.price && (
            <p className="text-sm text-red-500">{errors.price}</p>
          )}
        </motion.div>

        <motion.div className="space-y-2" variants={itemVariants}>
          <div className="flex items-center gap-2">
            <Label htmlFor="subTitle">Sous-titre</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Un sous-titre court et accrocheur</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="subTitle"
            value={editingProduct.subTitle}
            onChange={(e) => handleFieldChange("subTitle", e.target.value)}
            required
            disabled={isSubmitting}
            className={cn(errors.subTitle && "border-red-500")}
          />
          {errors.subTitle && (
            <p className="text-sm text-red-500">{errors.subTitle}</p>
          )}
        </motion.div>

        <motion.div className="space-y-2" variants={itemVariants}>
          <div className="flex items-center gap-2">
            <Label htmlFor="slogan">Slogan</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Une phrase accrocheuse pour le produit</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="slogan"
            value={editingProduct.slogan}
            onChange={(e) => handleFieldChange("slogan", e.target.value)}
            required
            disabled={isSubmitting}
            className={cn(errors.slogan && "border-red-500")}
          />
          {errors.slogan && (
            <p className="text-sm text-red-500">{errors.slogan}</p>
          )}
        </motion.div>

        <motion.div className="space-y-2" variants={itemVariants}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="category">Catégorie</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>La catégorie principale du produit</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle catégorie
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Créer une nouvelle catégorie</DialogTitle>
                </DialogHeader>
                <CreateCategoryForm
                  onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ["categories"] });
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
          <Select
            value={editingProduct.categoryId}
            onValueChange={(value) => handleFieldChange("categoryId", value)}
            disabled={isSubmitting}
          >
            <SelectTrigger
              className={cn(errors.categoryId && "border-red-500")}
            >
              <SelectValue placeholder="Sélectionner une catégorie" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category: Category) => (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span>{category.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.categoryId && (
            <p className="text-sm text-red-500">{errors.categoryId}</p>
          )}
        </motion.div>

        <motion.div className="space-y-2" variants={itemVariants}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="scent">Parfum</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Le parfum principal du produit</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau parfum
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Créer un nouveau parfum</DialogTitle>
                </DialogHeader>
                <CreateScentForm
                  onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ["scents"] });
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
          <Select
            value={selectedScentId}
            onValueChange={setSelectedScentId}
            disabled={isSubmitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un parfum" />
            </SelectTrigger>
            <SelectContent>
              {scents.map((scent) => (
                <SelectItem key={scent.id} value={scent.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: scent.color }}
                    />
                    <span>{scent.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        <motion.div className="space-y-2" variants={itemVariants}>
          <div className="flex items-center gap-2">
            <Label htmlFor="arAnimation">Animation AR</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    L&apos;identifiant de l&apos;animation en réalité augmentée
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="arAnimation"
            value={editingProduct.arAnimation}
            onChange={(e) => handleFieldChange("arAnimation", e.target.value)}
            required
            disabled={isSubmitting}
            className={cn(errors.arAnimation && "border-red-500")}
          />
          {errors.arAnimation && (
            <p className="text-sm text-red-500">{errors.arAnimation}</p>
          )}
        </motion.div>
      </div>

      <motion.div className="space-y-2" variants={itemVariants}>
        <div className="flex items-center gap-2">
          <Label htmlFor="description">Description</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Une description détaillée du produit</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Textarea
          id="description"
          value={editingProduct.description}
          onChange={(e) => handleFieldChange("description", e.target.value)}
          required
          disabled={isSubmitting}
          className={cn(
            "min-h-[150px]",
            errors.description && "border-red-500"
          )}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description}</p>
        )}
      </motion.div>

      <motion.div className="space-y-2" variants={itemVariants}>
        <div className="flex items-center gap-2">
          <Label>Images</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Les images du produit (glissez-déposez ou cliquez pour
                  sélectionner)
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <UploadFiles
          initialFiles={selectedFiles}
          onFilesChange={handleFilesChange}
          disabled={isSubmitting}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Mise à jour en cours...
            </>
          ) : (
            "Mettre à jour le produit"
          )}
        </Button>
      </motion.div>
    </motion.form>
  );
}
