import { useQuery } from "@tanstack/react-query";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await fetch("/api/categories");
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des catégories");
      }
      return response.json();
    },
  });
}
