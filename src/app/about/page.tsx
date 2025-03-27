import { Lora } from "next/font/google";
import Image from "next/image";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-grid-black/[0.02] -z-10" />
        <div className="container mx-auto px-4">
          <h1
            className={`${lora.className} text-4xl lg:text-6xl text-balance font-bold text-center mb-8 text-foreground tracking-tight`}
          >
            Chez{" "}
            <span className={`${lora.className} text-primary`}>UNIKCANDLE</span>
          </h1>
          <p className="text-xl text-center text-balance max-w-3xl  mx-auto text-muted-foreground">
            Chaque flamme raconte une histoire et chaque bougie porte un
            message.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 lg:py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2
                className={`${lora.className} text-3xl lg:text-4xl font-bold mb-6 text-card-foreground`}
              >
                Notre Mission
              </h2>
              <p className="text-lg text-muted-foreground mb-6 text-balance">
                Nous avons imaginé des bougies uniques et personnalisables,
                alliant émotion, élégance et engagement écologique.
              </p>
              <p className="text-lg text-muted-foreground text-balance">
                Avec UNIKCANDLE, illuminez vos moments précieux tout en adoptant
                une démarche responsable. Une bougie, un message, un impact.
              </p>
            </div>
            <div className="relative h-[400px] rounded-lg overflow-hidden">
              <Image
                src="/asset/about.webp"
                alt="Notre mission"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative h-[400px] rounded-lg overflow-hidden order-2 lg:order-1">
              <Image
                src="/about-process.jpg"
                alt="Notre processus"
                fill
                className="object-cover"
              />
            </div>
            <div className="order-1 lg:order-2">
              <h2
                className={`${lora.className} text-3xl lg:text-4xl font-bold mb-6 text-foreground`}
              >
                Notre Processus
              </h2>
              <p className="text-lg text-muted-foreground text-balance mb-6">
                Nous donnons une seconde vie aux bouteilles usagées en les
                transformant en contenants raffinés. Chaque bouteille est
                soigneusement découpée, polie et gravée à la main, créant ainsi
                une pièce unique à chaque bougie.
              </p>
              <p className="text-lg text-muted-foreground text-balance">
                Ce processus artisanal nous permet de réduire les déchets tout
                en apportant une touche d&apos;authenticité à nos créations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quality Section */}
      <section className="py-16 lg:py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2
                className={`${lora.className} text-3xl lg:text-4xl font-bold mb-6 text-card-foreground`}
              >
                Notre Engagement
              </h2>
              <p className="text-lg text-muted-foreground text-balance mb-6">
                Nos bougies sont fabriquées en France, avec des matériaux de
                haute qualité, des cires naturelles et des parfums soigneusement
                sélectionnés.
              </p>
              <p className="text-lg text-muted-foreground text-balance">
                Chaque création est le fruit d&apos;un savoir-faire artisanal,
                garantissant une expérience sensorielle et visuelle inoubliable.
              </p>
            </div>
            <div className="relative h-[400px] rounded-lg overflow-hidden">
              <Image
                src="/about-quality.jpg"
                alt="Notre engagement"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
