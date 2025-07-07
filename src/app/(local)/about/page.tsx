import { Lora } from "next/font/google";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="container mx-auto space-y-24 px-4 py-24 md:px-6 2xl:max-w-[1400px]">
        {/* Hero */}
        <div className="space-y-4 text-center">
          <h2
            className={`${lora.className} text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter`}
          >
            Chez <span className="text-primary">UNIKCANDLE</span>
          </h2>
          <p className="text-muted-foreground mx-auto max-w-[700px] md:text-xl/relaxed">
            Chaque flamme raconte une histoire et chaque bougie porte un
            message.
          </p>
        </div>

        <div className="space-y-24">
          {/* Mission */}
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
            <div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">Notre Mission</h3>
                <p className="text-muted-foreground">
                  Nous avons imaginé des bougies uniques et personnalisables,
                  alliant émotion, élégance et engagement écologique.
                </p>
                <p className="text-muted-foreground">
                  Avec UNIKCANDLE, illuminez vos moments précieux tout en
                  adoptant une démarche responsable. Une bougie, un message, un
                  impact.
                </p>
                <Button asChild>
                  <Link href="/products">Découvrir nos produits</Link>
                </Button>
              </div>
            </div>
            <div className="relative aspect-video overflow-hidden rounded-xl">
              <Image
                src="/asset/about.webp"
                alt="Notre mission"
                fill
                quality={100}
                priority
                className="object-cover object-center"
              />
            </div>
          </div>

          {/* Process */}
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
            <div className="lg:order-last">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">Notre Processus</h3>
                <p className="text-muted-foreground">
                  Nous donnons une seconde vie aux bouteilles usagées en les
                  transformant en contenants raffinés. Chaque bouteille est
                  soigneusement découpée, polie et gravée à la main, créant
                  ainsi une pièce unique à chaque bougie.
                </p>
                <p className="text-muted-foreground">
                  Ce processus artisanal nous permet de réduire les déchets tout
                  en apportant une touche d&apos;authenticité à nos créations.
                </p>
              </div>
            </div>
            <div className="relative aspect-video overflow-hidden rounded-xl">
              <Image
                src="/asset/IMG_20250328_111936.webp"
                alt="Notre processus"
                fill
                quality={100}
                priority
                className="object-cover object-center"
              />
            </div>
          </div>

          {/* Quality */}
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
            <div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">Notre Engagement</h3>
                <p className="text-muted-foreground">
                  Nos bougies sont fabriquées en France, avec des matériaux de
                  haute qualité, des cires naturelles et des parfums
                  soigneusement sélectionnés.
                </p>
                <p className="text-muted-foreground">
                  Chaque création est le fruit d&apos;un savoir-faire artisanal,
                  garantissant une expérience sensorielle et visuelle
                  inoubliable.
                </p>
              </div>
            </div>
            <div className="relative aspect-video overflow-hidden rounded-xl">
              <Image
                src="/asset/IMG_20250328_111933.webp"
                alt="Notre engagement"
                fill
                quality={100}
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
