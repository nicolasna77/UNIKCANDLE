"use client";
import { StarIcon } from "lucide-react";
import { Review, User } from "@/generated/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ItemReviewProduct = ({ review }: { review: Review & { user: User } }) => {
  return (
    <article className="p-6 border border-gray-200 rounded-lg dark:border-gray-700 mb-4">
      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarImage src={review.user.image ?? undefined} />
          <AvatarFallback>{review.user.name?.charAt(0) || "?"}</AvatarFallback>
        </Avatar>
        <div className="font-medium dark:text-white">
          <p>
            {review.user.name || "Utilisateur anonyme"}{" "}
            <time
              dateTime={new Date(review.createdAt).toISOString()}
              className="block text-sm text-gray-500 dark:text-gray-400"
            >
              {new Date(review.createdAt).toLocaleDateString()}
            </time>
          </p>
        </div>
      </div>
      <div className="flex items-center mb-1 space-x-1 rtl:space-x-reverse">
        {[...Array(5)].map((_, i) => (
          <StarIcon
            key={i}
            className={`h-4 w-4 ${
              i < review.rating
                ? "text-yellow-400 fill-current"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
      <p className="my-3 text-gray-600 dark:text-gray-300">{review.comment}</p>
    </article>
  );
};

export default ItemReviewProduct;
