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
    <main className="bg-background  ">
      <HeroSection />
      {/* Section 1 : Le Concept */}
      <section className="py-24 lg:py-32 bg-background relative">
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
        className="py-16 sm:py-24 lg:py-32 px-4 bg-secondary relative overflow-hidden"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-32 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto flex flex-col gap-y-16 relative z-10">
          <div className="text-center">
            <h2
              className={`${lora.className} text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-foreground tracking-tight`}
            >
              Comment ça marche ?
            </h2>
            <p
              className={`${lora.className} text-2xl sm:text-3xl lg:text-4xl font-bold text-primary`}
            >
              C&apos;est simple et magique !
            </p>
          </div>

          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mx-auto">
            <div className="space-y-8 ">
              {steps.map((step) => (
                <Card key={step.number} className="group ">
                  <CardContent className="   ">
                    <div className="flex items-center gap-5">
                      <div
                        className={`border-primary border-2 text-primary text-2xl sm:text-3xl font-bold rounded-xl w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center  shrink-0 `}
                      >
                        {step.number}
                      </div>
                      <div className="w-full flex gap-5 items-center justify-between">
                        <div className="text-xl  sm:text-2xl font-semibold mb-2 flex items-center gap-2 ">
                          {step.title}
                        </div>
                        <div className="text-2xl relative items-end sm:text-3xl  ">
                          {step.emoji}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className=" max-w-full lg:max-w-none mx-auto">
              <Video
                type="mp4"
                className="w-full h-full object-cover"
                src="./asset/copy_4447286A-9868-4AB4-8560-658743442719.mp4"
                captions="/asset/captions.vtt"
              />
            </div>
          </div>

          <div className="text-center mt-16 lg:mt-20">
            <Link
              className={buttonVariants({ variant: "default", size: "lg" })}
              href="#newsletter"
            >
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
