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
            Chaque flamme révèle une histoire unique, chaque bougie devient un
            écrin d’émotions et de raffinement.
          </p>
        </div>

        <div className="space-y-24">
          {/* Mission */}
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
            <div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">Notre Mission</h3>
                <p className="text-muted-foreground">
                  Nous avons imaginé des bougies d’exception, sur-mesure,
                  alliant émotion, élégance et sophistication. Avec UNIKCANDLE,
                  illuminez vos instants les plus précieux grâce à des créations
                  exclusives qui marient savoir-faire, luxe et innovation. Une
                  bougie, un message, une expérience inoubliable.{" "}
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
                  Chaque bougie UNIKCANDLE est façonnée comme une œuvre d’art :
                  nos contenants sont sélectionnés parmi des matériaux nobles et
                  travaillés avec la plus grande précision, pour révéler un
                  design élégant et intemporel. Ce processus d’excellence
                  garantit que chaque création est une pièce rare et exclusive,
                  pensée pour sublimer vos espaces.
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
                  Nos bougies sont imaginées et réalisées en France, avec des
                  matériaux nobles et des fragrances rares, soigneusement
                  sélectionnées parmi les plus belles maisons de parfum. Chaque
                  création incarne l’excellence artisanale et offre une
                  expérience olfactive, visuelle et émotionnelle inégalée.
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
