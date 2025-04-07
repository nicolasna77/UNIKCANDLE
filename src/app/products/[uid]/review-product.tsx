"use client";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import ItemReviewProduct from "./item-review-product";
import { ProductWithDetails, Review } from "./types";
import { authClient } from "@/lib/auth-client";
import { useAddReview } from "@/hooks/useReviews";

const ReviewProduct = ({ product }: { product: ProductWithDetails }) => {
  const { data: session } = authClient.useSession();
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);

  // Utiliser la mutation TanStack Query
  const addReviewMutation = useAddReview();

  const handleSubmitReview = async () => {
    try {
      // Appeler la mutation - toutes les validations sont gérées dans le hook
      await addReviewMutation.mutateAsync({
        productId: product.id,
        rating,
        comment,
      });

      // Réinitialiser le formulaire en cas de succès
      setComment("");
      setRating(0);
    } catch (error) {
      // La gestion d'erreurs est faite dans le hook useAddReview
      console.error("Erreur:", error);
    }
  };

  return (
    <div id="reviews" className="mt-16">
      <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
        Avis clients
      </h2>
      <div className="mt-8">
        {session?.user ? (
          <div className="mb-8 p-6 border border-gray-200 rounded-lg dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">
              Donnez votre avis
            </h3>
            <div className="flex items-center mb-4">
              <p className="mr-2 dark:text-white">Note :</p>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1"
                  >
                    {star <= rating ? (
                      <Star className="h-6 w-6 text-yellow-400 fill-current" />
                    ) : (
                      <Star className="h-6 w-6 text-yellow-400" />
                    )}
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <span className="ml-2 text-sm text-green-600">
                  {rating} étoile{rating > 1 ? "s" : ""}
                </span>
              )}
            </div>
            <Textarea
              placeholder="Partagez votre expérience avec ce produit..."
              value={comment}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setComment(e.target.value)
              }
              className="min-h-[100px] mb-4"
            />
            <Button
              onClick={handleSubmitReview}
              disabled={addReviewMutation.isPending}
            >
              {addReviewMutation.isPending ? "Envoi..." : "Publier l'avis"}
            </Button>
          </div>
        ) : (
          <div className="mb-8 p-6 border border-gray-200 rounded-lg text-center dark:border-gray-700">
            <p className="mb-4 dark:text-white">
              Connectez-vous pour laisser un avis
            </p>
            <Link
              className={buttonVariants({ variant: "outline" })}
              href="/auth/signin"
            >
              Se connecter
            </Link>
          </div>
        )}

        {/* Liste des avis */}
        {product.reviews && product.reviews.length > 0 ? (
          <div className="space-y-6">
            {product.reviews.map((review: Review) => (
              <ItemReviewProduct key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <div className="p-6 border border-gray-200 rounded-lg text-center dark:border-gray-700">
            <p className="dark:text-white">
              Aucun avis pour le moment. Soyez le premier à donner votre avis !
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewProduct;
