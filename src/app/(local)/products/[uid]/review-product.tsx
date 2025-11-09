"use client";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { useState, useTransition } from "react";
import Link from "next/link";
import ItemReviewProduct from "./item-review-product";
import { authClient } from "@/lib/auth-client";
import { addReviewFromJSON } from "@/app/actions/reviews";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Loading from "@/components/loading";
import { Product, Review, User } from "@prisma/client";

const REVIEWS_PER_PAGE = 6;

const ReviewProduct = ({ product }: { product: Product }) => {
  const { data: session } = authClient.useSession();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isPending, startTransition] = useTransition();

  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ["reviews", product.id, currentPage],
    queryFn: async () => {
      const response = await fetch(
        `/api/products/review?query=${product.id}&page=${currentPage}&limit=${REVIEWS_PER_PAGE}`
      );
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des avis");
      }
      return response.json();
    },
  });

  const handleSubmitReview = async () => {
    if (rating === 0) {
      toast.error("Veuillez sélectionner une note");
      return;
    }

    if (comment.trim() === "") {
      toast.error("Veuillez ajouter un commentaire");
      return;
    }

    if (!session?.user?.id) {
      toast.error("Vous devez être connecté pour laisser un avis");
      return;
    }

    startTransition(async () => {
      try {
        // Appel de la Server Action
        const result = await addReviewFromJSON({
          productId: product.id,
          userId: session.user.id,
          rating,
          comment,
        });

        if (result.success) {
          // Invalidation du cache React Query
          queryClient.invalidateQueries({ queryKey: ["reviews", product.id] });
          queryClient.invalidateQueries({ queryKey: ["products"] });

          toast.success("Votre avis a été ajouté avec succès !");
          setComment("");
          setRating(0);
          setCurrentPage(1);
        } else {
          toast.error(result.error || "Erreur lors de l'ajout de l'avis");
        }
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Erreur lors de l'ajout de l'avis");
      }
    });
  };

  const totalPages = reviewsData?.totalPages || 1;
  const currentReviews = reviewsData?.reviews || [];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      pages.push(
        <PaginationItem key="1">
          <PaginationLink onClick={() => handlePageChange(1)}>1</PaginationLink>
        </PaginationItem>
      );
      if (startPage > 2) {
        pages.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => handlePageChange(i)}
            isActive={i === currentPage}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      pages.push(
        <PaginationItem key={totalPages}>
          <PaginationLink onClick={() => handlePageChange(totalPages)}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            {currentPage > 1 && (
              <PaginationPrevious
                onClick={() => handlePageChange(currentPage - 1)}
              />
            )}
          </PaginationItem>
          {pages}
          <PaginationItem>
            {currentPage < totalPages && (
              <PaginationNext
                onClick={() => handlePageChange(currentPage + 1)}
              />
            )}
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <div id="reviews" className="mt-16">
      <h2 className="text-2xl font-bold tracking-tight text-foreground">
        Avis clients
      </h2>
      <div className="mt-8">
        {session?.user ? (
          <div className="mb-8 p-6 border border-border rounded-lg bg-card">
            <h3 className="text-lg font-semibold mb-4 text-card-foreground">
              Donnez votre avis
            </h3>
            <div className="flex items-center mb-4">
              <p className="mr-2 text-card-foreground">Note :</p>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1"
                  >
                    {star <= rating ? (
                      <Star className="h-6 w-6 text-primary fill-current" />
                    ) : (
                      <Star className="h-6 w-6 text-muted-foreground" />
                    )}
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <span className="ml-2 text-sm text-primary">
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
              disabled={isPending}
            >
              {isPending ? "Envoi..." : "Publier l'avis"}
            </Button>
          </div>
        ) : (
          <div className="mb-8 p-6 border border-border rounded-lg text-center bg-card">
            <p className="mb-4 text-card-foreground">
              Connectez-vous pour laisser un avis
            </p>
            <Link
              className={buttonVariants({ variant: "outline" })}
              href={`/auth/signin?callbackUrl=/products/${product.id}`}
            >
              Se connecter
            </Link>
          </div>
        )}

        {/* Liste des avis */}
        {isLoading ? (
          <Loading />
        ) : currentReviews.length > 0 ? (
          <>
            <div className="space-y-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentReviews.map((review: Review & { user: User }) => (
                <ItemReviewProduct key={review.id} review={review} />
              ))}
            </div>
            {renderPagination()}
          </>
        ) : (
          <div className="p-6 border border-border rounded-lg text-center bg-card">
            <p className="text-card-foreground">
              Aucun avis pour le moment. Soyez le premier à donner votre avis !
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewProduct;
