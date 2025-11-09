"use client";

import { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus } from "lucide-react";
import { type CategoryWithProducts, fetchCategories } from "@/services/categories";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { DataTableAdvanced } from "@/components/admin/data-table-advanced";

import { type ColumnDef } from "@tanstack/react-table";
import CreateCategoryForm from "./create-category-form";

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<CategoryWithProducts | null>(null);

  const { data: categories = [], isLoading, refetch } = useQuery<CategoryWithProducts[]>({
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

  const handleDelete = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")) {
      deleteCategory.mutate(id);
    }
  };

  const handleRefresh = () => {
    refetch();
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

  const columns: ColumnDef<CategoryWithProducts>[] = [
    {
      accessorKey: "name",
      header: "Nom",
      cell: ({ row }) => {
        const category = row.original;
        return (
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full border"
              style={{ backgroundColor: category.color }}
            />
            <span className="font-medium">{category.name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div className="max-w-xs truncate" title={row.original.description}>
          {row.original.description}
        </div>
      ),
    },
    {
      accessorKey: "icon",
      header: "Icône",
      cell: ({ row }) => <Badge variant="outline">{row.original.icon}</Badge>,
    },
    {
      accessorKey: "_count.products",
      header: "Produits",
      cell: ({ row }) => {
        const count = row.original._count?.products || 0;
        return (
          <Badge variant={count > 0 ? "default" : "secondary"}>
            {count} produit{count !== 1 ? "s" : ""}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const category = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingCategory(category)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(category.id)}
              disabled={deleteCategory.isPending}
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des catégories</h1>
          <p className="text-muted-foreground">
            Gérez les catégories de produits
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle catégorie
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer une nouvelle catégorie</DialogTitle>
            </DialogHeader>
            <CreateCategoryForm
              onSuccess={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Suspense fallback={<div>Chargement...</div>}>
        <DataTableAdvanced
          data={categories}
          columns={columns}
          isLoading={isLoading}
          onRefresh={handleRefresh}
          onExport={handleExport}
          emptyMessage="Aucune catégorie trouvée"
        />
      </Suspense>

      {editingCategory && (
        <Dialog
          open={!!editingCategory}
          onOpenChange={() => setEditingCategory(null)}
        >
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Modifier la catégorie</DialogTitle>
            </DialogHeader>
            <CreateCategoryForm onSuccess={() => setEditingCategory(null)} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
