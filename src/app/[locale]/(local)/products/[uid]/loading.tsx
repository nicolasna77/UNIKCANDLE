import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const ProductDetailSkeleton = () => {
  return (
    <section>
      <div className="max-w-7xl mx-auto">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12">
          {/* Colonne de gauche - Image skeleton */}
          <div className="relative">
            <div className="aspect-square bg-muted rounded-lg animate-pulse" />
          </div>

          {/* Colonne de droite - Informations produit skeleton */}
          <div className="mt-8 lg:mt-0 space-y-6">
            {/* En-tête produit */}
            <div className="space-y-4">
              <div className="flex md:flex-row flex-col justify-between md:items-center gap-4">
                {/* Titre */}
                <div className="h-9 bg-muted rounded-lg w-2/3 animate-pulse" />
                {/* Prix */}
                <div className="h-9 bg-muted rounded-lg w-24 animate-pulse" />
              </div>

              <div className="flex items-center gap-4">
                {/* Avis */}
                <div className="h-6 bg-muted rounded-full w-24 animate-pulse" />
                {/* Catégorie */}
                <div className="h-6 bg-muted rounded-full w-32 animate-pulse" />
              </div>

              {/* Sous-titre */}
              <div className="h-6 bg-muted rounded w-full animate-pulse" />
            </div>

            <Separator />

            {/* Carte parfum skeleton */}
            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-3">
                <div className="h-6 bg-muted rounded w-32 animate-pulse" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  {/* Icône */}
                  <div className="w-12 h-12 bg-muted rounded-full animate-pulse flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    {/* Nom */}
                    <div className="h-6 bg-muted rounded w-40 animate-pulse" />
                    {/* Description */}
                    <div className="h-4 bg-muted rounded w-full animate-pulse" />
                    <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                    {/* Notes */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      <div className="h-6 bg-muted rounded-full w-20 animate-pulse" />
                      <div className="h-6 bg-muted rounded-full w-24 animate-pulse" />
                      <div className="h-6 bg-muted rounded-full w-16 animate-pulse" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Audio/Text message skeleton */}
            <Card>
              <CardHeader>
                <div className="h-6 bg-muted rounded w-48 animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>

            {/* Bouton */}
            <div className="h-12 bg-muted rounded-lg w-full animate-pulse" />
          </div>
        </div>

        {/* Description et avis skeleton */}
        <div className="mt-16 space-y-8">
          {/* Titre description */}
          <div className="h-8 bg-muted rounded w-48 animate-pulse" />
          {/* Paragraphes */}
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded w-full animate-pulse" />
            <div className="h-4 bg-muted rounded w-full animate-pulse" />
            <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
          </div>

          <Separator className="my-8" />

          {/* Section avis */}
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded w-32 animate-pulse" />
            {/* Avis skeleton */}
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index}>
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded w-32 animate-pulse mb-2" />
                      <div className="h-3 bg-muted rounded w-24 animate-pulse" />
                    </div>
                  </div>
                  <div className="h-4 bg-muted rounded w-full animate-pulse" />
                  <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetailSkeleton;
