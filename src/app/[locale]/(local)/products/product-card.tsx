"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Image as PrismaImage,
  Product,
  Review,
  Scent,
  Category,
} from "@prisma/client";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { StarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslations, useLocale } from "next-intl";
import {
  getProductTranslation,
  getCategoryTranslation,
  getScentTranslation,
} from "@/lib/product-translation";

type ProductWithDetails = Product & {
  scent: Scent;
  category: Category;
  images: PrismaImage[];
  reviews: Review[];
  averageRating: number;
  reviewCount: number;
};

export function ProductCard({ product }: { product: ProductWithDetails }) {
  const t = useTranslations("products");
  const locale = useLocale();

  // Get translated fields based on current locale
  const translatedName = getProductTranslation(product, "name", locale);

  const translatedSubTitle = getProductTranslation(product, "subTitle", locale);
  const translatedCategoryName = getCategoryTranslation(
    product.category,
    "name",
    locale
  );
  const translatedScentName = product.scent
    ? getScentTranslation(product.scent, "name", locale)
    : "";

  return (
    <article itemScope itemType="https://schema.org/Product">
      <Card className="overflow-hidden border-border h-full justify-between pt-0">
        <Link href={`/products/${product.id}`} className="block  ">
          <div className="aspect-square relative">
            {product.images[0] && (
              <Image
                src={product.images[0].url}
                alt={translatedName}
                className="object-cover"
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                itemProp="image"
              />
            )}
          </div>
        </Link>

        <CardHeader className="space-y-3">
          <CardTitle itemProp="name" className="line-clamp-2">
            {translatedName}
          </CardTitle>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {product.category && (
                <Badge
                  variant="default"
                  style={{
                    backgroundColor: product.category.color,
                  }}
                >
                  <span className="text-white">{translatedCategoryName}</span>
                </Badge>
              )}
            </div>

            <div
              className="shrink-0"
              itemProp="offers"
              itemScope
              itemType="https://schema.org/Offer"
            >
              <meta itemProp="priceCurrency" content="EUR" />
              <meta itemProp="price" content={product.price.toFixed(2)} />
              {product.reviewCount > 0 && (
                <div
                  className="flex items-center gap-1.5"
                  itemProp="aggregateRating"
                  itemScope
                  itemType="https://schema.org/AggregateRating"
                >
                  <StarIcon className="w-4 h-4 text-yellow-500 fill-current" />
                  <meta
                    itemProp="ratingValue"
                    content={product.averageRating.toFixed(1)}
                  />
                  <meta
                    itemProp="reviewCount"
                    content={product.reviewCount.toString()}
                  />
                  <span className="text-sm font-medium">
                    {product.reviewCount} {t("card.reviews")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription itemProp="description">
            {translatedSubTitle}
          </CardDescription>
          {product.scent && (
            <div className="mt-4">
              <span className="font-semibold">{t("card.scentLabel")}</span>
              {translatedScentName}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex items-center justify-end">
          <p className="text-lg font-semibold flex sm:text-xl">
            {product.price.toFixed(2)} €
          </p>
        </CardFooter>
      </Card>
    </article>
  );
}

export default ProductCard;
