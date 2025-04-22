"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { HeartIcon, Star } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { ProductWithDetails } from "./[uid]/types";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

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

  return (
    <Card className="w-full border-none pt-0 group relative space-y-4 overflow-hidden">
      <figure className="group-hover:opacity-90">
        <Image
          className="w-full h-80 object-cover"
          src={product.imageUrl}
          width={300}
          height={500}
          priority
          alt={product.name}
        />
      </figure>
      <CardContent className="px-4 py-0">
        <div className="flex justify-between">
          <div>
            <h3 className="text-xl font-semibold">
              <Link href={`/products/${product.id}`}>
                {/* <span aria-hidden="true" className="absolute mb-20 inset-0" /> */}
                {product.name}
              </Link>
            </h3>
            <div className="flex items-center gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`size-4 ${
                    star <= Math.round(product.averageRating || 0)
                      ? "text-yellow-500 fill-yellow-500"
                      : "text-gray-300 fill-gray-300"
                  }`}
                />
              ))}
              <span className="text-sm text-muted-foreground">
                ({product.reviewCount || 0})
              </span>
            </div>
          </div>
          <p className="text-xl font-semibold">{product.price.toFixed(2)}€</p>
        </div>

        {product.variants.length > 1 && (
          <div className="mt-4">
            <Select
              value={selectedScent?.id}
              onValueChange={handleScentChange}
              defaultValue={product.variants[0]?.scent.id}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un parfum" />
              </SelectTrigger>
              <SelectContent>
                {product.variants.map((variant) => (
                  <SelectItem key={variant.id} value={variant.scent.id}>
                    {variant.scent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex w-full items-center justify-between gap-2">
        <Button className="w-1/2" variant="outline" size="lg">
          <HeartIcon className="size-4" />
          <span>Favoris</span>
        </Button>
        <Button
          className="w-1/2"
          onClick={handleAddToCart}
          variant="default"
          size="lg"
          disabled={!selectedScent}
        >
          Ajouter au panier
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
