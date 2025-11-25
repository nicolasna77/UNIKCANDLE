"use client";

import { Lora } from "next/font/google";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTranslations } from "next-intl";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

export default function AboutPage() {
  const t = useTranslations("about");
  return (
    <main className="min-h-screen bg-background">
      <section className="container mx-auto space-y-24 px-4 py-24 md:px-6 2xl:max-w-[1400px]">
        {/* Hero */}
        <div className="space-y-4 text-center">
          <h2
            className={`${lora.className} text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter`}
          >
            {t("hero.title")} <span className="text-primary">{t("hero.brandName")}</span>
          </h2>
          <p className="text-muted-foreground mx-auto max-w-[700px] md:text-xl/relaxed">
            {t("hero.description")}
          </p>
        </div>

        <div className="space-y-24">
          {/* Mission */}
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
            <div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">{t("mission.title")}</h3>
                <p className="text-muted-foreground">
                  {t("mission.description")}
                </p>

                <Button asChild>
                  <Link href="/products">{t("mission.cta")}</Link>
                </Button>
              </div>
            </div>
            <div className="relative aspect-video overflow-hidden rounded-xl">
              <Image
                src="/asset/about.webp"
                alt={t("mission.imageAlt")}
                fill
                quality={75}
                priority
                className="object-cover object-center"
              />
            </div>
          </div>

          {/* Process */}
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
            <div className="lg:order-last">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">{t("process.title")}</h3>
                <p className="text-muted-foreground">
                  {t("process.description1")}
                </p>
                <p className="text-muted-foreground">
                  {t("process.description2")}
                </p>
              </div>
            </div>
            <div className="relative aspect-video overflow-hidden rounded-xl">
              <Image
                src="/asset/IMG_20250328_111936.webp"
                alt={t("process.imageAlt")}
                fill
                quality={75}
                priority
                className="object-cover object-center"
              />
            </div>
          </div>

          {/* Quality */}
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
            <div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">{t("commitment.title")}</h3>
                <p className="text-muted-foreground">
                  {t("commitment.description")}
                </p>
              </div>
            </div>
            <div className="relative aspect-video overflow-hidden rounded-xl">
              <Image
                src="/asset/IMG_20250328_111933.webp"
                alt={t("commitment.imageAlt")}
                fill
                quality={75}
                priority
                className="object-cover object-center"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
