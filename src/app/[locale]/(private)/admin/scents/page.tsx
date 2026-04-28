"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTableAdvanced } from "@/components/admin/data-table-advanced";
import {
  AdminHeader,
  AdminHeaderActions,
} from "@/components/admin/admin-header";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
import { type ColumnDef } from "@tanstack/react-table";
import CreateScentForm from "./create-scent-form";
import { type ScentWithProducts } from "@/lib/admin-schemas";

export default function ScentsPage() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingScent, setEditingScent] = useState<ScentWithProducts | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scentToDelete, setScentToDelete] = useState<string | null>(null);

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
      setDeleteDialogOpen(false);
      setScentToDelete(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
      setDeleteDialogOpen(false);
    },
  });

  const handleDelete = (id: string) => {
    setScentToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (scentToDelete) {
      deleteScent.mutate(scentToDelete);
    }
  };

  const handleExport = (data: ScentWithProducts[]) => {
    const csvContent = [
      ["ID", "Nom", "Description", "Icône", "Couleur", "Nb Produits"],
      ...data.map((scent) => [
        scent.id,
        scent.name,
        scent.description.replace(/,/g, ";"),
        scent.icon,
        scent.color,
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
              className="w-5 h-5 rounded-full border border-border shrink-0 shadow-sm"
              style={{ backgroundColor: scent.color }}
            />
            <div>
              <p className="text-sm font-medium">{scent.name}</p>
              {scent.nameEN && scent.nameEN !== scent.name && (
                <p className="text-xs text-muted-foreground">{scent.nameEN}</p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <p
          className="max-w-xs text-sm text-muted-foreground truncate"
          title={row.original.description}
        >
          {row.original.description || "—"}
        </p>
      ),
    },
    {
      accessorKey: "icon",
      header: "Icône",
      cell: ({ row }) => (
        <Badge variant="outline" className="font-mono text-xs">
          {row.original.icon}
        </Badge>
      ),
    },
    {
      accessorKey: "_count.products",
      header: "Produits",
      cell: ({ row }) => {
        const count = row.original._count?.products || 0;
        return (
          <Badge
            variant={count > 0 ? "default" : "secondary"}
            className="text-xs"
          >
            {count} produit{count !== 1 ? "s" : ""}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const scent = row.original;
        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              aria-label={`Modifier ${scent.name}`}
              onClick={() => setEditingScent(scent)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
              aria-label={`Supprimer ${scent.name}`}
              onClick={() => handleDelete(scent.id)}
              disabled={deleteScent.isPending}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Parfums"
        description="Gérez les parfums et senteurs de vos bougies"
        breadcrumbs={[
          { label: "Administration", href: "/admin/dashboard" },
          { label: "Parfums" },
        ]}
        badge={{
          text: `${scents.length} senteur${scents.length !== 1 ? "s" : ""}`,
          variant: "secondary",
        }}
        actions={
          <AdminHeaderActions
            onRefresh={() => refetch()}
            onAdd={() => setIsCreateOpen(true)}
            addLabel="Nouveau parfum"
            isLoading={isLoading}
          />
        }
      />

      
        <DataTableAdvanced
          data={scents}
          columns={columns}
          isLoading={isLoading}
          onRefresh={() => refetch()}
          onExport={handleExport}
          emptyMessage="Aucune senteur trouvée"
          searchKey="name"
          searchPlaceholder="Rechercher par nom..."
        />

      {/* Create dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouveau parfum</DialogTitle>
          </DialogHeader>
          <CreateScentForm />
        </DialogContent>
      </Dialog>

      {/* Edit dialog — note: CreateScentForm currently only handles creation;
          editing requires a separate EditScentForm wired to the scent id */}
      {editingScent && (
        <Dialog
          open={!!editingScent}
          onOpenChange={(open) => !open && setEditingScent(null)}
        >
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Modifier — {editingScent.name}</DialogTitle>
            </DialogHeader>
            <CreateScentForm />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete confirmation */}
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setScentToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Supprimer cette senteur ?"
        description="Cette action est irréversible. La senteur sera définitivement supprimée."
        isLoading={deleteScent.isPending}
      />
    </div>
  );
}
