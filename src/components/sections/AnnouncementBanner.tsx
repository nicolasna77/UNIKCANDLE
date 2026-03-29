"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";

export default function AnnouncementBanner() {
  const t = useTranslations("banner");
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="fixed top-0 inset-x-0 z-[60] h-10 flex items-center justify-center bg-primary text-primary-foreground px-10 text-xs sm:text-sm">
      <a
        href="#newsletter"
        className="flex items-center gap-1.5 sm:gap-2 truncate hover:underline underline-offset-2"
      >
        <span className="hidden sm:inline">{t("text")}</span>
        <span className="font-semibold">{t("highlight")}</span>
        <span className="hidden xs:inline font-medium opacity-80">{t("cta")}</span>
      </a>
      <button
        onClick={() => {
          setVisible(false);
          document.dispatchEvent(new CustomEvent("banner:dismiss"));
        }}
        aria-label="Fermer"
        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
      >
        <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </button>
    </div>
  );
}
