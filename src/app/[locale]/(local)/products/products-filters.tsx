"use client";
import { useQuery } from "@tanstack/react-query";
import {
  fetchCategories,
  type CategoryWithProducts,
} from "@/services/categories";
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
import { Category } from "@prisma/client";
import { useTranslations, useLocale } from "next-intl";
import { getCategoryTranslation } from "@/lib/product-translation";
import { useRouter, usePathname } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

type ProductsFiltersProps = {
  onFiltersChange?: (filters: {
    page: number;
    sortBy: string;
    sortOrder: string;
    category: string;
  }) => void;
};

const ProductsFilters = ({ onFiltersChange }: ProductsFiltersProps) => {
  const t = useTranslations("products");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Récupérer les paramètres depuis l'URL
  const urlSortBy = searchParams.get("sortBy");
  const urlSortOrder = searchParams.get("sortOrder");
  const urlCategory = searchParams.get("category");

  const [sortBy, setSortBy] = useState(urlSortBy || "name");
  const [sortOrder, setSortOrder] = useState(urlSortOrder || "asc");
  const [selectedCategory, setSelectedCategory] = useState<string>(
    urlCategory || "all"
  );

  // Synchroniser l'état avec l'URL au chargement
  useEffect(() => {
    if (urlSortBy) setSortBy(urlSortBy);
    if (urlSortOrder) setSortOrder(urlSortOrder);
    if (urlCategory) setSelectedCategory(urlCategory);
  }, [urlSortBy, urlSortOrder, urlCategory]);

  const { data: categories = [] } = useQuery<CategoryWithProducts[]>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

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

    // Construire l'URL relative sans la locale (next-intl l'ajoute automatiquement)
    const newURL = `${pathname}?${newSearchParams.toString()}`;
    router.push(newURL, { scroll: false });
  };

  const handleSortByChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    const newFilters = { sortBy: newSortBy, page: 1 };
    updateURL(newFilters);
    onFiltersChange?.({
      page: 1,
      sortBy: newSortBy,
      sortOrder,
      category: selectedCategory,
    });
  };

  const handleSortOrderChange = () => {
    const newSortOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newSortOrder);
    const newFilters = { sortOrder: newSortOrder, page: 1 };
    updateURL(newFilters);
    onFiltersChange?.({
      page: 1,
      sortBy,
      sortOrder: newSortOrder,
      category: selectedCategory,
    });
  };

  const handleCategoryChange = (newCategory: string) => {
    setSelectedCategory(newCategory);
    const newFilters = { category: newCategory, page: 1 };
    updateURL(newFilters);
    onFiltersChange?.({
      page: 1,
      sortBy,
      sortOrder,
      category: newCategory,
    });
  };

  return (
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
              const translatedName = getCategoryTranslation(
                category,
                "name",
                locale
              );
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
  );
};

export default ProductsFilters;
