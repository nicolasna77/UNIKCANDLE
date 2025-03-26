"use client";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Lora } from "next/font/google";
import { subscribeToNewsletter } from "@/app/actions/newsletter";
import { useState } from "react";
import { useFormStatus } from "react-dom";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button size="lg" variant="default" type="submit" disabled={pending}>
      {pending ? "Inscription..." : "Je m'inscris"}
    </Button>
  );
}

const NewsletterSection = () => {
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleSubmit(formData: FormData) {
    const result = await subscribeToNewsletter(formData);

    if (result.success) {
      setMessage({
        type: "success",
        text: result.message || "Inscription réussie !",
      });
    } else {
      setMessage({
        type: "error",
        text: result.error || "Une erreur est survenue",
      });
    }
  }

  return (
    <section className="py-24 lg:py-32 bg-card relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-black/[0.02] -z-10" />
      <div className="container mx-auto px-4 relative z-10">
        <h2
          className={`${lora.className} text-4xl lg:text-5xl text-balance font-bold text-center mb-8 text-card-foreground tracking-tight`}
        >
          Ne manquez pas le lancement de{" "}
          <span className={`${lora.className} text-primary`}>UNIKCANDLE</span> !
        </h2>
        <p className="text-xl text-center text-balance mb-12 max-w-3xl mx-auto text-muted-foreground">
          Inscrivez-vous dès maintenant pour être informé en avant-première du
          lancement de UNIKCANDLE. Recevez des offres exclusives et soyez parmi
          les premiers à créer votre bougie unique.
        </p>
        <div className="max-w-md mx-auto">
          <form action={handleSubmit} className="space-y-4">
            <div className="flex gap-4">
              <Input
                type="email"
                name="email"
                placeholder="Votre adresse email"
                required
              />
              <SubmitButton />
            </div>
            {message && (
              <p
                className={`text-center ${
                  message.type === "success" ? "text-green-500" : "text-red-500"
                }`}
              >
                {message.text}
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
