"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";

interface AnnouncementBannerProps {
  onDismiss: () => void;
}

export default function AnnouncementBanner({ onDismiss }: AnnouncementBannerProps) {
  const t = useTranslations("banner");

  return (
    <div className="relative h-10 flex items-center justify-center bg-primary text-primary-foreground px-4 text-sm">
      <a
        href="#newsletter"
        className="inline-flex items-center gap-2 flex-wrap justify-center hover:underline underline-offset-2"
      >
        <span>{t("text")}</span>
        <span className="font-semibold">{t("highlight")}</span>
        <span className="font-medium opacity-80">{t("cta")}</span>
      </a>
      <button
        onClick={onDismiss}
        aria-label="Fermer"
        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
