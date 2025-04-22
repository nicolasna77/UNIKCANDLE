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

import { Plus, Pencil, Trash2, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAdminProducts } from "@/hooks/useProducts";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Loading from "@/components/loading";
import { TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { TooltipTrigger } from "@/components/ui/tooltip";
import { Tooltip } from "@/components/ui/tooltip";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  variants: {
    id: string;
    scent: {
      id: string;
      name: string;
      color: string;
    };
  }[];
}

interface Scent {
  id: string;
  name: string;
  color: string;
}

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(
    null
  );
  const [selectedScents, setSelectedScents] = useState<string[]>([]);
  const { data: products = [], isLoading: isProductsLoading } =
    useAdminProducts();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);

  const filteredProducts = products.filter((product: Product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const { data: scents = [], isLoading: isScentsLoading } = useQuery({
    queryKey: ["scents"],
    queryFn: async () => {
      const response = await fetch("/api/admin/scents");
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<Product>) => {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          selectedScents,
        }),
      });
      if (!response.ok) throw new Error("Erreur lors de la création");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Produit créé avec succès");
      setIsCreateDialogOpen(false);
      setEditingProduct(null);
      setSelectedScents([]);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Product>;
    }) => {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          selectedScents,
        }),
      });
      if (!response.ok) throw new Error("Erreur lors de la mise à jour");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Produit mis à jour avec succès");
      setIsCreateDialogOpen(false);
      setEditingProduct(null);
      setSelectedScents([]);
    },
  });

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

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("L'image ne doit pas dépasser 5MB");
      }

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/products/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors du téléchargement");
      }

      return response.json();
    },
    onSuccess: (data) => {
      setEditingProduct((prev) => ({ ...prev, imageUrl: data.url }));
      toast.success("Image téléchargée avec succès");
    },
    onError: (error: Error) => {
      console.error("Erreur lors du téléchargement:", error);
      toast.error(error.message || "Erreur lors du téléchargement de l'image");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (editingProduct.id) {
      updateMutation.mutate({ id: editingProduct.id, data: editingProduct });
    } else {
      createMutation.mutate(editingProduct);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setSelectedScents(product.variants.map((v) => v.scent.id));
    setIsCreateDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Le fichier doit être une image");
      return;
    }

    setIsUploading(true);
    try {
      await uploadMutation.mutateAsync(file);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  if (isProductsLoading || isScentsLoading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestion des produits</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un produit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingProduct?.id
                  ? "Modifier le produit"
                  : "Ajouter un produit"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom</Label>
                <Input
                  id="name"
                  value={editingProduct?.name || ""}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      name: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editingProduct?.description || ""}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      description: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Prix</Label>
                <Input
                  id="price"
                  type="number"
                  value={editingProduct?.price || 0}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      price: Number(e.target.value),
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image du produit</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="imageUrl"
                    value={editingProduct?.imageUrl || ""}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        imageUrl: e.target.value,
                      })
                    }
                    readOnly
                  />
                  <Button
                    variant="outline"
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById("image-upload")?.click();
                    }}
                    disabled={isUploading}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {isUploading ? "Téléchargement..." : "Télécharger"}
                  </Button>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>
                {editingProduct?.imageUrl && (
                  <div className="mt-2">
                    <Image
                      src={editingProduct.imageUrl}
                      alt="Aperçu"
                      width={100}
                      height={100}
                      className="rounded-md"
                    />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Senteurs disponibles</Label>
                <div className="grid grid-cols-2 gap-2">
                  {scents.map((scent: Scent) => (
                    <div key={scent.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`scent-${scent.id}`}
                        checked={selectedScents.includes(scent.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedScents([...selectedScents, scent.id]);
                          } else {
                            setSelectedScents(
                              selectedScents.filter((id) => id !== scent.id)
                            );
                          }
                        }}
                      />
                      <Label
                        htmlFor={`scent-${scent.id}`}
                        className="flex items-center gap-2"
                      >
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: scent.color }}
                        />
                        {scent.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <Button type="submit" className="w-full">
                {editingProduct?.id ? "Mettre à jour" : "Créer"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <Input
          placeholder="Rechercher un produit..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Prix</TableHead>
              <TableHead>Senteurs</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product: Product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-30 w-30 object-cover rounded"
                    width={100}
                    height={100}
                  />
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell className="max-w-xs text-balance whitespace-normal break-words">
                  {product.description}
                </TableCell>
                <TableCell>{product.price}€</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {product.variants.map((variant) => (
                      <TooltipProvider key={variant.id}>
                        <Tooltip>
                          <TooltipTrigger>
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: variant.scent.color }}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{variant.scent.name}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(product)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
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
