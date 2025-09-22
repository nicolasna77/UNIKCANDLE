import { useQuery } from "@tanstack/react-query";
import { Scent } from "@prisma/client";

export function useScents() {
  return useQuery<Scent[]>({
    queryKey: ["scents"],
    queryFn: async () => {
      const response = await fetch("/api/admin/scents");
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des parfums");
      }
      return response.json();
    },
  });
}
