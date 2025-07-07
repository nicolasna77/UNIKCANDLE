"use client";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Flame, MessageCircle, Sparkles, ArrowRight } from "lucide-react";
import { Lora } from "next/font/google";
import HeroSection from "@/components/sections/hero-section";
import TestimonialSection from "@/components/sections/testimonial-section";
import NewsletterSection from "@/components/sections/newsletter";
import Link from "next/link";
import AboutSection from "@/components/sections/AboutSection";
import Image from "next/image";
import { useCategories } from "@/hooks/useCategories";
import { Category, Product } from "@/generated/client";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

export default function Home() {
  const { data: categories, isLoading, error } = useCategories();
  return (
    <main className="bg-primary-background  ">
      <HeroSection />
      {/* Section : Catégories de produits */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2
              className={`${lora.className} text-3xl lg:text-4xl font-bold text-foreground mb-4`}
            >
              Découvrez nos collections
            </h2>
            <p className="text-muted-foreground text-lg">
              Explorez nos différentes gammes de bougies personnalisées
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 items-center lg:grid-cols-3 gap-6">
            {isLoading ? (
              // Skeleton loading pour 3 cartes
              Array.from({ length: 3 }).map((_, index) => (
                <Card
                  key={index}
                  className="relative overflow-hidden border-0 shadow-lg"
                >
                  <div className="relative aspect-[4/3] bg-muted animate-pulse"></div>
                  <div className="absolute inset-0 flex flex-col justify-end p-6">
                    <div className="h-6 bg-muted rounded mb-2 animate-pulse"></div>
                    <div className="h-4 bg-muted rounded mb-4 animate-pulse"></div>
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
                      <div className="h-9 w-24 bg-muted rounded animate-pulse"></div>
                    </div>
                  </div>
                </Card>
              ))
            ) : error ? (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">
                  Erreur lors du chargement des catégories
                </p>
              </div>
            ) : (
              categories?.map(
                (category: Category & { products: Product[] }) => (
                  <Card
                    key={category.id}
                    className="group relative p-0 overflow-hidden border border-border  shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Link href={`/products?category=${category.id}`}>
                      <div className="relative aspect-[4/3] bg-muted">
                        <Image
                          src={"/asset/about.webp"}
                          alt={category.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-background/0"></div>
                      </div>
                      <div className="absolute inset-0 flex flex-col justify-end p-6 z-10">
                        <h3 className="text-xl font-semibold tracking-tight mb-2 text-foreground">
                          {category.name} {category.icon}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {category.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {category.products.length} produits
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 relative z-10"
                            asChild
                          >
                            <Link href={`/products?category=${category.id}`}>
                              Découvrir
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </Link>
                  </Card>
                )
              )
            )}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" asChild>
              <Link href="/products">
                Voir toutes nos bougies
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      {/* Section 1 : Le Concept */}
      <section className="py-24 lg:py-32  relative">
        <div className="absolute inset-0 bg-grid-black/[0.02] -z-10" />
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 bg-muted text-muted-foreground rounded-full font-medium text-sm border border-amber-400 shadow-sm">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <span>Le Concept</span>
            </div>
            <h2
              className={`${lora.className} text-4xl lg:text-5xl font-bold text-foreground tracking-tight`}
            >
              Une bougie pas comme les autres
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Chez UNIKCANDLE, nous croyons que chaque bougie raconte une
              histoire. Imaginez une bougie qui ne se contente pas
              d&apos;éclairer, mais qui porte vos mots, vos émotions, vos
              souvenirs.
            </p>
            <div className="bg-card/50 backdrop-blur-sm rounded-xl p-8 space-y-8 text-left  border border-border">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 rounded-full p-3 mt-1">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <p className="text-lg text-card-foreground">
                  <span className="font-semibold text-primary">
                    Personnalisez votre bougie
                  </span>{" "}
                  <br />
                  choisissez son odeur, son design, et enregistrez un message
                  audio.
                </p>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 rounded-full p-3 mt-1">
                  <Flame className="h-6 w-6 text-primary" />
                </div>
                <p className="text-lg text-card-foreground">
                  <span className="font-semibold text-primary">
                    Découvrez votre message
                  </span>{" "}
                  <br />à la fin de la combustion, scannez la bougie pour
                  écouter votre message grâce à la réalité augmentée.
                </p>
              </div>
            </div>
            <Link
              className={buttonVariants({ variant: "default", size: "lg" })}
              href="#newsletter"
            >
              Je m&apos;inscris pour être informé du lancement
            </Link>
          </div>
        </div>
      </section>
      <AboutSection />
      {/* Section 2 : Comment Ça Marche */}

      {/* Section 3 : Pourquoi UNIKCANDLE */}
      <section className="py-24 lg:py-32 bg-background relative">
        <div className="absolute inset-0 bg-grid-black/[0.02] -z-10" />
        <div className="container mx-auto px-4">
          <h2
            className={`${lora.className} text-4xl lg:text-5xl font-bold text-center mb-16 text-foreground tracking-tight`}
          >
            Pourquoi choisir <span className="text-primary">UNIKCANDLE</span> ?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="text-center p-8  border-primary/10">
              <CardHeader>
                <CardTitle
                  className={`${lora.className} text-primary text-2xl font-bold`}
                >
                  Unique
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Chaque bougie est personnalisée pour vous ou pour offrir.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center p-8  border-primary/10">
              <CardHeader>
                <CardTitle
                  className={`${lora.className} text-primary text-2xl font-bold`}
                >
                  Innovante
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  La réalité augmentée transforme votre bougie en une expérience
                  immersive.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-8  border-primary/10">
              <CardHeader>
                <CardTitle
                  className={`${lora.className} text-primary text-2xl font-bold`}
                >
                  Émotionnelle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Un cadeau qui parle au cœur et crée des souvenirs
                  inoubliables.
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="text-center mt-16">
            <Link
              className={buttonVariants({ variant: "default", size: "lg" })}
              href="#newsletter"
            >
              Offrez ou offrez-vous une émotion unique
            </Link>
          </div>
        </div>
      </section>

      {/* Section 4 : Témoignages */}
      <TestimonialSection />

      {/* Section 5 : Newsletter */}
      <NewsletterSection />
    </main>
  );
}
