"use client";

import { useState, useEffect } from "react";
import { useUpdateProduct } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface EditProductFormProps {
  productId: string;
  onSuccess: () => void;
}

export function EditProductForm({
  productId,
  onSuccess,
}: EditProductFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    imageUrl: "",
  });

  const updateProduct = useUpdateProduct();

  useEffect(() => {
    // Charger les données du produit
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${productId}`);
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération du produit");
        }
        const product = await response.json();
        setFormData({
          name: product.name,
          description: product.description,
          price: product.price.toString(),
          imageUrl: product.imageUrl,
        });
      } catch {
        console.error("Erreur lors de la récupération du produit");
      }
    };

    fetchProduct();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProduct.mutateAsync({
        id: productId,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        imageUrl: formData.imageUrl,
      });
      onSuccess();
    } catch {
      // L'erreur est gérée par le hook useUpdateProduct
    }
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
        <Label htmlFor="imageUrl">URL de l&apos;image</Label>
        <Input
          id="imageUrl"
          value={formData.imageUrl}
          onChange={(e) =>
            setFormData({ ...formData, imageUrl: e.target.value })
          }
          required
        />
      </div>

      <Button type="submit" className="w-full">
        Mettre à jour le produit
      </Button>
    </form>
  );
}
