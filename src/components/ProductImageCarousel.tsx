import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ProductImage {
  id: string;
  url: string;
}

interface ProductImageCarouselProps {
  images: ProductImage[];
  productName: string;
  className?: string;
}

export default function ProductImageCarousel({
  images,
  productName,
  className,
}: ProductImageCarouselProps) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  const handleThumbClick = React.useCallback(
    (index: number) => {
      api?.scrollTo(index);
    },
    [api]
  );

  // Si aucune image, afficher un placeholder
  if (!images || images.length === 0) {
    return (
      <div className={cn("w-full", className)}>
        <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
          <span className="text-muted-foreground">Aucune image disponible</span>
        </div>
      </div>
    );
  }

  // Si une seule image, afficher simplement l'image sans carrousel
  if (images.length === 1) {
    return (
      <div className={cn("w-full", className)}>
        <div className="relative aspect-square">
          <Image
            src={images[0].url}
            alt={productName}
            fill
            className="object-cover rounded-lg"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Carrousel principal */}
      <Carousel setApi={setApi} className="w-full">
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={image.id}>
              <Card className="border-0">
                <CardContent className="p-0">
                  <div className="relative aspect-square">
                    <Image
                      src={image.url}
                      alt={`${productName} - Image ${index + 1}`}
                      fill
                      className="object-cover rounded-lg"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority={index === 0}
                    />
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />
      </Carousel>

      {/* Carrousel de vignettes */}
      {images.length > 1 && (
        <Carousel className="mt-4 w-full">
          <CarouselContent className="flex">
            {images.map((image, index) => (
              <CarouselItem
                key={`thumb-${image.id}`}
                className={cn(
                  "basis-1/4 md:basis-1/5 cursor-pointer transition-opacity",
                  current === index + 1 ? "opacity-100" : "opacity-50"
                )}
                onClick={() => handleThumbClick(index)}
              >
                <Card className="border-2 transition-colors">
                  <CardContent className="p-1">
                    <div className="relative aspect-square">
                      <Image
                        src={image.url}
                        alt={`${productName} - Vignette ${index + 1}`}
                        fill
                        className="object-cover rounded-sm"
                        sizes="(max-width: 768px) 25vw, 20vw"
                      />
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      )}

      {/* Indicateur de position */}
      {images.length > 1 && (
        <div className="flex justify-center mt-4">
          <div className="text-sm text-muted-foreground">
            {current} sur {count}
          </div>
        </div>
      )}
    </div>
  );
}
