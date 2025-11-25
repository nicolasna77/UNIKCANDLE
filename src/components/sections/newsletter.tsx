"use client";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { subscribeToNewsletter } from "@/app/actions/newsletter";
import { useTransition, useState } from "react";
import { toast } from "sonner";
import { Sparkles, Gift, Flame } from "lucide-react";
import { Montserrat } from "next/font/google";
import { useTranslations } from "next-intl";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["800"],
});

const NewsletterSection = () => {
  const t = useTranslations("newsletter");
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    startTransition(async () => {
      const formData = new FormData();
      formData.append("email", email);

      const result = await subscribeToNewsletter(formData);

      // Afficher les toasts côté client après l'action
      if (result.success) {
        toast.success(t("toast.success"), {
          description: t("toast.successDescription"),
        });
        setEmail(""); // Reset form
      } else {
        toast.error(t("toast.error"), {
          description: result.error || t("toast.errorDescription"),
        });
      }
    });
  };

  return (
    <section
      id="newsletter"
      className="py-24 lg:py-32 bg-gradient-to-br from-card via-card to-primary/5 relative overflow-hidden"
    >
      {/* Éléments décoratifs */}
      <div className="absolute inset-0 bg-grid-black/[0.02] -z-10" />
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-b from-primary/5 to-transparent rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Titre principal */}
          <h2
            className={` text-4xl lg:text-6xl text-balance font-bold text-card-foreground tracking-tight`}
          >
            {t("title")}{" "}
            <span
              className={` ${montserrat.className} text-primary bg-gradient-to-r from-primary to-primary/80 bg-clip-text `}
            >
              {t("brandName")}
            </span>
          </h2>

          {/* Description */}
          <p className="text-xl lg:text-2xl text-center text-balance mb-8 max-w-3xl mx-auto text-muted-foreground leading-relaxed">
            {t("description")}
            <span className="text-primary font-semibold">
              {" "}
              {t("specialDiscounts")}
            </span>{" "}
            {t("subscribers")}
          </p>

          {/* Avantages */}
          <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
            <div className="flex items-center gap-3 p-4 bg-card/50 backdrop-blur-sm rounded-xl border border-primary/10">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Gift className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-card-foreground">
                  {t("benefits.exclusive.title")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("benefits.exclusive.description")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-card/50 backdrop-blur-sm rounded-xl border border-primary/10">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-card-foreground">
                  {t("benefits.news.title")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("benefits.news.description")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-card/50 backdrop-blur-sm rounded-xl border border-primary/10">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Flame className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-card-foreground">
                  {t("benefits.tips.title")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t("benefits.tips.description")}
                </p>
              </div>
            </div>
          </div>

          {/* Formulaire avec progressive enhancement */}
          <div className="max-w-lg mx-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  type="email"
                  name="email"
                  placeholder={t("form.placeholder")}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-label={t("form.ariaLabel")}
                  aria-describedby="newsletter-privacy"
                />
                <Button
                  size="lg"
                  variant="default"
                  type="submit"
                  disabled={isPending}
                  aria-label={t("form.ariaLabel")}
                >
                  {isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                      {t("form.subscribing")}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {t("form.subscribe")}
                    </div>
                  )}
                </Button>
              </div>
              <p
                id="newsletter-privacy"
                className="text-sm text-muted-foreground/80 text-center"
              >
                {t("form.privacy")}
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
