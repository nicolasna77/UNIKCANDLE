"use client";
import { StarIcon } from "lucide-react";
import Image from "next/image";

interface ReviewItemProps {
  review: {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    user: {
      name: string | null;
      image: string | null;
    };
  };
}

const ItemReviewProduct = ({ review }: ReviewItemProps) => {
  return (
    <article className="p-6 border border-gray-200 rounded-lg dark:border-gray-700 mb-4">
      <div className="flex items-center mb-4">
        {review.user.image ? (
          <Image
            className="w-10 h-10 me-4 rounded-full"
            src={review.user.image ?? undefined}
            alt={review.user.name || "Utilisateur"}
            width={40}
            height={40}
          />
        ) : (
          <div className="w-10 h-10 me-4 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">
              {(review.user.name || "?").charAt(0)}
            </span>
          </div>
        )}
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
      <div className="flex items-center mt-3">
        <button className="px-2 py-1.5 text-xs font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
          Utile
        </button>
        <button className="ps-4 text-sm font-medium text-blue-600 hover:underline dark:text-blue-500 border-gray-200 ms-4 border-s md:mb-0 dark:border-gray-600">
          Signaler
        </button>
      </div>
    </article>
  );
};

export default ItemReviewProduct;
