"use client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchProductById, type ProductWithDetails } from "@/services/products";

const Breadscrumb = () => {
  const pathname = usePathname();
  const pathnames = pathname.split("/").filter((item) => item);

  // Récupérer l'ID du produit si nous sommes sur une page de produit
  const productId =
    pathnames.length >= 2 && pathnames[0] === "products"
      ? pathnames[1]
      : undefined;

  // Utiliser TanStack Query pour récupérer le produit
  const { data: product, isLoading } = useQuery<ProductWithDetails>({
    queryKey: ["productdetail", productId],
    queryFn: () => fetchProductById(productId!),
    enabled: !!productId,
    retry: 1,
    retryDelay: 1000,
  });

  const getBreadcrumbName = (path: string, index: number) => {
    const breadcrumbNames: { [key: string]: string } = {
      "": "Accueil",
      products: "Produits",
    };

    // Si nous sommes sur la page d'un produit spécifique et avons récupéré son nom
    if (index === 1 && pathnames[0] === "products" && product) {
      return product.name;
    } else if (index === 1 && pathnames[0] === "products" && isLoading) {
      return "Chargement...";
    }

    return breadcrumbNames[path] || path;
  };

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Accueil</BreadcrumbLink>
        </BreadcrumbItem>
        {pathnames.map((name, index) => {
          const href = `/${pathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === pathnames.length - 1;
          const displayName = getBreadcrumbName(name, index);

          return (
            <React.Fragment key={name}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{displayName}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={href}>{displayName}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default Breadscrumb;
