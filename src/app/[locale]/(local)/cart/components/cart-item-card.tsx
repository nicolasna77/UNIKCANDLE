"use client";

import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, MessageSquare, Medal, Video, Mic } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import type { CartItem } from "@/context/CartContext";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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
  const qty = item.quantity || 1;
  const engravingCost = item.engravingText && item.engravingPrice ? item.engravingPrice : 0;
  const lineTotal = (item.price + engravingCost) * qty;

  return (
    <div
      className={`rounded-2xl border bg-card overflow-hidden shadow-sm transition-shadow hover:shadow-md ${
        hasCustomization ? "border-l-4 border-l-primary border-border" : "border-border"
      }`}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="relative w-40 sm:w-56 self-stretch shrink-0 overflow-hidden bg-muted rounded-l-2xl">
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover"
            sizes="128px"
          />
        </div>

        {/* Contenu */}
        <div className="flex-1 flex flex-col gap-3 p-4">
          {/* Ligne titre + suppression */}
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-0.5 min-w-0">
              <Link href={`/products/${item.id}`} className="hover:underline">
                <h3 className="font-semibold text-foreground text-base leading-tight truncate">
                  {item.name}
                </h3>
              </Link>
              {item.selectedScent?.name && (
                <p className="text-sm text-muted-foreground">{item.selectedScent.name}</p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={() => onRemove(itemKey)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Badges personnalisation */}
          {(item.videoUrl || item.audioUrl || item.textMessage || item.engravingText) && (
            <div className="flex flex-wrap gap-1.5">
              {item.videoUrl && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Video className="h-3 w-3" />
                  Vidéo
                </Badge>
              )}
              {item.audioUrl && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Mic className="h-3 w-3" />
                  Audio
                </Badge>
              )}
              {item.textMessage && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <MessageSquare className="h-3 w-3" />
                  Message
                </Badge>
              )}
              {item.engravingText && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Medal className="h-3 w-3" />
                  Gravure
                  {item.engravingPrice && item.engravingPrice > 0 && (
                    <span className="text-muted-foreground ml-0.5">
                      +{(item.engravingPrice * qty).toFixed(2)} €
                    </span>
                  )}
                </Badge>
              )}
            </div>
          )}

          {/* Lecteur vidéo */}
          {item.videoUrl && (
            <div className="rounded-xl overflow-hidden bg-black w-full max-w-xs aspect-video">
              <video
                src={item.videoUrl}
                controls
                playsInline
                className="w-full h-full object-contain"
              />
            </div>
          )}

          {/* Lecteur audio */}
          {item.audioUrl && (
            <audio
              src={item.audioUrl}
              controls
              className="w-full max-w-xs rounded-lg h-10"
              style={{ accentColor: "hsl(var(--primary))" }}
            />
          )}

          {/* Message texte */}
          {item.textMessage && (
            <div className="bg-muted/50 border border-border rounded-lg px-3 py-2 max-w-sm">
              <p className="text-sm text-foreground italic leading-snug">
                &quot;{item.textMessage}&quot;
              </p>
            </div>
          )}

          {/* Gravure */}
          {item.engravingText && (
            <div className="flex flex-wrap gap-2">
              {item.engravingText.split(",").map((text, i) => (
                <div
                  key={i}
                  className="flex items-center px-3 py-1 bg-primary/5 rounded-lg border border-primary/20"
                >
                  <p className="font-serif italic text-primary tracking-widest text-xs">
                    ✦ {text.trim()} ✦
                  </p>
                </div>
              ))}
            </div>
          )}

          <Separator className="mt-auto" />

          {/* Quantité + prix */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => onUpdateQuantity(itemKey, qty - 1)}
                disabled={qty <= 1}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-8 text-center text-sm font-medium">{qty}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => onUpdateQuantity(itemKey, qty + 1)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            <div className="text-right">
              <p className="font-semibold text-foreground">{lineTotal.toFixed(2)} €</p>
              {qty > 1 && (
                <p className="text-xs text-muted-foreground">
                  {(item.price + engravingCost).toFixed(2)} € / unité
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
