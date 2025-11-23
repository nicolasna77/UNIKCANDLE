"use client";

import { useState, Suspense, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  type CategoryWithProducts,
  fetchCategories,
} from "@/services/categories";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTableAdvanced } from "@/components/admin/data-table-advanced";
import { createColumns } from "./columns";
import CreateCategoryForm from "./create-category-form";
import EditCategoryForm from "./edit-category-form";

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<CategoryWithProducts | null>(null);

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
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la suppression");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Catégorie supprimée avec succès");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleDelete = useCallback(
    (id: string) => {
      if (confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")) {
        deleteCategory.mutate(id);
      }
    },
    [deleteCategory]
  );

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
    </div>
  );
}
