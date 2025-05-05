"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Product, ProductVariant, Scent } from "@/generated/client";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCartIcon } from "lucide-react";

interface ProductWithDetails extends Product {
  variants: (ProductVariant & {
    scent: Scent;
  })[];
  subTitle: string;
}

interface ProductCardProps {
  product: ProductWithDetails;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [selectedScent, setSelectedScent] = useState<Scent | null>(null);

  useEffect(() => {
    if (product.variants.length > 0 && !selectedScent) {
      setSelectedScent(product.variants[0].scent);
    }
  }, [product.variants, selectedScent]);

  const handleAddToCart = () => {
    if (!selectedScent) {
      toast.error("Veuillez sélectionner un parfum");
      return;
    }

    const variant = product.variants.find(
      (v) => v.scent.id === selectedScent.id
    );

    if (!variant) {
      toast.error("Variant non trouvé");
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: variant.imageUrl,
      selectedScent: selectedScent,
      description: product.description,
      variants: product.variants,
      reviews: [],
      createdAt: new Date(product.createdAt).toISOString(),
    });

    toast.success("Produit ajouté au panier");
  };

  return (
    <Card className="overflow-hidden p-0 ">
      <Link href={`/products/${product.id}`}>
        <div className="aspect-square  relative">
          {selectedScent && (
            <Image
              src={product.imageUrl || ""}
              alt={product.name}
              className="object-cover w-full h-full"
              width={500}
              height={500}
            />
          )}
        </div>
      </Link>
      <CardContent>
        <Link href={`/products/${product.id}`} className="group">
          <div className="flex relative  justify-between gap-2">
            <div className="w-2/3 gap-2">
              <h3 className="font-semibold group-hover:underline text-lg">
                {product.name}
              </h3>
              <p className="text-muted-foreground text-sm mt-1">
                {product.description}
              </p>
            </div>
            <div className="font-semibold text-lg mt-2">
              {product.price.toFixed(2)} €
            </div>
          </div>
        </Link>

        <div className="flex justify-between gap-2">
          <div className="w-2/3 gap-2">
            <p className="text-muted-foreground text-sm">
              {product.variants.map((variant) => variant.scent.name).length >
                1 &&
                product.variants.map((variant) => variant.scent.name).length}
              {"  "}
              parfums disponibles
            </p>
          </div>
        </div>

        {product.variants.length > 0 && (
          <div className="mt-4">
            <Select
              value={selectedScent?.id}
              onValueChange={(value) => {
                const variant = product.variants.find(
                  (v) => v.scent.id === value
                );
                if (variant) {
                  setSelectedScent(variant.scent);
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choisir un parfum" />
              </SelectTrigger>
              <SelectContent>
                {product.variants.map((variant) => (
                  <SelectItem
                    key={`${product.id}-${variant.id}`}
                    value={variant.scent.id}
                  >
                    {variant.scent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          size="lg"
          onClick={handleAddToCart}
          disabled={!selectedScent}
        >
          <ShoppingCartIcon className="w-4 h-4 mr-2" /> Ajouter au panier
        </Button>
      </CardFooter>
    </Card>
  );
}

export default ProductCard;
