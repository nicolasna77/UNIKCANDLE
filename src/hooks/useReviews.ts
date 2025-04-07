import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

interface AddReviewData {
  productId: string;
  rating: number;
  comment: string;
}

// Fonction pour ajouter un avis
async function addReview(data: AddReviewData) {
  if (data.rating === 0) {
    throw new Error("Veuillez sélectionner une note");
  }

  if (data.comment.trim() === "") {
    throw new Error("Veuillez ajouter un commentaire");
  }

  // Récupérer la session pour obtenir l'ID utilisateur
  const { data: session } = await authClient.getSession();

  if (!session?.user?.id) {
    throw new Error("Vous devez être connecté pour laisser un avis");
  }

  console.log("Envoi d'avis avec userId:", session.user.id);

  try {
    const response = await fetch(`/api/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        userId: session.user.id,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Erreur lors de l'ajout de l'avis");
    }

    return response.json();
  } catch (error) {
    console.error("Erreur d'ajout d'avis:", error);
    throw error instanceof Error
      ? error
      : new Error("Erreur inattendue lors de l'ajout de l'avis");
  }
}

// Hook pour ajouter un avis
export function useAddReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addReview,
    onSuccess: () => {
      // Invalider le cache des produits pour forcer un rechargement
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Votre avis a été ajouté avec succès !");
    },
    onError: (error: Error) => {
      console.error("Erreur dans la mutation:", error);
      toast.error(error.message || "Erreur lors de l'ajout de l'avis");
    },
  });
}
