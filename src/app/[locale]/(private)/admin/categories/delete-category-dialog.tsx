"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { type CategoryWithProducts } from "@/services/categories";

interface DeleteCategoryDialogProps {
  category: CategoryWithProducts | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteCategoryDialog({
  category,
  open,
  onOpenChange,
  onConfirm,
  isDeleting,
}: DeleteCategoryDialogProps) {
  if (!category) return null;

  const hasProducts = (category._count?.products || 0) > 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Supprimer la catégorie
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <div className="space-y-2">
              <p>
                Êtes-vous sûr de vouloir supprimer la catégorie{" "}
                <span className="font-semibold">{category.name}</span> ?
              </p>

              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                <div
                  className="w-4 h-4 rounded-full border"
                  style={{ backgroundColor: category.color }}
                />
                <span className="font-medium">{category.name}</span>
                <Badge variant="outline">{category.icon}</Badge>
              </div>
            </div>

            {hasProducts ? (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive font-medium">
                  ⚠️ Impossible de supprimer cette catégorie
                </p>
                <p className="text-sm text-destructive mt-1">
                  {category._count.products} produit(s) utilisent encore cette
                  catégorie. Veuillez d&apos;abord réassigner ou supprimer ces
                  produits.
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Cette action est irréversible et supprimera définitivement la
                catégorie.
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
          {!hasProducts && (
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                onConfirm();
              }}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
