"use client";

import { useState, Suspense, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  type CategoryWithProducts,
  fetchCategories,
} from "@/services/categories";
import { deleteCategoryById } from "@/app/actions/categories";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTableAdvanced } from "@/components/admin/data-table-advanced";
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
      // Annuler les refetch en cours pour éviter d'écraser notre mise à jour optimiste
      await queryClient.cancelQueries({ queryKey: ["categories"] });

      // Snapshot de la valeur précédente
      const previousCategories = queryClient.getQueryData<CategoryWithProducts[]>(["categories"]);

      // Mise à jour optimiste : supprimer la catégorie immédiatement du cache
      queryClient.setQueryData<CategoryWithProducts[]>(
        ["categories"],
        (old) => old?.filter((cat) => cat.id !== deletedId) ?? []
      );

      // Retourner le contexte avec les données précédentes pour rollback si erreur
      return { previousCategories };
    },
    onSuccess: async ({ result }) => {
      const deletedCount = result?.data?.deletedProductsCount || 0;
      if (deletedCount > 0) {
        toast.success(
          `Catégorie supprimée avec succès. ${deletedCount} produit(s) ont été supprimé(s).`
        );
      } else {
        toast.success("Catégorie supprimée avec succès");
      }
      setDeleteDialogOpen(false);

      // Refetch pour s'assurer que les données sont synchronisées
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error: Error, _deletedId, context) => {
      toast.error(error.message);
      setDeleteDialogOpen(false);

      // Rollback en cas d'erreur
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des catégories</h1>
          <p className="text-muted-foreground">
            Gérez les catégories de produits
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle catégorie
        </Button>
      </div>

      <Suspense fallback={<div>Chargement...</div>}>
        <DataTableAdvanced
          data={categories}
          columns={columns}
          isLoading={isLoading}
          onRefresh={refetch}
          onExport={handleExport}
          emptyMessage="Aucune catégorie trouvée"
        />
      </Suspense>

      {/* Dialog de création */}
      <CreateCategoryForm
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={() => setIsCreateOpen(false)}
      />

      {/* Dialog d'édition */}
      {editingCategory && (
        <EditCategoryForm
          open={!!editingCategory}
          onOpenChange={(open) => !open && setEditingCategory(null)}
          category={editingCategory}
          onSuccess={() => setEditingCategory(null)}
        />
      )}

      {/* Dialog de confirmation de suppression */}
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Supprimer la catégorie"
        description="Êtes-vous sûr de vouloir supprimer cette catégorie ? Tous les produits associés à cette catégorie seront également supprimés. Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        isLoading={deleteCategory.isPending}
      />
    </div>
  );
}
