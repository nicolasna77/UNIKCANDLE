import { useQuery } from "@tanstack/react-query";
import { ProductWithDetails } from "@/app/products/[uid]/types";

// Fonction pour récupérer tous les produits
async function fetchProducts(): Promise<ProductWithDetails[]> {
  const response = await fetch(`${window.location.origin}/api/products`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Erreur lors de la récupération des produits");
  }

  return response.json();
}

// Hook pour récupérer tous les produits
export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });
}

// Hook pour récupérer un produit spécifique par son ID
export function useProduct(productId: string) {
  return useQuery({
    queryKey: ["products", productId],
    queryFn: async () => {
      const products = await fetchProducts();
      const product = products.find((p) => p.id === productId);

      if (!product) {
        throw new Error(`Produit avec l'ID ${productId} non trouvé`);
      }

      return product;
    },
    enabled: !!productId,
  });
}
