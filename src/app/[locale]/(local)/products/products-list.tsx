"use client";
import { useQuery } from "@tanstack/react-query";
import { fetchCategories, type CategoryWithProducts } from "@/services/categories";
import { fetchProducts, type PaginatedProducts } from "@/services/products";
import CardSkeleton from "@/components/skeleton/card-skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Filter } from "lucide-react";
import ProductCard from "./product-card";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Category } from "@prisma/client";
import { useTranslations, useLocale } from "next-intl";
import { getCategoryTranslation } from "@/lib/product-translation";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const ProductsList = () => {
  const t = useTranslations("products");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Récupérer les paramètres depuis l'URL
  const urlPage = searchParams.get("page");
  const urlSortBy = searchParams.get("sortBy");
  const urlSortOrder = searchParams.get("sortOrder");
  const urlCategory = searchParams.get("category");

  const [currentPage, setCurrentPage] = useState(parseInt(urlPage || "1"));
  const [sortBy, setSortBy] = useState(urlSortBy || "name");
  const [sortOrder, setSortOrder] = useState(urlSortOrder || "asc");
  const [selectedCategory, setSelectedCategory] = useState<string>(
    urlCategory || "all"
  );

  // Synchroniser l'état avec l'URL au chargement
  useEffect(() => {
    if (urlPage) setCurrentPage(parseInt(urlPage));
    if (urlSortBy) setSortBy(urlSortBy);
    if (urlSortOrder) setSortOrder(urlSortOrder);
    if (urlCategory) setSelectedCategory(urlCategory);
  }, [urlPage, urlSortBy, urlSortOrder, urlCategory]);

  const { data, isLoading } = useQuery<PaginatedProducts>({
    queryKey: ["products", currentPage, selectedCategory !== "all" ? selectedCategory : undefined, sortBy, sortOrder],
    queryFn: () => fetchProducts({
      page: currentPage,
      categoryId: selectedCategory !== "all" ? selectedCategory : undefined,
      sortBy,
      sortOrder,
    }),
  });

  const { data: categories = [] } = useQuery<CategoryWithProducts[]>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {Array.from({ length: 6 }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (!data?.products || !Array.isArray(data.products)) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-destructive text-lg">
          {t("list.unexpectedDataFormat")}
        </div>
        <Button variant="outline" onClick={() => window.location.reload()}>
          {t("list.retry")}
        </Button>
      </div>
    );
  }

  // Fonction pour mettre à jour l'URL avec les paramètres
  const updateURL = (params: {
    page?: number;
    sortBy?: string;
    sortOrder?: string;
    category?: string;
  }) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        newSearchParams.set(key, value.toString());
      } else {
        newSearchParams.delete(key);
      }
    });

    const newURL = `${window.location.pathname}?${newSearchParams.toString()}`;
    router.push(newURL, { scroll: false });
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    updateURL({ page: newPage });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSortByChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    setCurrentPage(1); // Reset à la première page
    updateURL({ sortBy: newSortBy, page: 1 });
  };

  const handleSortOrderChange = () => {
    const newSortOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newSortOrder);
    setCurrentPage(1); // Reset à la première page
    updateURL({ sortOrder: newSortOrder, page: 1 });
  };

  const handleCategoryChange = (newCategory: string) => {
    setSelectedCategory(newCategory);
    setCurrentPage(1); // Reset à la première page
    updateURL({ category: newCategory, page: 1 });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap gap-2">
          <Select value={sortBy} onValueChange={handleSortByChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("list.sortBy")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">{t("list.name")}</SelectItem>
              <SelectItem value="price">{t("price")}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={handleSortOrderChange}>
            <Filter
              className={cn(
                "h-4 w-4 transition-transform",
                sortOrder === "desc" && "rotate-180"
              )}
            />
          </Button>
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("category")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("list.allCategories")}</SelectItem>
              {categories.map((category: Category) => {
                const translatedName = getCategoryTranslation(category, "name", locale);
                return (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span>{translatedName}</span>
                  </div>
                </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {data.products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <div className="flex items-center justify-center">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              {currentPage > 1 && (
                <PaginationPrevious
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="cursor-pointer"
                />
              )}
            </PaginationItem>

            {/* Première page */}
            {currentPage > 3 && (
              <>
                <PaginationItem>
                  <PaginationLink onClick={() => handlePageChange(1)}>
                    1
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              </>
            )}

            {/* Pages autour de la page courante */}
            {(() => {
              const totalPages = data.pagination.pages;
              const pages = [];
              let startPage = Math.max(1, currentPage - 2);
              let endPage = Math.min(totalPages, currentPage + 2);

              // Ajuster pour toujours avoir 5 pages si possible
              if (endPage - startPage < 4) {
                if (startPage === 1) {
                  endPage = Math.min(totalPages, startPage + 4);
                } else if (endPage === totalPages) {
                  startPage = Math.max(1, endPage - 4);
                }
              }

              for (let i = startPage; i <= endPage; i++) {
                // Éviter les doublons avec la première et dernière page
                if (
                  (currentPage > 3 && i === 1) ||
                  (currentPage < totalPages - 2 && i === totalPages)
                ) {
                  continue;
                }

                pages.push(
                  <PaginationItem key={i}>
                    <PaginationLink
                      onClick={() => handlePageChange(i)}
                      isActive={i === currentPage}
                      className="cursor-pointer"
                    >
                      {i}
                    </PaginationLink>
                  </PaginationItem>
                );
              }

              return pages;
            })()}

            {/* Dernière page */}
            {currentPage < data.pagination.pages - 2 &&
              data.pagination.pages > 5 && (
                <>
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink
                      onClick={() => handlePageChange(data.pagination.pages)}
                      className="cursor-pointer"
                    >
                      {data.pagination.pages}
                    </PaginationLink>
                  </PaginationItem>
                </>
              )}

            <PaginationItem>
              {currentPage < data.pagination.pages && (
                <PaginationNext
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="cursor-pointer"
                />
              )}
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default ProductsList;
