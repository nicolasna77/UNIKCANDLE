"use client";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Flame, MessageCircle, Sparkles } from "lucide-react";
import { Lora } from "next/font/google";
import HeroSection from "@/components/sections/hero-section";
import TestimonialSection from "@/components/sections/testimonial-section";
import NewsletterSection from "@/components/sections/newsletter";
import Link from "next/link";
import AboutSection from "@/components/sections/AboutSection";
import CategoriesSection from "@/components/sections/CategoriesSection";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

export default function Home() {
  return (
    <main className="bg-primary-background  ">
      <HeroSection />
      {/* Section : Catégories de produits */}
      <CategoriesSection />
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
            <p className="text-xl text-muted-foreground leading-relaxed balance-text">
              Chez UNIKCANDLE, nous croyons qu&apos;une bougie peut incarner
              l&apos;élégance ultime. Imaginez une bougie qui illumine avec
              raffinement tout en portant vos mots, vos émotions et vos
              souvenirs les plus précieux.
            </p>
            <div className="bg-card/50 backdrop-blur-sm rounded-xl p-8 space-y-8 text-left  border border-border">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 rounded-full p-3 mt-1">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <p className="text-lg text-card-foreground">
                  <span className="font-semibold text-primary">
                    Personnalisez votre création :
                  </span>{" "}
                  <br />
                  sélectionnez des fragrances rares, des designs exclusifs, et
                  enregistrez un message audio personnel.
                </p>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 rounded-full p-3 mt-1">
                  <Flame className="h-6 w-6 text-primary" />
                </div>
                <p className="text-lg text-card-foreground">
                  <span className="font-semibold text-primary">
                    Un rituel unique :
                  </span>{" "}
                  <br />
                  lorsque la flamme s’éteint, révélez votre message privé grâce
                  à notre technologie immersive de réalité augmentée.
                </p>
              </div>
            </div>
            <Link
              className={buttonVariants({ variant: "default", size: "lg" })}
              href="#newsletter"
            >
              Rejoignez notre cercle privé
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
            <Card className="text-center   border-primary/10">
              <CardHeader>
                <CardTitle
                  className={`${lora.className} text-primary text-2xl font-bold`}
                >
                  Unique
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Chaque bougie est conçue sur-mesure, exclusivement pour vous
                  ou pour une personne d’exception.
                </p>
              </CardContent>
            </Card>
            <Card className="text-center  border-primary/10">
              <CardHeader>
                <CardTitle
                  className={`${lora.className} text-primary text-2xl font-bold`}
                >
                  Innovante
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground balance-text">
                   Notre technologie de réalité augmentée sublime l’expérience
                  et rend chaque création inoubliable.
                </p>
              </CardContent>
            </Card>

            <Card
              className="text-center 
             border-primary/10"
            >
              <CardHeader>
                <CardTitle
                  className={`${lora.className} text-primary text-2xl font-bold`}
                >
                  Émotionnelle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground balance-text">
                  Un cadeau raffiné, porteur d&apos;émotions intimes, pour des
                  souvenirs gravés avec élégance.
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
