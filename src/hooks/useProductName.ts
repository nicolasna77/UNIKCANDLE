import { useQuery } from "@tanstack/react-query";

export function useProductName(productId?: string) {
  return useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      if (!productId) return { name: "" };
      const response = await fetch(`/api/products/${productId}`);
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération du produit");
      }
      const data = await response.json();
      return { name: data.name };
    },
    enabled: !!productId,
  });
}
