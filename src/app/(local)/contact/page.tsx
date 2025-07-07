"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Lora } from "next/font/google";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Mail, Send, Clock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

// Schéma de validation
const contactFormSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Veuillez entrer une adresse email valide"),
  phone: z.string().optional(),
  subject: z.string().min(5, "Le sujet doit contenir au moins 5 caractères"),
  message: z
    .string()
    .min(10, "Le message doit contenir au moins 10 caractères"),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button size="lg" variant="default" type="submit" disabled={pending}>
      {pending ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
          Envoi en cours...
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Send className="w-5 h-5" />
          Envoyer le message
        </div>
      )}
    </Button>
  );
}

const ContactPage = () => {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  async function onSubmit(data: ContactFormValues) {
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success("Message envoyé ! 📧", {
          description: "Nous vous répondrons dans les plus brefs délais",
        });
        form.reset();
      } else {
        const error = await response.json();
        toast.error("Erreur d'envoi", {
          description:
            error.message || "Une erreur est survenue lors de l'envoi",
        });
      }
    } catch {
      toast.error("Erreur de connexion", {
        description: "Impossible de se connecter au serveur",
      });
    }
  }

  return (
    <main className="min-h-screen py-24 bg-gradient-to-br from-background via-background to-primary/5">
      {/* Éléments décoratifs */}
      <div className="absolute inset-0 bg-grid-black/[0.02] -z-10" />
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-b from-primary/5 to-transparent rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="container mx-auto px-4  relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* En-tête */}
          <div className="text-center space-y-6 mb-16">
            <h1
              className={`${lora.className} text-3xl lg:text-6xl font-bold text-foreground tracking-tight`}
            >
              Nous Contacter
            </h1>

            <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Une question ? Un projet spécial ? Nous sommes là pour vous
              accompagner dans la création de votre bougie unique.
            </p>

            {/* Informations de service */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-8">
              <div className="flex items-center gap-2 px-4 py-2 bg-card/50 backdrop-blur-sm rounded-full border border-primary/10">
                <Clock className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-card-foreground">
                  24h/24, 7j/7
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-card/50 backdrop-blur-sm rounded-full border border-primary/10">
                <Mail className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-card-foreground">
                  Réponse sous 48h
                </span>
              </div>
            </div>
          </div>

          {/* Formulaire de contact */}
          <Card className="bg-card/80 backdrop-blur-sm border-primary/10 shadow-xl max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle
                className={`${lora.className} text-2xl font-bold text-card-foreground`}
              >
                Envoyez-nous un message
              </CardTitle>
              <p className="text-muted-foreground">
                Remplissez le formulaire ci-dessous et nous vous répondrons
                rapidement.
              </p>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-card-foreground">
                            Prénom *
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="bg-card/80 backdrop-blur-sm border-primary/20 focus:border-primary/40 focus:ring-primary/20 text-card-foreground placeholder:text-muted-foreground/60 h-12"
                              placeholder="Votre prénom"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-card-foreground">
                            Nom *
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="bg-card/80 backdrop-blur-sm border-primary/20 focus:border-primary/40 focus:ring-primary/20 text-card-foreground placeholder:text-muted-foreground/60 h-12"
                              placeholder="Votre nom"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-card-foreground">
                          Email *
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            className="bg-card/80 backdrop-blur-sm border-primary/20 focus:border-primary/40 focus:ring-primary/20 text-card-foreground placeholder:text-muted-foreground/60 h-12"
                            placeholder="votre.email@exemple.com"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-card-foreground">
                          Téléphone
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="tel"
                            className="bg-card/80 backdrop-blur-sm border-primary/20 focus:border-primary/40 focus:ring-primary/20 text-card-foreground placeholder:text-muted-foreground/60 h-12"
                            placeholder="+33 6 12 34 56 78"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-card-foreground">
                          Sujet *
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-card/80 backdrop-blur-sm border-primary/20 focus:border-primary/40 focus:ring-primary/20 text-card-foreground placeholder:text-muted-foreground/60 h-12"
                            placeholder="Votre demande"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-card-foreground">
                          Message *
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={6}
                            className="bg-card/80 backdrop-blur-sm border-primary/20 focus:border-primary/40 focus:ring-primary/20 text-card-foreground placeholder:text-muted-foreground/60 resize-none"
                            placeholder="Décrivez votre projet ou posez votre question..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <SubmitButton />
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() => form.reset()}
                    >
                      Annuler
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default ContactPage;
