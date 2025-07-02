"use client";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Flame } from "lucide-react";
import { MessageCircle } from "lucide-react";
import { Sparkles } from "lucide-react";
import { Lora } from "next/font/google";
import HeroSection from "@/components/sections/hero-section";
import TestimonialSection from "@/components/sections/testimonial-section";
import NewsletterSection from "@/components/sections/newsletter";
import Link from "next/link";
import { Video } from "@/components/ui/video";
const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

export default function Home() {
  const steps = [
    {
      number: 1,
      title: "Sélectionne le parfum de ta bougie",
      emoji: "✨",
    },
    {
      number: 2,
      title: "Enregistre un message personnalisé",
      emoji: "🎙️",
    },
    {
      number: 3,
      title: "Choisis une animation en réalité augmentée",
      emoji: "🔮",
    },
  ];

  return (
    <main className="bg-primary-background  ">
      <HeroSection />
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
            <div className="bg-card/50 backdrop-blur-sm rounded-xl p-8 space-y-8 text-left shadow-lg border">
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

      {/* Section 2 : Comment Ça Marche */}
      <section
        id="how-it-works"
        className="py-16 sm:py-24 lg:py-32 px-4 bg-secondary/30 relative overflow-hidden"
      >
        {/* Decorative elements - Bougie theme */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          {/* Flammes décoratives */}
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-b from-primary/20 via-primary/15 to-transparent rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-40 h-40 bg-gradient-to-b from-primary/20 via-primary/15 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/3 w-36 h-36 bg-gradient-to-b from-primary/20 via-primary/15 to-transparent rounded-full blur-2xl animate-pulse delay-500"></div>

          {/* Particules de cire */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/40 rounded-full animate-bounce"></div>
          <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-primary/50 rounded-full animate-bounce delay-300"></div>
          <div className="absolute bottom-1/3 left-1/2 w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce delay-700"></div>
        </div>

        <div className="container mx-auto flex flex-col gap-y-16 relative z-10">
          <div className="text-center space-y-6">
            <h2
              className={`${lora.className} text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-foreground tracking-tight`}
            >
              Comment ça marche ?
            </h2>
            <p
              className={`${lora.className} text-xl sm:text-2xl lg:text-3xl font-medium text-primary/80 max-w-2xl mx-auto`}
            >
              Allumez la magie de vos souvenirs
            </p>
          </div>

          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mx-auto">
            <div className="space-y-6 w-full max-w-lg">
              {steps.map((step, index) => (
                <Card
                  key={step.number}
                  className="group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-card/90 to-primary/5 backdrop-blur-sm hover:from-card hover:to-primary/10"
                >
                  {/* Effet de flamme au survol */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/10 group-hover:via-primary/5 group-hover:to-primary/10 transition-all duration-500"></div>

                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        {/* Cercle avec effet de bougie */}
                        <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-gradient-to-br from-primary via-primary to-primary/80 flex items-center justify-center shadow-lg group-hover:shadow-primary/30 group-hover:scale-110 transition-all duration-300 relative overflow-hidden">
                          <span className="text-primary-foreground text-2xl sm:text-3xl font-bold relative z-10">
                            {step.number}
                          </span>
                          {/* Effet de lueur intérieure */}
                          <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent rounded-full"></div>
                        </div>

                        {/* Ligne de connexion avec effet de cire */}
                        {index < steps.length - 1 && (
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-1 h-12 bg-gradient-to-b from-primary/40 via-primary/30 to-transparent"></div>
                        )}
                      </div>

                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg sm:text-xl font-semibold text-card-foreground group-hover:text-primary transition-colors duration-300">
                            {step.title}
                          </h3>
                          <div className="text-3xl sm:text-4xl transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                            {step.emoji}
                          </div>
                        </div>

                        {/* Barre de progression avec effet de flamme */}
                        <div className="w-full bg-muted/50 h-2 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-primary via-primary to-primary/80 w-0 group-hover:w-full transition-all duration-700 ease-out shadow-sm"></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="w-full max-w-lg mx-auto">
              <div className="relative group">
                {/* Effet de lueur ambiante */}
                <div className="absolute -inset-6 bg-gradient-to-r from-primary/20 via-primary/15 to-primary/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                {/* Cadre avec effet de verre */}
                <Video
                  type="mp4"
                  className="w-full h-full object-cover rounded-2xl "
                  src="./asset/copy_4447286A-9868-4AB4-8560-658743442719.mp4"
                  captions="/asset/captions.vtt"
                />

                {/* Overlay décoratif */}
              </div>
            </div>
          </div>

          <div className="text-center mt-16 lg:mt-20">
            <Link
              className={buttonVariants({
                variant: "default",
                size: "lg",
                className:
                  "bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary/90 hover:via-primary hover:to-primary text-primary-foreground shadow-xl hover:shadow-2xl hover:shadow-primary/25 transform hover:scale-105 transition-all duration-300 px-10 py-5 text-lg font-semibold rounded-2xl border-0",
              })}
              href="#newsletter"
            >
              <Flame className="w-5 h-5 mr-2 animate-pulse" />
              Prêt à vivre l&apos;expérience UNIKCANDLE ?
            </Link>
          </div>
        </div>
      </section>

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
