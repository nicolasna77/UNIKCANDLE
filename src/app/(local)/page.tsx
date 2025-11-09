import { buttonVariants } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Flame, MessageCircle, Sparkles } from "lucide-react";
import { Montserrat } from "next/font/google";
import HeroSection from "@/components/sections/hero-section";
import TestimonialSection from "@/components/sections/testimonial-section";
import NewsletterSection from "@/components/sections/newsletter";
import Link from "next/link";
import AboutSection from "@/components/sections/AboutSection";
import CategoriesSection from "@/components/sections/CategoriesSection";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["800"],
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
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 bg-muted text-muted-foreground rounded-full font-medium text-sm border border-amber-400 shadow-sm">
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                <span>Le Concept</span>
              </div>
              <h2
                className={` text-4xl lg:text-5xl font-bold text-foreground tracking-tight`}
              >
                Et si ta bougie pouvait parler ?
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed balance-text">
                Chez UNIKCANDLE, nous pensons qu&apos;une bougie peut être bien
                plus qu&apos;un simple objet décoratif.
              </p>
              <p className="text-xl text-muted-foreground leading-relaxed balance-text">
                C&apos;est un véritable vecteur d&apos;émotions, capable de
                transmettre un message, d&apos;évoquer un souvenir, ou tout
                simplement de faire naître un sourire.
              </p>
            </div>

            <div className="bg-card/50 backdrop-blur-sm rounded-xl p-8 space-y-8 border border-border">
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-bold text-foreground">
                  Imagine une élégante bougie parfumée…
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  qui renferme un trésor invisible ...
                </p>
                <p className="text-xl font-semibold text-primary italic">
                  En laissant fondre la cire, un médaillon gravé se révèle.{" "}
                </p>
                <p className="text-lg text-muted-foreground">
                  Ce médaillon contient un message audio unique: votre voix,
                  votre mot doux, votre message, ...{" "}
                </p>
                <p className="text-xl font-bold text-foreground">
                  Il suffit d&apos;approcher son téléphone du médaillon pour
                  écouter, le secret.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 space-y-4 border border-border">
                <div className="bg-primary/10 rounded-full p-3 w-fit">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-primary">
                  Personnalise ta création
                </h3>
                <p className="text-base text-card-foreground leading-relaxed">
                  Enregistre ton audio directement sur notre site, nous nous
                  chargerons de l&apos;insérer dans la cire pour garder la
                  surprise jusqu&apos;à ce que la bougie soit allumée.
                </p>
              </div>

              <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 space-y-4 border border-border">
                <div className="bg-primary/10 rounded-full p-3 w-fit">
                  <Flame className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-primary">
                  Moment unique
                </h3>
                <p className="text-base text-card-foreground leading-relaxed">
                  Une expérience sensorielle unique. Offre la bougie et laisse
                  la magie opérer. Une fois allumée, ta bougie laisse échapper
                  son doux parfum et ton message se dévoile à mesure que la cire
                  fond. Prépare-toi à vivre et à faire vivre un moment suspendu.
                </p>
              </div>
            </div>

            <div className="text-center">
              <Link
                className={buttonVariants({ variant: "default", size: "lg" })}
                href="/products"
              >
                Découvrir nos bougies
              </Link>
            </div>
          </div>
        </div>
      </section>
      <AboutSection />

      <section className="py-24 lg:py-32 bg-background relative">
        <div className="absolute inset-0 bg-grid-black/[0.02] -z-10" />
        <div className="container mx-auto px-4">
          <h2
            className={` text-4xl lg:text-5xl font-bold text-center mb-16 text-foreground tracking-tight`}
          >
            Pourquoi choisir
            <span
              className={`${montserrat.className} text-primary text-5xl font-extrabold tracking-tight`}
            >
              {" "}
              UNIKCANDLE{" "}
            </span>
            ?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="text-center   border-primary/10">
              <CardHeader>
                <CardTitle className={` text-primary text-2xl font-bold`}>
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
                <CardTitle className={`text-primary text-2xl font-bold`}>
                  Innovante
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground balance-text">
                   Notre technologie audio sublime l’expérience et rend chaque
                  création inoubliable.
                </p>
              </CardContent>
            </Card>

            <Card
              className="text-center 
             border-primary/10"
            >
              <CardHeader>
                <CardTitle className={` text-primary text-2xl font-bold`}>
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
