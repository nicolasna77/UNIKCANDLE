"use client";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import { Card } from "../ui/card";
import { Category, Product } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { fetchCategories, type CategoryWithProducts } from "@/services/categories";
import { buttonVariants } from "../ui/button";
import Image from "next/image";
import { useLocale } from "next-intl";
import { getCategoryTranslation } from "@/lib/product-translation";

interface CategoryWithImage extends Omit<Category, "imageUrl"> {
  imageUrl?: string | null;
  products: Product[];
}

const CategoriesSection = () => {
  const locale = useLocale();
  const { data: categories, isLoading, error } = useQuery<CategoryWithProducts[]>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2
            className={` text-3xl lg:text-4xl font-bold text-foreground mb-4`}
          >
            Découvrez notre collection
          </h2>
          <p className="text-muted-foreground text-balance text-lg">
            Explorez nos différentes univers et enregistrez votre message audio
            directement sur notre site.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 items-center lg:grid-cols-3 gap-6">
          {isLoading ? (
            // Skeleton loading pour 3 cartes
            Array.from({ length: 3 }).map((_, index) => (
              <Card
                key={index}
                className="relative overflow-hidden border-0 shadow-lg"
              >
                <div className="relative aspect-[4/3] bg-muted animate-pulse"></div>
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <div className="h-6 bg-muted rounded mb-2 animate-pulse"></div>
                  <div className="h-4 bg-muted rounded mb-4 animate-pulse"></div>
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
                    <div className="h-9 w-24 bg-muted rounded animate-pulse"></div>
                  </div>
                </div>
              </Card>
            ))
          ) : error ? (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">
                Erreur lors du chargement des catégories
              </p>
            </div>
          ) : (
            categories
              ?.filter(
                (category: CategoryWithImage) => category.products.length > 0
              )
              .map((category: CategoryWithImage, index) => {
                const translatedName = getCategoryTranslation(category, "name", locale);
                const translatedDescription = getCategoryTranslation(category, "description", locale);

                return (
                <Card
                  key={category.id}
                  className="group relative p-0 overflow-hidden border border-border  shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Link
                    href={`/products?category=${category.id}`}
                    className="w-full h-full"
                  >
                    <div className="relative aspect-[4/3] bg-muted">
                      {category.imageUrl ? (
                        <Image
                          src={category.imageUrl}
                          alt={translatedName}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          priority={index < 3}
                        />
                      ) : (
                        <div
                          className="absolute inset-0"
                          style={{
                            backgroundColor: category.color,
                            opacity: 0.3,
                          }}
                        ></div>
                      )}
                    </div>
                    <div
                      className={`absolute inset-0 flex flex-col justify-end p-6 z-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent`}
                    >
                      <h3 className="text-xl font-semibold tracking-tight mb-2 text-white">
                        {category.icon}
                        {translatedName}
                      </h3>
                      <p className="text-sm text-white/90 mb-4">
                        {translatedDescription}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white/80">
                          {category.products.length} produit
                          {category.products.length > 1 ? "s" : ""}
                        </span>
                        <div className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 flex items-center text-sm text-white">
                          Découvrir
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </div>
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Link>
                </Card>
                );
              })
          )}
        </div>

        <div className="text-center mt-12">
          <Link
            className={buttonVariants({ variant: "default", size: "lg" })}
            href="/products"
          >
            Voir toutes nos bougies
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
};
export default CategoriesSection;
