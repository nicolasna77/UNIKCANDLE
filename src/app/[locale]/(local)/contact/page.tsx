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
import { Montserrat } from "next/font/google";
import { useTransition } from "react";
import { toast } from "sonner";
import { Mail, Send, Clock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sendContactMessage } from "@/app/actions/contact";
import { contactFormSchema, type ContactFormValues } from "@/lib/schemas";
import { useTranslations } from "next-intl";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["800"],
  variable: "--font-montserrat",
});

const ContactPage = () => {
  const t = useTranslations("contact");
  const [isPending, startTransition] = useTransition();

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

  const onSubmit = (data: ContactFormValues) => {
    startTransition(async () => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const result = await sendContactMessage(formData);

      // Afficher les toasts selon le résultat
      if (result.success) {
        toast.success(t("successToast"), {
          description: t("successDescription"),
        });
        form.reset();
      } else {
        toast.error(t("errorToast"), {
          description: result.error || t("errorDescription"),
        });
      }
    });
  };

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
              className={`${montserrat.className} text-3xl lg:text-6xl font-bold text-foreground tracking-tight`}
            >
              {t("title")}
            </h1>

            <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {t("subtitle")}
            </p>

            {/* Informations de service */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-8">
              <div className="flex items-center gap-2 px-4 py-2 bg-card/50 backdrop-blur-sm rounded-full border border-primary/10">
                <Clock className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-card-foreground">
                  {t("availability")}
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-card/50 backdrop-blur-sm rounded-full border border-primary/10">
                <Mail className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-card-foreground">
                  {t("responseTime")}
                </span>
              </div>
            </div>
          </div>

          {/* Formulaire de contact */}
          <Card className="bg-card/80 backdrop-blur-sm border-primary/10 shadow-xl max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle
                className={`${montserrat.className} text-2xl font-bold text-card-foreground`}
              >
                {t("formTitle")}
              </CardTitle>
              <p className="text-muted-foreground">
                {t("formDescription")}
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
                            {t("firstNameRequired")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="bg-card/80 backdrop-blur-sm border-primary/20 focus:border-primary/40 focus:ring-primary/20 text-card-foreground placeholder:text-muted-foreground/60 h-12"
                              placeholder={t("firstNamePlaceholder")}
                              aria-label={t("firstName")}
                              required
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
                            {t("lastNameRequired")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className="bg-card/80 backdrop-blur-sm border-primary/20 focus:border-primary/40 focus:ring-primary/20 text-card-foreground placeholder:text-muted-foreground/60 h-12"
                              placeholder={t("lastNamePlaceholder")}
                              aria-label={t("lastName")}
                              required
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
                          {t("emailRequired")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            className="bg-card/80 backdrop-blur-sm border-primary/20 focus:border-primary/40 focus:ring-primary/20 text-card-foreground placeholder:text-muted-foreground/60 h-12"
                            placeholder={t("emailPlaceholder")}
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
                          {t("phone")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="tel"
                            className="bg-card/80 backdrop-blur-sm border-primary/20 focus:border-primary/40 focus:ring-primary/20 text-card-foreground placeholder:text-muted-foreground/60 h-12"
                            placeholder={t("phonePlaceholder")}
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
                          {t("subjectRequired")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            className="bg-card/80 backdrop-blur-sm border-primary/20 focus:border-primary/40 focus:ring-primary/20 text-card-foreground placeholder:text-muted-foreground/60 h-12"
                            placeholder={t("subjectPlaceholder")}
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
                          {t("messageRequired")}
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={6}
                            className="bg-card/80 backdrop-blur-sm border-primary/20 focus:border-primary/40 focus:ring-primary/20 text-card-foreground placeholder:text-muted-foreground/60 resize-none"
                            placeholder={t("messagePlaceholder")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button
                      size="lg"
                      variant="default"
                      type="submit"
                      disabled={isPending}
                      aria-label={t("send")}
                    >
                      {isPending ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                          {t("sending")}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Send className="w-5 h-5" />
                          {t("send")}
                        </div>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() => form.reset()}
                    >
                      {t("cancel")}
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
