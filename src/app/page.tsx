"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Flame } from "lucide-react";
import { MessageCircle } from "lucide-react";
import { Sparkles } from "lucide-react";
import { Lora } from "next/font/google";
import HeroSection from "@/components/sections/hero-section";
import TestimonialSection from "@/components/sections/testimonial-section";
import { Candle3D } from "@/components/Candle3D";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

export default function Home() {
  return (
    <main className="bg-background min-h-screen">
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
            <Button size="lg" variant="default">
              Je m&apos;inscris pour être informé du lancement
            </Button>
          </div>
        </div>
      </section>

      {/* Section 2 : Comment Ça Marche */}
      <section className="py-24 lg:py-32 px-4 bg-muted/50">
        <div className="container mx-auto ">
          <h2
            className={`${lora.className} text-4xl lg:text-5xl font-bold text-center mb-16 text-foreground tracking-tight`}
          >
            Comment ça marche ? <br />
            <span className="text-primary">C&apos;est simple et magique !</span>
          </h2>
          <div className="grid lg:grid-cols-2  items-center mx-auto">
            <div className="space-y-12">
              <div className="flex items-center gap-6 group">
                <div className="text-4xl font-bold text-primary border-2 border-primary/20 rounded-full w-16 h-16 flex items-center justify-center shadow-lg shrink-0">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                    Sélectionne le parfum de ta bougie
                    <span className="text-3xl">✨</span>
                  </h3>
                </div>
              </div>
              <div className="flex items-center gap-6 group">
                <div className="text-4xl font-bold text-primary border-2 border-primary/20 rounded-full w-16 h-16 flex items-center justify-center shadow-lg shrink-0">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                    Enregistre un message personnalisé
                    <span className="text-3xl">🎙️</span>
                  </h3>
                </div>
              </div>
              <div className="flex items-center gap-6 group">
                <div className="text-4xl font-bold text-primary border-2 border-primary/20 rounded-full w-16 h-16 flex items-center justify-center shadow-lg shrink-0">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                    Choisis une animation en réalité augmentée
                    <span className="text-3xl">🔮</span>
                  </h3>
                </div>
              </div>
            </div>
            <div className="relative h-full w-full  ">
              <Candle3D />
            </div>
          </div>
          <div className="text-center mt-16">
            <Button size="lg" variant="default">
              Prêt à vivre l&apos;expérience UNIKCANDLE ?
            </Button>
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
            <Button size="lg" variant="default">
              Offrez ou offrez-vous une émotion unique
            </Button>
          </div>
        </div>
      </section>

      {/* Section 4 : Témoignages */}
      <TestimonialSection />

      {/* Section 5 : Newsletter */}
      <section className="py-24 lg:py-32 bg-card relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-black/[0.02] -z-10" />
        <div className="container mx-auto px-4 relative z-10">
          <h2
            className={`${lora.className} text-4xl lg:text-5xl text-balance font-bold text-center mb-8 text-card-foreground tracking-tight`}
          >
            Ne manquez pas le lancement de{" "}
            <span className={`${lora.className} text-primary`}>UNIKCANDLE</span>{" "}
            !
          </h2>
          <p className="text-xl text-center text-balance mb-12 max-w-3xl mx-auto text-muted-foreground">
            Inscrivez-vous dès maintenant pour être informé en avant-première du
            lancement de UNIKCANDLE. Recevez des offres exclusives et soyez
            parmi les premiers à créer votre bougie unique.
          </p>
          <div className="max-w-md mx-auto">
            <div className="flex gap-4">
              <Input type="email" placeholder="Votre adresse email" />
              <Button size="lg" variant="default">
                Je m&apos;inscris
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
