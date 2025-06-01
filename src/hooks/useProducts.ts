import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Product, Category, Scent, Image, Review } from "@/generated/client";

interface ProductWithDetails extends Product {
  category: Category;
  scent: Scent;
  images: Image[];
  reviews: Review[];
  averageRating: number;
  reviewCount: number;
}

interface PaginatedResponse {
  products: ProductWithDetails[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}

interface UseProductsParams {
  page?: number;
  categoryId?: string;
  sortBy?: string;
  sortOrder?: string;
}

// Hook pour récupérer les produits
export function useProducts(params?: UseProductsParams) {
  const { page = 1, categoryId, sortBy, sortOrder } = params || {};

  return useQuery<PaginatedResponse>({
    queryKey: ["products", page, categoryId, sortBy, sortOrder],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        ...(categoryId && { categoryId }),
        ...(sortBy && { sortBy }),
        ...(sortOrder && { sortOrder }),
      });

      const response = await fetch(`/api/products?${searchParams.toString()}`);
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des produits");
      }
      return response.json();
    },
  });
}

// Hook pour créer un produit
export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      description: string;
      price: number;
      subTitle: string;
      slogan: string;
      categoryId: string;
      arAnimation: string;
      scentId: string;
      images: { url: string }[];
    }) => {
      const response = await fetch("/api/admin/products", {
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
    },
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
    mutationFn: async (data: {
      id: string;
      name?: string;
      description?: string;
      price?: number;
      subTitle?: string;
      slogan?: string;
      categoryId?: string;
      arAnimation?: string;
      scentId?: string;
      images?: { url: string }[];
    }) => {
      const response = await fetch(`/api/admin/products/${data.id}`, {
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
    },
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
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Erreur lors de la suppression du produit");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Produit supprimé avec succès");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la suppression du produit");
    },
  });
}

// Hook pour récupérer un produit spécifique
export const useProduct = (productId: string) => {
  return useQuery<ProductWithDetails>({
    queryKey: ["productdetail", productId],
    queryFn: async () => {
      console.log("Fetching product with ID:", productId);
      const response = await fetch(`/api/products/${productId}`);
      console.log("Response status:", response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error("Error response:", error);
        throw new Error(
          error.error || "Erreur lors de la récupération du produit"
        );
      }

      const data = await response.json();
      console.log("Received data:", data);

      // Vérification des données requises
      if (!data.category || !data.scent || !data.images) {
        console.error("Données manquantes dans la réponse:", {
          category: data.category,
          scent: data.scent,
          images: data.images,
        });
        throw new Error("Données du produit incomplètes");
      }

      return data;
    },
  });
};
