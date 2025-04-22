import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface CreateCheckoutSessionParams {
  items: {
    id: string;
    quantity: number;
    price: number;
    name: string;
    selectedScent: {
      id: string;
      name: string;
    };
  }[];
}

export const useCreateCheckoutSession = () => {
  return useMutation({
    mutationFn: async (params: CreateCheckoutSessionParams) => {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création de la session de paiement");
      }

      return response.json();
    },
    onError: (error) => {
      toast.error("Erreur lors de la création de la session de paiement");
      console.error(error);
    },
  });
};
