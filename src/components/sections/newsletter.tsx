"use client";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Lora } from "next/font/google";
import { subscribeToNewsletter } from "@/app/actions/newsletter";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Sparkles, Gift, Flame } from "lucide-react";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button size="lg" variant="default" type="submit" disabled={pending}>
      {pending ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
          Inscription...
        </div>
      ) : (
        <div className="flex items-center gap-2">Je m&apos;inscris</div>
      )}
    </Button>
  );
}

const NewsletterSection = () => {
  async function handleSubmit(formData: FormData) {
    const result = await subscribeToNewsletter(formData);

    if (result.success) {
      toast.success("Inscription réussie ! 🕯️", {
        description:
          "Vous recevrez bientôt nos offres exclusives et nouveautés",
      });
    } else {
      toast.error("Inscription échouée", {
        description: result.error || "Une erreur est survenue",
      });
    }
  }

  return (
    <section
      id="newsletter"
      className="py-24 lg:py-32 bg-gradient-to-br from-card via-card to-primary/5 relative overflow-hidden"
    >
      {/* Éléments décoratifs */}
      <div className="absolute inset-0 bg-grid-black/[0.02] -z-10" />
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-b from-primary/5 to-transparent rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Titre principal */}
          <h2
            className={`${lora.className} text-4xl lg:text-6xl text-balance font-bold text-card-foreground tracking-tight`}
          >
            Rejoignez l&apos;aventure{" "}
            <span
              className={`${lora.className} text-primary bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent`}
            >
              UNIKCANDLE
            </span>
          </h2>

          {/* Description */}
          <p className="text-xl lg:text-2xl text-center text-balance mb-8 max-w-3xl mx-auto text-muted-foreground leading-relaxed">
            Découvrez en avant-première nos nouvelles bougies, offres exclusives
            et
            <span className="text-primary font-semibold">
              {" "}
              réductions spéciales
            </span>{" "}
            réservées à nos abonnés.
          </p>

          {/* Avantages */}
          <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
            <div className="flex items-center gap-3 p-4 bg-card/50 backdrop-blur-sm rounded-xl border border-primary/10">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Gift className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-card-foreground">
                  Offres exclusives
                </h3>
                <p className="text-sm text-muted-foreground">
                  -20% sur votre première commande
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-card/50 backdrop-blur-sm rounded-xl border border-primary/10">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-card-foreground">
                  Nouveautés
                </h3>
                <p className="text-sm text-muted-foreground">
                  Soyez les premiers informés
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-card/50 backdrop-blur-sm rounded-xl border border-primary/10">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Flame className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-card-foreground">Conseils</h3>
                <p className="text-sm text-muted-foreground">
                  Astuces et inspirations
                </p>
              </div>
            </div>
          </div>

          {/* Formulaire */}
          <div className="max-w-lg mx-auto">
            <form action={handleSubmit} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  type="email"
                  name="email"
                  placeholder="Votre adresse email"
                  required
                />
                <SubmitButton />
              </div>
              <p className="text-sm text-muted-foreground/80 text-center">
                🔒 Vos données sont protégées. Désinscription à tout moment.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
