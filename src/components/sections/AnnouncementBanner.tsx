"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";

export default function AnnouncementBanner() {
  const t = useTranslations("banner");
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="relative bg-primary text-primary-foreground py-2.5 px-4 text-center text-sm">
      <a
        href="#newsletter"
        className="inline-flex items-center gap-2 flex-wrap justify-center hover:underline underline-offset-2"
      >
        <span>{t("text")}</span>
        <span className="font-semibold">{t("highlight")}</span>
        <span className="font-medium opacity-80">{t("cta")}</span>
      </a>
      <button
        onClick={() => setVisible(false)}
        aria-label="Fermer"
        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
