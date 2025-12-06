"use client";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Montserrat } from "next/font/google";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["800"],
});

export default function WhyChooseSection() {
  const t = useTranslations("whyChoose");

  return (
    <section className="py-24 lg:py-32 bg-background relative">
      <div className="absolute inset-0 bg-grid-black/[0.02] -z-10" />
      <div className="container mx-auto px-4">
        <h2 className="text-4xl lg:text-5xl font-bold text-center mb-16 text-foreground tracking-tight">
          {t("title")}
          <span
            className={`${montserrat.className} text-primary text-5xl font-extrabold tracking-tight`}
          >
            {" "}
            {t("brandName")}{" "}
          </span>
          ?
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="text-center border-primary/10">
            <CardHeader>
              <CardTitle className="text-primary text-2xl font-bold">
                {t("unique.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {t("unique.description")}
              </p>
            </CardContent>
          </Card>
          <Card className="text-center border-primary/10">
            <CardHeader>
              <CardTitle className="text-primary text-2xl font-bold">
                {t("innovative.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground balance-text">
                {t("innovative.description")}
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-primary/10">
            <CardHeader>
              <CardTitle className="text-primary text-2xl font-bold">
                {t("emotional.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground balance-text">
                {t("emotional.description")}
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="text-center mt-16">
          <Link
            className={buttonVariants({ variant: "default", size: "lg" })}
            href="#newsletter"
          >
            {t("cta")}
          </Link>
        </div>
      </div>
    </section>
  );
}
