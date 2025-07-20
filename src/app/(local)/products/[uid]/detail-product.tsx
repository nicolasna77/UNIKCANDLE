"use client";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Star } from "lucide-react";
import ReviewProduct from "./review-product";
import { useProduct } from "@/hooks/useProducts";
import LoadingPage from "../loading";
import { useCart } from "@/context/CartContext";
import AudioRecord from "./audio-record";
import { toast } from "sonner";
import ProductImageCarousel from "@/components/ProductImageCarousel";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Category,
  Product,
  Scent,
  Image as PrismaImage,
  Review,
} from "@/generated/client";
import { useState } from "react";

interface ProductWithDetails extends Product {
  category: Category;
  scent: Scent;
  images: PrismaImage[];
  reviews: Review[];
  averageRating: number;
  reviewCount: number;
}

// Composant pour l'affichage du prix
const PriceDisplay = ({ price }: { price: number }) => {
  if (typeof price !== "number") return null;
  return (
    <div className="text-3xl font-bold text-primary">{price.toFixed(2)} €</div>
  );
};

// Composant pour l'affichage des avis
const ReviewDisplay = ({ count }: { count: number }) => (
  <div className="flex items-center gap-2">
    <Star className="h-5 w-5 text-yellow-400 fill-current" />
    <span className="text-sm font-medium text-secondary-foreground">
      {count} avis
    </span>
  </div>
);

// Composant pour l'affichage de la catégorie
const CategoryDisplay = ({
  category,
}: {
  category: Category | null | undefined;
}) => {
  if (!category) return null;

  return (
    <Badge
      className="flex items-center gap-2"
      style={{ backgroundColor: category.color || "#ccc" }}
    >
      <span className="text-sm text-white">
        {category.name || "Sans catégorie"}
      </span>
    </Badge>
  );
};

// Composant pour l'affichage du parfum
const ScentDisplay = ({ scent }: { scent: Scent | null | undefined }) => {
  if (!scent) return null;

  return (
    <div className="mt-4 p-4 rounded-lg border bg-card">
      <h3 className="text-lg font-semibold mb-2">Parfum</h3>
      <div className="flex items-center gap-3">
        {scent.icon && <span className="text-3xl">{scent.icon}</span>}
        <div>
          <p className="font-medium">{scent.name || "Sans nom"}</p>
          {scent.description && (
            <p className="text-sm text-muted-foreground">{scent.description}</p>
          )}
          {scent.notes && scent.notes.length > 0 && (
            <div className="flex gap-2 mt-2">
              {scent.notes.map((note: string, index: number) => (
                <Badge key={index} variant="secondary">
                  {note}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DetailProduct = ({ productId }: { productId: string }) => {
  const {
    data: product,
    isLoading,
    error,
  } = useProduct(productId) as {
    data: ProductWithDetails | undefined;
    isLoading: boolean;
    error: Error | null;
  };
  const { addToCart } = useCart();
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | undefined>();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingPage />
      </div>
    );
  }

  if (error || !product) {
    console.error("Erreur ou produit non trouvé:", { error, product });
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="text-red-500 text-xl font-semibold">
          {error?.message || "Erreur lors du chargement du produit"}
        </div>
        <p className="text-muted-foreground">
          Le produit que vous recherchez n&apos;existe pas ou n&apos;est plus
          disponible.
        </p>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="mt-4"
        >
          Réessayer
        </Button>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!product.price) {
      toast.error("Prix du produit non disponible");
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.images[0]?.url || "",
      selectedScent: product.scent,
      description: product.description,
      subTitle: product.subTitle,
      category: product.category,
      audioUrl: currentAudioUrl,
      createdAt: new Date(product.createdAt),
      updatedAt: new Date(product.updatedAt),
      deletedAt: product.deletedAt ? new Date(product.deletedAt) : null,
      quantity: 1,
    });
    toast.success("Produit ajouté au panier");
  };

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12">
          {/* Colonne de gauche - Carrousel d'images du produit */}
          <div className="relative">
            <ProductImageCarousel
              images={product.images || []}
              productName={product.name}
            />
          </div>

          {/* Colonne de droite - Informations produit */}
          <div className="mt-8 lg:mt-0 space-y-6">
            {/* En-tête produit */}
            <div className="space-y-4">
              <div className="flex md:flex-row flex-col justify-between md:items-center gap-4">
                <h1 className="text-3xl font-bold ">{product.name}</h1>
                <PriceDisplay price={product.price} />
              </div>

              <div className="flex items-center gap-4">
                <ReviewDisplay count={product.reviewCount} />
                <CategoryDisplay category={product.category} />
              </div>

              <p className="text-lg text-muted-foreground">
                {product.subTitle}
              </p>
            </div>

            <Separator />

            {/* Affichage du parfum */}
            <ScentDisplay scent={product.scent} />

            {/* Message personnalisé */}
            <AudioRecord
              productId={product.id}
              onAudioChange={setCurrentAudioUrl}
            />

            {/* Boutons d'action */}
            <div className="flex gap-4">
              <Button onClick={handleAddToCart} size="lg" className="flex-1">
                <ShoppingBag className="w-5 h-5 mr-2" />
                Ajouter au panier
              </Button>
            </div>
          </div>
        </div>

        {/* Description et avis */}
        <div className="mt-16 space-y-8">
          <div className=" py-6">
            <h2 className="text-2xl font-bold mb-4">Description</h2>
            <p className=" leading-relaxed">{product.description}</p>
          </div>

          <ReviewProduct product={product} />
        </div>
      </div>
    </section>
  );
};

export default DetailProduct;
