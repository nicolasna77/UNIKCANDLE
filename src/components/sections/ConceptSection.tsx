"use client";

import { buttonVariants } from "@/components/ui/button";
import { Flame, MessageCircle, Sparkles } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export default function ConceptSection() {
  const t = useTranslations("concept");

  return (
    <section className="py-24 lg:py-32 bg-accent relative">
      <div className="absolute inset-0 bg-grid-black/[0.02] -z-10" />
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 bg-muted text-muted-foreground rounded-full font-medium text-sm border border-amber-400 shadow-sm">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <span>{t("badge")}</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
              {t("title")}
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed balance-text">
              {t("intro1")}
            </p>
            <p className="text-xl text-muted-foreground leading-relaxed balance-text">
              {t("intro2")}
            </p>
          </div>

          <div className="bg-card/50 backdrop-blur-sm rounded-xl p-8 space-y-8 border border-border">
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold text-foreground">
                {t("imagine.title")}
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t("imagine.subtitle")}
              </p>
              <p className="text-xl font-semibold text-primary italic">
                {t("imagine.reveal")}
              </p>
              <p className="text-lg text-muted-foreground">
                {t("imagine.message")}
              </p>
              <p className="text-xl font-bold text-foreground">
                {t("imagine.listen")}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 space-y-4 border border-border">
              <div className="bg-primary/10 rounded-full p-3 w-fit">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-primary">
                {t("features.personalize.title")}
              </h3>
              <p className="text-base text-card-foreground leading-relaxed">
                {t("features.personalize.description")}
              </p>
            </div>

            <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 space-y-4 border border-border">
              <div className="bg-primary/10 rounded-full p-3 w-fit">
                <Flame className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-primary">
                {t("features.moment.title")}
              </h3>
              <p className="text-base text-card-foreground leading-relaxed">
                {t("features.moment.description")}
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link
              className={buttonVariants({ variant: "default", size: "lg" })}
              href="/products"
            >
              {t("cta")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
