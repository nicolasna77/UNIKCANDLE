import { buttonVariants } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Montserrat } from "next/font/google";
import Link from "next/link";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["800"],
});

export default function WhyChooseSection() {
  return (
    <section className="py-24 lg:py-32 bg-background relative">
      <div className="absolute inset-0 bg-grid-black/[0.02] -z-10" />
      <div className="container mx-auto px-4">
        <h2 className="text-4xl lg:text-5xl font-bold text-center mb-16 text-foreground tracking-tight">
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
          <Card className="text-center border-primary/10">
            <CardHeader>
              <CardTitle className="text-primary text-2xl font-bold">
                Unique
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Chaque bougie est conçue sur-mesure, exclusivement pour vous
                ou pour une personne d&apos;exception.
              </p>
            </CardContent>
          </Card>
          <Card className="text-center border-primary/10">
            <CardHeader>
              <CardTitle className="text-primary text-2xl font-bold">
                Innovante
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground balance-text">
                Notre technologie audio sublime l&apos;expérience et rend chaque
                création inoubliable.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center border-primary/10">
            <CardHeader>
              <CardTitle className="text-primary text-2xl font-bold">
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
  );
}
