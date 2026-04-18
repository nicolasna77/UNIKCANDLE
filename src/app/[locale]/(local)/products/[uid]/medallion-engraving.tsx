"use client";

import { useState, useEffect } from "react";
import { Medal, X, Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface MedallionEngravingProps {
  productId: string;
  engravingPrice: number | null;
  quantity: number;
  onEngravingChange?: (text: string | undefined) => void;
}

const MAX_CHARS_PER_ENGRAVING = 11;

export default function MedallionEngraving({
  productId,
  engravingPrice,
  quantity,
  onEngravingChange,
}: MedallionEngravingProps) {
  const t = useTranslations("products.medallionEngraving");
  const { updateItemEngraving, removeItemEngraving, cart } = useCart();
  const [open, setOpen] = useState(false);
  const [fields, setFields] = useState<string[]>(() =>
    Array.from({ length: quantity }, () => "")
  );

  const cartItem = cart.find((item) => item.id === productId);

  useEffect(() => {
    if (cartItem?.engravingText) {
      const parts = cartItem.engravingText.split(",").map((s) => s.trim());
      setFields(
        Array.from({ length: quantity }, (_, i) => parts[i] ?? "")
      );
    } else {
      setFields(Array.from({ length: quantity }, () => ""));
    }
  }, [cartItem?.engravingText, quantity]);

  useEffect(() => {
    setFields((prev) =>
      Array.from({ length: quantity }, (_, i) => prev[i] ?? "")
    );
  }, [quantity]);

  const hasEngraving = fields.some((f) => f.trim().length > 0);
  const allValid = fields.every(
    (f) => f.trim().length <= MAX_CHARS_PER_ENGRAVING
  );

  const handleConfirm = () => {
    if (!allValid) return;
    const combined = fields.map((f) => f.trim()).join(", ");
    if (combined.replace(/,\s*/g, "").length === 0) {
      removeItemEngraving(productId);
      onEngravingChange?.(undefined);
      toast.success(t("engravingRemoved"));
    } else {
      updateItemEngraving(productId, combined);
      onEngravingChange?.(combined);
      toast.success(
        quantity > 1
          ? t("engravingsSaved", { count: quantity })
          : t("engravingSaved")
      );
    }
    setOpen(false);
  };

  const handleClear = () => {
    setFields(Array.from({ length: quantity }, () => ""));
    removeItemEngraving(productId);
    onEngravingChange?.(undefined);
    toast.success(t("engravingRemoved"));
    setOpen(false);
  };

  const priceLabel =
    engravingPrice && engravingPrice > 0
      ? `+${engravingPrice.toFixed(2)} €`
      : t("free");

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button
          type="button"
          className={cn(
            "w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all duration-200 text-left",
            hasEngraving
              ? "border-primary bg-primary/10"
              : "border-border hover:border-primary/50 bg-muted/30 hover:bg-primary/5"
          )}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full",
                hasEngraving ? "bg-primary/20" : "bg-muted"
              )}
            >
              <Medal
                className={cn(
                  "w-5 h-5",
                  hasEngraving ? "text-primary" : "text-muted-foreground"
                )}
              />
            </div>
            <div>
              <p className="font-semibold text-sm">{t("title")}</p>
              <p className="text-xs text-muted-foreground">
                {hasEngraving
                  ? fields
                      .filter((f) => f.trim())
                      .map((f) => `"${f.trim()}"`)
                      .join(", ")
                  : t("customize")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {hasEngraving && (
              <Badge
                variant="secondary"
                className="bg-primary/20 text-primary"
              >
                <Check className="w-3 h-3 mr-1" />
                {t("configured")}
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {priceLabel}
            </Badge>
          </div>
        </button>
      </DrawerTrigger>

      <DrawerContent>
        <div className="mx-auto w-full max-w-lg">
          <DrawerHeader className="text-left">
            <DrawerTitle className="flex items-center gap-2">
              <Medal className="w-5 h-5 text-primary" />
              {t("title")}
            </DrawerTitle>
            <DrawerDescription>
              {quantity > 1
                ? t("drawerDescriptionMultiple", {
                    count: quantity,
                    max: MAX_CHARS_PER_ENGRAVING,
                  })
                : t("drawerDescriptionSingle", {
                    max: MAX_CHARS_PER_ENGRAVING,
                  })}
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4 space-y-4">
            {engravingPrice && engravingPrice > 0 ? (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/30">
                <Info className="w-4 h-4 text-primary shrink-0" />
                <p className="text-sm text-primary">
                  {t("priceInfo", { price: engravingPrice.toFixed(2) })}
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                <Check className="w-4 h-4 text-green-600 shrink-0" />
                <p className="text-sm text-green-700 dark:text-green-300">
                  {t("freeInfo")}
                </p>
              </div>
            )}

            <div className="space-y-3">
              {fields.map((value, index) => {
                const remaining = MAX_CHARS_PER_ENGRAVING - value.length;
                return (
                  <div key={index} className="space-y-1">
                    {quantity > 1 && (
                      <label className="text-xs font-medium text-muted-foreground">
                        {t("medallionLabel", { index: index + 1 })}
                      </label>
                    )}
                    <div className="relative">
                      <Input
                        value={value}
                        onChange={(e) => {
                          if (
                            e.target.value.length > MAX_CHARS_PER_ENGRAVING
                          )
                            return;
                          const next = [...fields];
                          next[index] = e.target.value;
                          setFields(next);
                        }}
                        placeholder={
                          quantity > 1
                            ? t("placeholderMultiple", { index: index + 1 })
                            : t("placeholder")
                        }
                        maxLength={MAX_CHARS_PER_ENGRAVING}
                        className={cn(
                          "pr-14",
                          remaining < 3 &&
                            "border-destructive focus-visible:ring-destructive"
                        )}
                      />
                      <span
                        className={cn(
                          "absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono",
                          remaining < 3
                            ? "text-destructive"
                            : "text-muted-foreground"
                        )}
                      >
                        {remaining}
                      </span>
                    </div>

                    {value.trim() && (
                      <div className="flex items-center justify-center py-2 px-4 bg-primary/5 rounded-lg border border-primary/20">
                        <p className="font-serif italic text-primary tracking-widest text-sm">
                          ✦ {value.trim()} ✦
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <DrawerFooter className="pt-4">
            <Button
              onClick={handleConfirm}
              disabled={!allValid}
              className="w-full"
            >
              <Medal className="w-4 h-4 mr-2" />
              {t("confirmButton")}
            </Button>
            {hasEngraving && (
              <Button
                variant="ghost"
                onClick={handleClear}
                className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <X className="w-4 h-4 mr-2" />
                {t("clearButton")}
              </Button>
            )}
            <DrawerClose asChild>
              <Button variant="outline" className="w-full">
                {t("cancelButton")}
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
