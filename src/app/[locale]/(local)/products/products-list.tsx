"use client";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts, type PaginatedProducts } from "@/services/products";
import CardSkeleton from "@/components/skeleton/card-skeleton";
import { Button } from "@/components/ui/button";
import ProductCard from "./product-card";
import { PaginationComponent } from "@/components/pagination-component";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

const ProductsList = () => {
  const t = useTranslations("products");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Récupérer les paramètres depuis l'URL
  const urlPage = searchParams.get("page");
  const urlSortBy = searchParams.get("sortBy");
  const urlSortOrder = searchParams.get("sortOrder");
  const urlCategory = searchParams.get("category");

  const [currentPage, setCurrentPage] = useState(parseInt(urlPage || "1"));
  const sortBy = urlSortBy || "name";
  const sortOrder = urlSortOrder || "asc";
  const selectedCategory = urlCategory || "all";

  // Synchroniser l'état avec l'URL au chargement
  useEffect(() => {
    if (urlPage) setCurrentPage(parseInt(urlPage));
  }, [urlPage]);

  const { data, isLoading } = useQuery<PaginatedProducts>({
    queryKey: [
      "products",
      currentPage,
      selectedCategory !== "all" ? selectedCategory : undefined,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      fetchProducts({
        page: currentPage,
        categoryId: selectedCategory !== "all" ? selectedCategory : undefined,
        sortBy,
        sortOrder,
      }),
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

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("page", newPage.toString());

    // Utiliser pathname de next-intl pour éviter la duplication de locale
    const newURL = `${pathname}?${newSearchParams.toString()}`;
    router.push(newURL, { scroll: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {data.products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <PaginationComponent
        currentPage={currentPage}
        totalPages={data.pagination.pages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default ProductsList;
