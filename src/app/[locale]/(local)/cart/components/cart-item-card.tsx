"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Plus, Minus, MessageSquare } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { AudioPlayer } from "@/components/AudioPlayer";
import { useTranslations } from "next-intl";
import type { CartItem } from "@/context/CartContext";

interface CartItemCardProps {
  item: CartItem;
  itemKey: string;
  onUpdateQuantity: (key: string, quantity: number) => void;
  onRemove: (key: string) => void;
  hasCustomization?: boolean;
}

export function CartItemCard({
  item,
  itemKey,
  onUpdateQuantity,
  onRemove,
  hasCustomization = false,
}: CartItemCardProps) {
  const t = useTranslations("cart");

  return (
    <Card
      className={`overflow-hidden border-border p-0 ${
        hasCustomization ? "border-l-4 border-l-primary" : ""
      }`}
    >
      <CardContent className="p-0">
        <div className="flex h-full flex-col md:flex-row">
          {/* Image produit */}
          <div className="relative h-auto w-full md:w-32">
            <Image
              src={item.imageUrl}
              alt={item.name}
              width={500}
              height={500}
              className="h-full w-full object-cover md:w-32"
            />
          </div>

          {/* Détails produit */}
          <div className="flex-1 p-6 pb-3">
            <div className="flex justify-between">
              <div>
                <Link href={`/products/${item.id}`} className="hover:underline">
                  <h3 className="font-medium text-foreground">{item.name}</h3>
                </Link>
                <p className="text-muted-foreground text-sm">
                  {item.selectedScent?.name}
                </p>

                {/* Affichage de l'audio */}
                {item.audioUrl && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                        {t("audioCustomized")}
                      </span>
                    </div>
                    <div className="max-w-md">
                      <AudioPlayer
                        audioUrl={item.audioUrl}
                        showControls={true}
                        className="text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* Affichage du message texte */}
                {item.textMessage && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-3 w-3 text-primary" />
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                        Message personnalisé
                      </span>
                    </div>
                    <div className="bg-muted/50 border border-border rounded-lg p-3 max-w-md">
                      <p className="text-sm text-foreground italic">
                        &quot;{item.textMessage}&quot;
                      </p>
                    </div>
                  </div>
                )}

                {/* Affichage si pas de personnalisation */}
                {!item.audioUrl && !item.textMessage && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                      {t("noAudio")}
                    </span>
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemove(itemKey)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    onUpdateQuantity(itemKey, (item.quantity || 1) - 1)
                  }
                  disabled={(item.quantity || 1) <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center text-foreground">
                  {item.quantity || 1}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    onUpdateQuantity(itemKey, (item.quantity || 1) + 1)
                  }
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-right">
                <div className="font-medium text-foreground">
                  {(item.price * (item.quantity || 1)).toFixed(2)} €
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
