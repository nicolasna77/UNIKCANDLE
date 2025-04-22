"use client";

import { useState } from "react";
import { useCreateProduct } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";

interface CreateProductFormProps {
  onSuccess: () => void;
}

interface Scent {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  model3dUrl: string;
}

export function CreateProductForm({ onSuccess }: CreateProductFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    imageUrl: "",
    variants: [] as { scentId: string; imageUrl: string }[],
  });

  const { data: scents = [] } = useQuery({
    queryKey: ["scents"],
    queryFn: async () => {
      const response = await fetch("/api/scents");
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des senteurs");
      }
      return response.json();
    },
  });

  const createProduct = useCreateProduct();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProduct.mutateAsync({
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        imageUrl: formData.imageUrl,
        variants: formData.variants,
      });
      onSuccess();
    } catch {
      // L'erreur est gérée par le hook useCreateProduct
    }
  };

  const handleAddVariant = () => {
    setFormData({
      ...formData,
      variants: [...formData.variants, { scentId: "", imageUrl: "" }],
    });
  };

  const handleRemoveVariant = (index: number) => {
    setFormData({
      ...formData,
      variants: formData.variants.filter((_, i) => i !== index),
    });
  };

  const handleVariantChange = (
    index: number,
    field: "scentId" | "imageUrl",
    value: string
  ) => {
    const newVariants = [...formData.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFormData({ ...formData, variants: newVariants });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nom du produit</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">Prix (€)</Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageUrl">URL de l&apos;image principale</Label>
        <Input
          id="imageUrl"
          value={formData.imageUrl}
          onChange={(e) =>
            setFormData({ ...formData, imageUrl: e.target.value })
          }
          required
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Variantes de senteurs</Label>
          <Button type="button" onClick={handleAddVariant}>
            Ajouter une senteur
          </Button>
        </div>

        {formData.variants.map((variant, index) => (
          <div key={index} className="space-y-2 p-4 border rounded-lg">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Variante {index + 1}</h4>
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleRemoveVariant(index)}
              >
                Supprimer
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Senteur</Label>
              <Select
                value={variant.scentId}
                onValueChange={(value) =>
                  handleVariantChange(index, "scentId", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une senteur" />
                </SelectTrigger>
                <SelectContent>
                  {scents.map((scent: Scent) => (
                    <SelectItem key={scent.id} value={scent.id}>
                      {scent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>URL de l&apos;image de la variante</Label>
              <Input
                value={variant.imageUrl}
                onChange={(e) =>
                  handleVariantChange(index, "imageUrl", e.target.value)
                }
                required
              />
            </div>
          </div>
        ))}
      </div>

      <Button type="submit" className="w-full">
        Créer le produit
      </Button>
    </form>
  );
}
