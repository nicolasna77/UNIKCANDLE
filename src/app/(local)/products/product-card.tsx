"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { ProductWithDetails } from "../../../types/types";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type ProductCardProps = {
  product: ProductWithDetails;
};

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const [selectedScent, setSelectedScent] = useState(
    product.variants[0]?.scent
  );

  const handleAddToCart = () => {
    if (selectedScent) {
      addToCart({ ...product, selectedScent });
      toast.success(`${product.name} ajouté au panier`);
    } else {
      toast.error("Veuillez sélectionner un parfum");
    }
  };

  const handleScentChange = (value: string) => {
    const scent = product.variants.find((v) => v.scent.id === value)?.scent;
    if (scent) {
      setSelectedScent(scent);
    }
  };

  // Reset selectedScent when product changes
  useEffect(() => {
    if (product.variants && product.variants.length > 0) {
      setSelectedScent(product.variants[0].scent);
    }
  }, [product.variants]);

  return (
    <Card className="w-full h-full pt-0 overflow-hidden border shadow-sm hover:shadow-md transition-all duration-300 flex flex-col">
      <Link
        href={`/products/${product.id}`}
        className="overflow-hidden"
        aria-label={`Voir les détails de ${product.name}`}
      >
        <div className="relative  h-90 overflow-hidden group">
          <Image
            className="w-full h-full  object-cover transition-transform duration-300 group-hover:scale-105"
            src={product.imageUrl || "/placeholder.svg"}
            width={400}
            height={400}
            priority
            quality={90}
            alt={product.name}
          />
          {new Date(product.createdAt) >
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) && (
            <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded-md">
              Nouveau
            </span>
          )}
        </div>
      </Link>

      <CardContent className="flex-grow flex flex-col gap-3 p-4">
        <div className="flex justify-between items-start">
          <div>
            <Link
              href={`/products/${product.id}`}
              className="hover:underline focus:outline-none focus:underline"
            >
              <h3 className="text-lg font-medium line-clamp-2">
                {product.name}
              </h3>
            </Link>
            <div className="flex items-center gap-1 mt-1">
              <div
                className="flex"
                aria-label={`Note: ${product.averageRating || 0} sur 5`}
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={14}
                    className={cn(
                      "text-gray-300",
                      star <= Math.round(product.averageRating || 0) &&
                        "text-yellow-500 fill-yellow-500"
                    )}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground ml-1">
                ({product.reviewCount || 0})
              </span>
            </div>
          </div>
          <p className="text-lg font-semibold">{product.price.toFixed(2)}€</p>
        </div>

        {product.variants.length > 0 && (
          <div className="mt-1 w-full">
            <Label className="text-sm font-medium mb-1 block">Parfum</Label>
            <RadioGroup
              value={selectedScent?.id}
              onValueChange={handleScentChange}
              defaultValue={product.variants[0]?.scent.id}
              className="grid grid-cols-2 gap-2 px-2"
            >
              {product.variants.map((variant) => (
                <div key={`${product.id}-${variant.id}`} className="relative">
                  <Label
                    htmlFor={`scent-${product.id}-${variant.scent.id}`}
                    className={cn(
                      "flex items-center justify-center text-sm border rounded-md py-1.5 px-2 cursor-pointer transition-colors",
                      "hover:bg-muted/50",
                      selectedScent?.id === variant.scent.id
                        ? "bg-primary/10 border-primary"
                        : "border-input"
                    )}
                  >
                    <RadioGroupItem
                      value={variant.scent.id}
                      id={`scent-${product.id}-${variant.scent.id}`}
                      className="sr-only"
                    />
                    {variant.scent.name}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="lg"
          className="w-full cursor-pointer"
          aria-label="Ajouter aux favoris"
        >
          <Heart className="size-4 mr-1.5" />
          <span className="hidden sm:inline">Favoris</span>
        </Button>
        <Button
          onClick={handleAddToCart}
          variant="default"
          size="lg"
          className="w-full cursor-pointer"
          disabled={!selectedScent}
          aria-label="Ajouter au panier"
        >
          <ShoppingCart className="size-4 mr-1.5" />
          <span className="hidden sm:inline">Panier</span>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
