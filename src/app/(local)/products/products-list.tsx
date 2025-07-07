"use client";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
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
import { Category } from "@/generated/client";
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

  const { data, isLoading } = useProducts({
    page: currentPage,
    categoryId: selectedCategory !== "all" ? selectedCategory : undefined,
    sortBy,
    sortOrder,
  });

  const { data: categories = [] } = useCategories();

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
          Format de données inattendu
        </div>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Réessayer
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
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Nom</SelectItem>
              <SelectItem value="price">Prix</SelectItem>
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
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              {categories.map((category: Category) => (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span>{category.name}</span>
                  </div>
                </SelectItem>
              ))}
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
            {Array.from(
              { length: Math.min(5, data.pagination.pages) },
              (_, i) => {
                const pageNum = Math.max(
                  1,
                  Math.min(data.pagination.pages, currentPage - 2 + i)
                );

                // Éviter les doublons
                if (i > 0 && pageNum <= Math.max(1, currentPage - 2 + i - 1)) {
                  return null;
                }

                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => handlePageChange(pageNum)}
                      isActive={pageNum === currentPage}
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              }
            )}

            {/* Dernière page */}
            {currentPage < data.pagination.pages - 2 && (
              <>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink
                    onClick={() => handlePageChange(data.pagination.pages)}
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
