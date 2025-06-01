"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Pencil, Trash2 } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useScents } from "@/hooks/useScents";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import Image from "next/image";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Loading from "@/components/loading";
import { TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { TooltipTrigger } from "@/components/ui/tooltip";
import { Tooltip } from "@/components/ui/tooltip";
import { Image as ProductImage, Scent } from "@/generated/client";
import CreateProductForm from "./create-product-form";
import EditProductForm from "./EditProductForm";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  subTitle: string;
  slogan: string;
  category: {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
  };
  arAnimation: string;
  scent: Scent;
  images: ProductImage[];
}

export default function ProductsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { data: products = { products: [] }, isLoading: isProductsLoading } =
    useProducts();
  const { data: scents = [], isLoading: isScentsLoading } = useScents();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Erreur lors de la suppression");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Produit supprimé avec succès");
    },
  });

  if (isProductsLoading || isScentsLoading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestion des produits</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>Créer un produit</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Créer un produit</DialogTitle>
            </DialogHeader>
            <CreateProductForm
              onSuccess={() => setIsCreateDialogOpen(false)}
              scents={scents}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Image</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Parfum</TableHead>
              <TableHead>Prix</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.products?.map((product: Product) => (
              <TableRow key={product.id}>
                <TableCell>
                  {product.images[0] && (
                    <Image
                      src={product.images[0].url}
                      alt={product.name}
                      className="h-20 w-20 object-cover rounded"
                      width={80}
                      height={80}
                    />
                  )}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.subTitle}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: product.category.color }}
                          />
                          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                            {product.category.name}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{product.category.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: product.scent.color }}
                          />
                          <span>{product.scent.name}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{product.scent.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>{product.price.toFixed(2)}€</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Dialog
                      open={editingProduct?.id === product.id}
                      onOpenChange={(open) => !open && setEditingProduct(null)}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingProduct(product)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent style={{ maxWidth: "1000px" }}>
                        <DialogHeader>
                          <DialogTitle>Modifier le produit</DialogTitle>
                        </DialogHeader>

                        <EditProductForm
                          productId={product.id}
                          initialData={product}
                          onSuccess={() => setEditingProduct(null)}
                          scents={scents}
                        />
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
