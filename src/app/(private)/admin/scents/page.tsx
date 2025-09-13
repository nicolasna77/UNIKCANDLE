"use client";

import { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { DataTableAdvanced } from "@/components/admin/data-table-advanced";
import {
  AdminHeader,
  AdminHeaderActions,
} from "@/components/admin/admin-header";
import { type ColumnDef } from "@tanstack/react-table";
import CreateScentForm from "./create-scent-form";
import { type ScentWithProducts } from "@/lib/admin-schemas";

export default function ScentsPage() {
  const queryClient = useQueryClient();
  const [editingScent, setEditingScent] = useState<ScentWithProducts | null>(
    null
  );

  const {
    data: scents = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["scents"],
    queryFn: async () => {
      const response = await fetch("/api/admin/scents");
      if (!response.ok) throw new Error("Erreur lors du chargement");
      return response.json();
    },
  });

  const deleteScent = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/scents/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la suppression");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scents"] });
      toast.success("Senteur supprimée avec succès");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleDelete = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette senteur ?")) {
      deleteScent.mutate(id);
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  const handleExport = (data: ScentWithProducts[]) => {
    const csvContent = [
      [
        "ID",
        "Nom",
        "Description",
        "Icône",
        "Couleur",
        "Modèle 3D",
        "Nb Produits",
      ],
      ...data.map((scent) => [
        scent.id,
        scent.name,
        scent.description.replace(/,/g, ";"),
        scent.icon,
        scent.color,
        scent.model3dUrl || "Non défini",
        scent._count?.products?.toString() || "0",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `senteurs-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const columns: ColumnDef<ScentWithProducts>[] = [
    {
      accessorKey: "name",
      header: "Nom",
      cell: ({ row }) => {
        const scent = row.original;
        return (
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full border"
              style={{ backgroundColor: scent.color }}
            />
            <span className="font-medium">{scent.name}</span>
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
      accessorKey: "model3dUrl",
      header: "Modèle 3D",
      cell: ({ row }) => {
        const hasModel = row.original.model3dUrl;
        return (
          <Badge variant={hasModel ? "default" : "secondary"}>
            {hasModel ? "Disponible" : "Non défini"}
          </Badge>
        );
      },
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
        const scent = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingScent(scent)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(scent.id)}
              disabled={deleteScent.isPending}
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
        title="Gestion des senteurs"
        description="Gérez les parfums et senteurs de vos bougies"
        breadcrumbs={[
          { label: "Administration", href: "/admin" },
          { label: "Senteurs" },
        ]}
        actions={<AdminHeaderActions onRefresh={handleRefresh} />}
      />

      <Suspense fallback={<div>Chargement...</div>}>
        <DataTableAdvanced
          data={scents}
          columns={columns}
          isLoading={isLoading}
          onRefresh={handleRefresh}
          onExport={handleExport}
          emptyMessage="Aucune senteur trouvée"
        />
      </Suspense>

      {editingScent && (
        <Dialog
          open={!!editingScent}
          onOpenChange={() => setEditingScent(null)}
        >
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Modifier la senteur</DialogTitle>
            </DialogHeader>
            <CreateScentForm />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
