"use client";

import { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Eye } from "lucide-react";
import { useAdminProducts, useDeleteProduct } from "@/hooks/useProducts";
import { toast } from "sonner";
import Image from "next/image";
import { useQueryClient } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/utils";
import { DataTableAdvanced } from "@/components/admin/data-table-advanced";
import {
  AdminHeader,
  AdminHeaderActions,
} from "@/components/admin/admin-header";
import { Badge } from "@/components/ui/badge";
import { type ColumnDef } from "@tanstack/react-table";
import { Image as ProductImage, Scent, Category } from "@prisma/client";
import CreateProductForm from "./CreateProductForm";
import EditProductForm from "./EditProductForm";
// Import du composant de pagination réutilisable
// import { PaginationComponent } from "@/app/(private)/Pagination";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  subTitle: string;
  slogan: string;
  category: Category;
  arAnimation: string;
  scent: Scent;
  images: ProductImage[];
}

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { data: products, isLoading, refetch } = useAdminProducts();

  const deleteProductMutation = useDeleteProduct();

  const handleRefresh = () => {
    refetch();
  };

  const handleExport = (data: Product[]) => {
    const csvContent = [
      ["ID", "Nom", "Prix", "Catégorie", "Parfum", "Description"],
      ...data.map((product) => [
        product.id,
        product.name,
        product.price.toString(),
        product.category.name,
        product.scent.name,
        product.description.replace(/,/g, ";"),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `produits-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      deleteProductMutation.mutate(id, {
        onSuccess: () => {
          toast.success("Produit supprimé avec succès");
          queryClient.invalidateQueries({ queryKey: ["admin-products"] });
        },
        onError: (error) => {
          toast.error("Erreur lors de la suppression");
          console.error(error);
        },
      });
    }
  };

  const columns: ColumnDef<Product>[] = [
    {
      id: "image",
      header: "Image",
      cell: ({ row }) => {
        const product = row.original;
        const image = product.images?.[0];
        return (
          <div className="w-16 h-16 relative rounded-lg overflow-hidden">
            {image ? (
              <Image
                src={image.url}
                alt={product.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-xs">No image</span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "name",
      header: "Nom",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="space-y-1">
            <div className="font-medium">{product.name}</div>
            <div className="text-sm text-gray-500">{product.subTitle}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "category.name",
      header: "Catégorie",
      cell: ({ row }) => {
        const category = row.original.category;
        if (!category) {
          return <Badge variant="outline">Aucune catégorie</Badge>;
        }
        return (
          <Badge
            variant="outline"
            style={{ backgroundColor: category.color + "20" }}
          >
            {category.name}
          </Badge>
        );
      },
    },
    {
      accessorKey: "scent.name",
      header: "Parfum",
      cell: ({ row }) => {
        const scent = row.original.scent;
        if (!scent) {
          return <Badge variant="secondary">Aucun parfum</Badge>;
        }
        return <Badge variant="secondary">{scent.name}</Badge>;
      },
    },
    {
      accessorKey: "price",
      header: "Prix",
      cell: ({ row }) => {
        return (
          <div className="font-medium">
            {formatCurrency(row.original.price)}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`/products/${product.id}`, "_blank")}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingProduct(product)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(product.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Gestion des produits"
        description="Gérez votre catalogue de produits"
        breadcrumbs={[
          { label: "Administration", href: "/admin" },
          { label: "Produits" },
        ]}
        badge={{
          text: `${products?.length || 0} produit${(products?.length || 0) > 1 ? "s" : ""}`,
          variant: "secondary",
        }}
        actions={
          <AdminHeaderActions
            onRefresh={handleRefresh}
            onAdd={() => setIsCreateDialogOpen(true)}
            addLabel="Créer un produit"
            isLoading={isLoading}
          />
        }
      />

      {/* 
        Le DataTableAdvanced utilise maintenant automatiquement le composant PaginationComponent
        grâce à l'intégration dans le composant DataTableAdvanced.
        
        Si vous voulez utiliser le composant de pagination directement dans une page simple :
        
        const [currentPage, setCurrentPage] = useState(1);
        const itemsPerPage = 10;
        const totalPages = Math.ceil(data.length / itemsPerPage);
        
        <PaginationComponent
          table={{
            getPageCount: () => totalPages,
            getCanPreviousPage: () => currentPage > 1,
            getCanNextPage: () => currentPage < totalPages,
          }}
          currentPage={currentPage}
          updatePageInURL={setCurrentPage}
        />
      */}

      <Suspense fallback={<div>Chargement...</div>}>
        <DataTableAdvanced
          columns={columns}
          data={products || []}
          searchPlaceholder="Rechercher par nom..."
          onExport={handleExport}
          isLoading={isLoading}
          emptyMessage="Aucun produit trouvé"
        />
      </Suspense>

      {/* Formulaire de création avec dialog intégré */}
      <CreateProductForm
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => setIsCreateDialogOpen(false)}
      />

      {/* Formulaire d'édition avec dialog intégré */}
      {editingProduct && (
        <EditProductForm
          productId={editingProduct.id}
          initialData={editingProduct}
          open={!!editingProduct}
          onOpenChange={(open) => !open && setEditingProduct(null)}
          onSuccess={() => setEditingProduct(null)}
        />
      )}
    </div>
  );
}
