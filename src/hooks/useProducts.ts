import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  variants: ProductVariant[];
}

interface ProductVariant {
  id: string;
  productId: string;
  scentId: string;
  imageUrl: string;
  isAvailable: boolean;
  scent: Scent;
}

interface Scent {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  model3dUrl: string;
}

interface CreateProductData {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  variants: {
    scentId: string;
    imageUrl: string;
  }[];
}

interface UpdateProductData extends Partial<CreateProductData> {
  id: string;
}

// Fonction pour récupérer tous les produits
async function fetchProducts(id?: string) {
  try {
    const response = await fetch(
      id ? `/api/products?query=${id}` : "/api/products"
    );
    if (!response.ok) {
      if (response.status === 404) {
        return [];
      }
      throw new Error("Erreur lors de la récupération des produits");
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [data];
  } catch (error) {
    console.error("Erreur lors de la récupération des produits:", error);
    return [];
  }
}

// Fonction pour créer un produit
async function createProduct(data: CreateProductData): Promise<Product> {
  const response = await fetch("/api/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Erreur lors de la création du produit");
  }
  return response.json();
}

// Fonction pour mettre à jour un produit
async function updateProduct(data: UpdateProductData): Promise<Product> {
  const response = await fetch(`/api/products/${data.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Erreur lors de la mise à jour du produit");
  }
  return response.json();
}

// Fonction pour supprimer un produit
async function deleteProduct(id: string): Promise<void> {
  const response = await fetch(`/api/products`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  });
  if (!response.ok) {
    throw new Error("Erreur lors de la suppression du produit");
  }
}

// Hook pour récupérer les produits
export function useProducts(id?: string) {
  return useQuery({
    queryKey: ["products", id],
    queryFn: () => (id ? fetchProducts(id) : fetchProducts()),
  });
}

// Hook pour créer un produit
export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Produit créé avec succès");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la création du produit");
    },
  });
}

// Hook pour mettre à jour un produit
export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Produit mis à jour avec succès");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la mise à jour du produit");
    },
  });
}

// Hook pour supprimer un produit
export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Produit supprimé avec succès");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la suppression du produit");
    },
  });
}

export function useAdminProducts() {
  return useQuery({
    queryKey: ["adminProducts"],
    queryFn: async () => {
      const response = await fetch(
        `${window.location.origin}/api/admin/products`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("better-auth-session")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des produits");
      }

      return response.json();
    },
  });
}

// Hook pour récupérer un produit spécifique
export function useProduct(id: string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProducts(id).then((products) => products[0]),
  });
}
