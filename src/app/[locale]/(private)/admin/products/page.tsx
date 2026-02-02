"use client";

import { useState, Suspense } from "react";
import { Pencil, Trash2, Eye } from "lucide-react";
import { TableActionsMenu } from "@/components/admin/table-actions-menu";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Image from "next/image";
import { deleteProductById } from "@/app/actions/products";
import { fetchAdminProducts, type ProductWithDetails } from "@/services/products";
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
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
// Import du composant de pagination réutilisable
// import { PaginationComponent } from "@/app/(private)/Pagination";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  subTitle: string;
  slogan: string;
  messageType: "audio" | "text";
  category: Category;
  arAnimation: string;
  scent: Scent;
  images: ProductImage[];
}

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const { data: products, isLoading, refetch } = useQuery<ProductWithDetails[]>({
    queryKey: ["admin-products"],
    queryFn: fetchAdminProducts,
  });
  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteProductById(id);
      if (!result.success) {
        throw new Error(result.error || "Erreur lors de la suppression du produit");
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Produit supprimé avec succès");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la suppression du produit");
    },
  });

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
    setProductToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      deleteProductMutation.mutate(productToDelete, {
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
    setProductToDelete(null);
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
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex justify-end">
            <TableActionsMenu
              actions={[
                {
                  label: "Voir",
                  icon: <Eye className="h-4 w-4" />,
                  onClick: () =>
                    window.open(`/products/${product.id}`, "_blank"),
                },
                {
                  label: "Modifier",
                  icon: <Pencil className="h-4 w-4" />,
                  onClick: () => setEditingProduct(product),
                },
                {
                  label: "Supprimer",
                  icon: <Trash2 className="h-4 w-4" />,
                  onClick: () => handleDelete(product.id),
                  variant: "destructive",
                  separator: true,
                },
              ]}
            />
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

      {/* Dialog de confirmation de suppression */}
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Supprimer ce produit ?"
        description="Cette action est irréversible. Le produit sera définitivement supprimé du catalogue."
        isLoading={deleteProductMutation.isPending}
      />
    </div>
  );
}
