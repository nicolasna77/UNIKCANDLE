"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { type CategoryWithProducts } from "@/services/categories";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import { TableActionsMenu } from "@/components/admin/table-actions-menu";

interface ColumnActions {
  onEdit: (category: CategoryWithProducts) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export const createColumns = (
  actions: ColumnActions
): ColumnDef<CategoryWithProducts>[] => {
  const { onEdit, onDelete } = actions;
  // Note: isDeleting est disponible via actions.isDeleting pour désactiver les boutons si nécessaire
  return [
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
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const category = row.original;
      return (
        <div className="flex justify-end">
          <TableActionsMenu
            actions={[
              {
                label: "Modifier",
                icon: <Pencil className="h-4 w-4" />,
                onClick: () => onEdit(category),
              },
              {
                label: "Supprimer",
                icon: <Trash2 className="h-4 w-4" />,
                onClick: () => onDelete(category.id),
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
};
