import { useQuery } from "@tanstack/react-query";
import { useProducts } from "./useProducts";

export function useProductName(productId: string | undefined) {
  const { data: products, isLoading: isProductsLoading } = useProducts();

  return useQuery({
    queryKey: ["productName", productId],
    queryFn: async () => {
      if (!products || !productId) return null;

      const product = products.find((p) => p.id === productId);
      return product?.name || null;
    },
    enabled: !!productId && !!products && !isProductsLoading,
    staleTime: 5 * 60 * 1000,
  });
}
