"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import {
  Image as PrismaImage,
  Product,
  Review,
  Scent,
  Category,
} from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCartIcon, StarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type ProductWithDetails = Product & {
  scent: Scent;
  category: Category;
  images: PrismaImage[];
  reviews: Review[];
  averageRating: number;
  reviewCount: number;
};

export function ProductCard({ product }: { product: ProductWithDetails }) {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    if (!product.scent) {
      toast.error("Aucun parfum associé à ce produit");
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.images[0]?.url || "",
      selectedScent: product.scent,
      description: product.description,
      subTitle: product.subTitle,
      category: product.category,
      createdAt: new Date(product.createdAt),
      updatedAt: new Date(product.updatedAt),
      deletedAt: product.deletedAt ? new Date(product.deletedAt) : null,
      quantity: 1,
    });

    toast.success("Produit ajouté au panier");
  };

  return (
    <Card className="overflow-hidden border-border justify-between pt-0">
      <Link href={`/products/${product.id}`}>
        <div className="aspect-square relative">
          {product.images[0] && (
            <Image
              src={product.images[0].url}
              alt={product.name}
              className="object-cover w-full h-full"
              width={500}
              height={500}
            />
          )}
        </div>
      </Link>
      <CardHeader>
        <div className="flex relative items-center justify-between">
          <div className="w-2/3 gap-2">
            <CardTitle>{product.name}</CardTitle>
          </div>
          <div className="font-semibold">{product.price.toFixed(2)} €</div>
        </div>
        <div className="flex items-center gap-4">
          {product.reviewCount > 0 && (
            <div className="flex items-center gap-2">
              <StarIcon className="w-4 h-4 text-yellow-500 fill-current" />
              <div className="">{product.reviewCount} avis</div>
            </div>
          )}
          {product.category && (
            <Badge
              variant="default"
              style={{
                backgroundColor: product.category.color,
              }}
            >
              <span className=" text-white">{product.category.name}</span>
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription>{product.subTitle}</CardDescription>
        {product.scent && (
          <div className="mt-4">
            <span className="font-semibold">Parfum : </span>
            {product.scent.name}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          size="lg"
          onClick={handleAddToCart}
          disabled={!product.scent}
        >
          <ShoppingCartIcon className="w-4 h-4 mr-2" /> Ajouter au panier
        </Button>
      </CardFooter>
    </Card>
  );
}

export default ProductCard;
