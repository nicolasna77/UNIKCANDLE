"use client";

import Link from "next/link";
import Image from "next/image";
import { Button, buttonVariants } from "@/components/ui/button";
import { HeartIcon, Star } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { ProductWithDetails } from "./[uid]/types";

type ProductCardProps = {
  product: ProductWithDetails;
};

const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <Card className="w-full pt-0 group relative space-y-4 overflow-hidden">
      <figure className="group-hover:opacity-90">
        <Button
          variant="ghost"
          size="icon"
          className="bg-white/70 absolute top-3 end-3 rounded-full dark:text-black z-10"
        >
          <HeartIcon className="size-4" />
        </Button>
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
            <h3 className="text-lg">
              <Link href={`/products/${product.id}`}>
                <span aria-hidden="true" className="absolute inset-0" />
                {product.name}
              </Link>
            </h3>
            <div className="flex items-center gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`size-3 ${
                    star <= Math.round(product.averageRating || 0)
                      ? "text-yellow-500 fill-yellow-500"
                      : "text-gray-300 fill-gray-300"
                  }`}
                />
              ))}
              <span className="text-xs text-muted-foreground">
                ({product.reviewCount || 0})
              </span>
            </div>
          </div>
          <p className="text-lg font-semibold">{product.price.toFixed(2)}€</p>
        </div>
      </CardContent>
      <CardFooter className=" ">
        <Link
          href={`/products/${product.id}`}
          className={buttonVariants({
            variant: "outline",
            className: "w-full ",
          })}
        >
          Voir plus
        </Link>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
