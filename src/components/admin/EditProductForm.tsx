"use client";

import { useState } from "react";
import { useUpdateProduct } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";
import Image from "next/image";
import { Product } from "@/generated/client";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

interface EditProductFormProps {
  productId: string;
  onSuccess: () => void;
  initialData: Product;
}

const EditProductForm = ({
  productId,
  onSuccess,
  initialData,
}: EditProductFormProps) => {
  const [editingProduct, setEditingProduct] = useState<Product>(initialData);
  const [isUploading, setIsUploading] = useState(false);
  const updateProduct = useUpdateProduct();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("L'image ne doit pas dépasser 5MB");
      }

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/products/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors du téléchargement");
      }

      return response.json();
    },
    onSuccess: (data) => {
      setEditingProduct((prev) => ({ ...prev, imageUrl: data.url }));
      toast.success("Image téléchargée avec succès");
    },
    onError: (error: Error) => {
      console.error("Erreur lors du téléchargement:", error);
      toast.error(error.message || "Erreur lors du téléchargement de l'image");
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Le fichier doit être une image");
      return;
    }

    setIsUploading(true);
    try {
      await uploadMutation.mutateAsync(file);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProduct.mutateAsync({
        id: productId,
        name: editingProduct.name,
        description: editingProduct.description,
        price: editingProduct.price,
        imageUrl: editingProduct.imageUrl,
      });
      onSuccess();
    } catch {
      // L'erreur est gérée par le hook useUpdateProduct
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nom</Label>
        <Input
          id="name"
          value={editingProduct.name}
          onChange={(e) =>
            setEditingProduct({
              ...editingProduct,
              name: e.target.value,
            })
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={editingProduct.description}
          onChange={(e) =>
            setEditingProduct({
              ...editingProduct,
              description: e.target.value,
            })
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">Prix</Label>
        <Input
          id="price"
          type="number"
          value={editingProduct.price}
          onChange={(e) =>
            setEditingProduct({
              ...editingProduct,
              price: Number(e.target.value),
            })
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageUrl">Image du produit</Label>
        <div className="flex items-center gap-2">
          <Input
            id="imageUrl"
            value={editingProduct.imageUrl}
            onChange={(e) =>
              setEditingProduct({
                ...editingProduct,
                imageUrl: e.target.value,
              })
            }
            readOnly
          />
          <Button
            variant="outline"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("image-upload")?.click();
            }}
            disabled={isUploading}
          >
            <Upload className="mr-2 h-4 w-4" />
            {isUploading ? "Téléchargement..." : "Télécharger"}
          </Button>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>
        {editingProduct.imageUrl && (
          <div className="mt-2">
            <Image
              src={editingProduct.imageUrl}
              alt="Aperçu"
              width={100}
              height={100}
              className="rounded-md"
            />
          </div>
        )}
      </div>

      <Button type="submit" className="w-full">
        Mettre à jour le produit
      </Button>
    </form>
  );
};

export default EditProductForm;
