"use client";

import { useState, useMemo, useCallback } from "react";
import {
  type CategoryWithProducts,
  fetchCategories,
} from "@/services/categories";
import { deleteCategoryById } from "@/app/actions/categories";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTableAdvanced } from "@/components/admin/data-table-advanced";
import {
  AdminHeader,
  AdminHeaderActions,
} from "@/components/admin/admin-header";
import { createColumns } from "./columns";
import CreateCategoryForm from "./create-category-form";
import EditCategoryForm from "./edit-category-form";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<CategoryWithProducts | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const {
    data: categories = [],
    isLoading,
    refetch,
  } = useQuery<CategoryWithProducts[]>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      const result = await deleteCategoryById(id);
      if (!result.success) {
        throw new Error(result.error || "Erreur lors de la suppression");
      }
      return { result, deletedId: id };
    },
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ["categories"] });
      const previousCategories =
        queryClient.getQueryData<CategoryWithProducts[]>(["categories"]);
      queryClient.setQueryData<CategoryWithProducts[]>(
        ["categories"],
        (old) => old?.filter((cat) => cat.id !== deletedId) ?? []
      );
      return { previousCategories };
    },
    onSuccess: async ({ result }) => {
      const deletedCount = result?.data?.deletedProductsCount || 0;
      toast.success(
        deletedCount > 0
          ? `Catégorie supprimée. ${deletedCount} produit(s) également supprimé(s).`
          : "Catégorie supprimée avec succès"
      );
      setDeleteDialogOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error: Error, _deletedId, context) => {
      toast.error(error.message);
      setDeleteDialogOpen(false);
      if (context?.previousCategories) {
        queryClient.setQueryData(["categories"], context.previousCategories);
      }
    },
  });

  const handleDelete = useCallback((id: string) => {
    setCategoryToDelete(id);
    setDeleteDialogOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (categoryToDelete) {
      deleteCategory.mutate(categoryToDelete);
      setCategoryToDelete(null);
    }
  }, [categoryToDelete, deleteCategory]);

  const handleEdit = (category: CategoryWithProducts) => {
    setEditingCategory(category);
  };

  const handleExport = (data: CategoryWithProducts[]) => {
    const csvContent = [
      ["ID", "Nom", "Description", "Icône", "Couleur", "Nb Produits"],
      ...data.map((category) => [
        category.id,
        category.name,
        category.description.replace(/,/g, ";"),
        category.icon,
        category.color,
        category._count?.products?.toString() || "0",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `categories-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns = useMemo(
    () =>
      createColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
        isDeleting: deleteCategory.isPending,
      }),
    [deleteCategory.isPending, handleDelete]
  );

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Catégories"
        description="Gérez les catégories de produits"
        breadcrumbs={[
          { label: "Administration", href: "/admin/dashboard" },
          { label: "Catégories" },
        ]}
        badge={{
          text: `${categories.length} catégorie${categories.length !== 1 ? "s" : ""}`,
          variant: "secondary",
        }}
        actions={
          <AdminHeaderActions
            onRefresh={() => refetch()}
            onAdd={() => setIsCreateOpen(true)}
            addLabel="Nouvelle catégorie"
            isLoading={isLoading}
          />
        }
      />

      
        <DataTableAdvanced
          data={categories}
          columns={columns}
          isLoading={isLoading}
          onRefresh={() => refetch()}
          onExport={handleExport}
          emptyMessage="Aucune catégorie trouvée"
          searchKey="name"
          searchPlaceholder="Rechercher par nom..."
        />

      <CreateCategoryForm
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={() => setIsCreateOpen(false)}
      />

      {editingCategory && (
        <EditCategoryForm
          open={!!editingCategory}
          onOpenChange={(open) => !open && setEditingCategory(null)}
          category={editingCategory}
          onSuccess={() => setEditingCategory(null)}
        />
      )}

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Supprimer la catégorie ?"
        description="Tous les produits associés seront également supprimés. Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        isLoading={deleteCategory.isPending}
      />
    </div>
  );
}
