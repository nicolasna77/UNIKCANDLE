"use client";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Star } from "lucide-react";
import ReviewProduct from "./review-product";
import { useQuery } from "@tanstack/react-query";
import { fetchProductById, type ProductWithDetails } from "@/services/products";
import LoadingPage from "./loading";
import { useCart } from "@/context/CartContext";
import AudioRecord from "./audio-record";
import TextMessage from "./text-message";
import { toast } from "sonner";
import ProductImageCarousel from "@/components/ProductImageCarousel";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Category, Scent } from "@prisma/client";
import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { getProductTranslation, getCategoryTranslation, getScentTranslation } from "@/lib/product-translation";

// Composant pour l'affichage du prix
const PriceDisplay = ({ price }: { price: number }) => {
  if (typeof price !== "number") return null;
  return (
    <div className="text-3xl font-bold text-primary">{price.toFixed(2)} €</div>
  );
};

// Composant pour l'affichage des avis
const ReviewDisplay = ({ count }: { count: number }) => {
  const t = useTranslations("products.card");
  return (
    <div className="flex items-center gap-2">
      <Star className="h-5 w-5 text-yellow-400 fill-current" />
      <span className="text-sm font-medium text-secondary-foreground">
        {count} {t("reviews")}
      </span>
    </div>
  );
};

// Composant pour l'affichage de la catégorie
const CategoryDisplay = ({
  category,
  translatedName,
}: {
  category: Category | null | undefined;
  translatedName: string;
}) => {
  const t = useTranslations("products.detail");
  if (!category) return null;

  return (
    <Badge
      className="flex items-center gap-2"
      style={{ backgroundColor: category.color || "#ccc" }}
    >
      <span className="text-sm text-white">
        {translatedName || t("noCategory")}
      </span>
    </Badge>
  );
};

// Composant pour l'affichage du parfum
const ScentDisplay = ({ scent, locale }: { scent: Scent | null | undefined; locale: string }) => {
  const t = useTranslations("products.detail");
  if (!scent) return null;

  const translatedName = getScentTranslation(scent, "name", locale);
  const translatedDescription = getScentTranslation(scent, "description", locale);

  return (
    <Card className="border-border/50 bg-card/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <span className="text-2xl">🌸</span>
          {t("scent")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-4">
          {scent.icon && (
            <div className="flex-shrink-0">
              <span className="text-4xl">{scent.icon}</span>
            </div>
          )}
          <div className="flex-1 space-y-2">
            <h4 className="font-semibold text-card-foreground text-lg">
              {translatedName || t("noName")}
            </h4>
            {translatedDescription && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {translatedDescription}
              </p>
            )}
            {scent.notes && scent.notes.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {scent.notes.map((note: string, index: number) => (
                  <Badge key={index} variant="outline">
                    {note}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const DetailProduct = ({ productId }: { productId: string }) => {
  const t = useTranslations("products");
  const locale = useLocale();
  const {
    data: product,
    isLoading,
    error,
  } = useQuery<ProductWithDetails>({
    queryKey: ["productdetail", productId],
    queryFn: () => fetchProductById(productId),
    retry: 1,
    retryDelay: 1000,
  }) as {
    data: ProductWithDetails | undefined;
    isLoading: boolean;
    error: Error | null;
  };
  const { addToCart } = useCart();
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | undefined>();
  const [currentTextMessage, setCurrentTextMessage] = useState<
    string | undefined
  >();

  // Get translated fields based on current locale
  const translatedName = product ? getProductTranslation(product, "name", locale) : "";
  const translatedDescription = product ? getProductTranslation(product, "description", locale) : "";
  const translatedSubTitle = product ? getProductTranslation(product, "subTitle", locale) : "";
  const translatedCategoryName = product?.category ? getCategoryTranslation(product.category, "name", locale) : "";

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
        <div className="text-destructive text-xl font-semibold">
          {error?.message || t("detail.errorLoading")}
        </div>
        <p className="text-muted-foreground">
          {t("detail.productNotFound")}
        </p>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="mt-4"
        >
          {t("detail.retry")}
        </Button>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!product || !product.price) {
      toast.error(t("detail.priceNotAvailable"));
      return;
    }

    addToCart({
      id: product.id,
      name: translatedName,
      price: product.price,
      imageUrl: product.images[0]?.url || "",
      selectedScent: product.scent,
      description: translatedDescription,
      subTitle: translatedSubTitle,
      category: product.category,
      audioUrl: currentAudioUrl,
      textMessage: currentTextMessage,
      quantity: 1,
    });
    toast.success(t("card.addedToCart"));
  };

  return (
    <section>
      <div className="max-w-7xl mx-auto">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12">
          {/* Colonne de gauche - Carrousel d'images du produit */}
          <div className="relative">
            <ProductImageCarousel
              images={product.images || []}
              productName={translatedName}
            />
          </div>

          {/* Colonne de droite - Informations produit */}
          <div className="mt-8 lg:mt-0 space-y-6">
            {/* En-tête produit */}
            <div className="space-y-4">
              <div className="flex md:flex-row flex-col justify-between md:items-center gap-4">
                <h1 className="text-3xl font-bold ">{translatedName}</h1>
                <PriceDisplay price={product.price} />
              </div>

              <div className="flex items-center gap-4">
                <ReviewDisplay count={product.reviewCount} />
                <CategoryDisplay category={product.category} translatedName={translatedCategoryName} />
              </div>

              <p className="text-lg text-muted-foreground">
                {translatedSubTitle}
              </p>
            </div>

            <Separator />

            {/* Affichage du parfum */}
            <ScentDisplay scent={product.scent} locale={locale} />

            {/* Message personnalisé - Audio ou Texte selon le type */}
            {product.messageType === "text" ? (
              <TextMessage
                productId={product.id}
                onTextChange={setCurrentTextMessage}
              />
            ) : (
              <AudioRecord
                productId={product.id}
                onAudioChange={setCurrentAudioUrl}
              />
            )}

            {/* Boutons d'action */}
            <div className="flex gap-4">
              <Button onClick={handleAddToCart} size="lg" className="flex-1">
                <ShoppingBag className="w-5 h-5 mr-2" />
                {t("addToCart")}
              </Button>
            </div>
          </div>
        </div>

        {/* Description et avis */}
        <div className="mt-16 space-y-8">
          <div className=" py-6">
            <h2 className="text-2xl font-bold mb-4">{t("detail.description")}</h2>
            <p
              className=" leading-relaxed"
              dangerouslySetInnerHTML={{ __html: translatedDescription }}
            ></p>
          </div>

          <ReviewProduct product={product} />
        </div>
      </div>
    </section>
  );
};

export default DetailProduct;
