"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import Image from "next/image";
import { AlertCircle, Loader2, X } from "lucide-react";
import { signUp } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ControllerRenderProps } from "react-hook-form";
import { useTranslations } from "next-intl";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Link } from "@/i18n/routing";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SignUp() {
  const t = useTranslations("auth");

  const formSchema = z
    .object({
      prenom: z.string().min(2, t("firstNameMinLength")),
      nom: z.string().min(2, t("lastNameMinLength")),
      email: z.string().email(t("emailInvalid")),
      motDePasse: z.string().min(8, t("passwordMinLength")),
      confirmationMotDePasse: z.string(),
    })
    .refine((data) => data.motDePasse === data.confirmationMotDePasse, {
      message: t("passwordMismatch"),
      path: ["confirmationMotDePasse"],
    });

  type FormValues = z.infer<typeof formSchema>;

  const [image, setImage] = useState<File | null>(null);
  const [apercuImage, setApercuImage] = useState<string | null>(null);
  const router = useRouter();
  const [chargement, setChargement] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prenom: "",
      nom: "",
      email: "",
      motDePasse: "",
      confirmationMotDePasse: "",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setApercuImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(data: FormValues) {
    try {
      setChargement(true);
      setError(null);
      await signUp.email({
        email: data.email,
        password: data.motDePasse,
        name: `${data.prenom} ${data.nom}`,
        image: image ? await convertImageToBase64(image) : "",
        callbackURL: "/auth/signin",
        fetchOptions: {
          onResponse: () => setChargement(false),
          onRequest: () => setChargement(true),
          onError: (ctx) => {
            setError(ctx.error.message);
            setChargement(false);
          },
          onSuccess: () => {
            toast.success(t("verificationEmailSent"));
            router.push("/auth/signin");
          },
        },
      });
    } catch {
      setChargement(false);
      toast.error(t("signUpError"));
    }
  }

  return (
    <div className="space-y-6">
      {/* Titre */}
      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl font-bold tracking-tight">{t("signUpTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("signUpDescriptionLong")}</p>
      </div>

      {/* Erreur */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Prénom + Nom */}
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="prenom"
              render={({ field }: { field: ControllerRenderProps<FormValues, "prenom"> }) => (
                <FormItem>
                  <FormLabel>{t("firstName")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("firstNamePlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nom"
              render={({ field }: { field: ControllerRenderProps<FormValues, "nom"> }) => (
                <FormItem>
                  <FormLabel>{t("lastName")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("lastNamePlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }: { field: ControllerRenderProps<FormValues, "email"> }) => (
              <FormItem>
                <FormLabel>{t("email")}</FormLabel>
                <FormControl>
                  <Input type="email" placeholder={t("emailPlaceholder")} autoComplete="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="motDePasse"
            render={({ field }: { field: ControllerRenderProps<FormValues, "motDePasse"> }) => (
              <FormItem>
                <FormLabel>{t("password")}</FormLabel>
                <FormControl>
                  <Input type="password" autoComplete="new-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmationMotDePasse"
            render={({ field }: { field: ControllerRenderProps<FormValues, "confirmationMotDePasse"> }) => (
              <FormItem>
                <FormLabel>{t("confirmPassword")}</FormLabel>
                <FormControl>
                  <Input type="password" autoComplete="new-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Photo de profil */}
          <div className="space-y-2">
            <Label htmlFor="image" className="text-sm font-medium">
              {t("profilePicture")}{" "}
              <span className="text-xs text-muted-foreground font-normal">(optionnel)</span>
            </Label>
            <div className="flex items-center gap-3">
              {apercuImage && (
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-border shrink-0">
                  <Image src={apercuImage} alt={t("profilePreview")} fill className="object-cover" />
                </div>
              )}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="flex-1 text-sm"
                />
                {apercuImage && (
                  <button
                    type="button"
                    onClick={() => { setImage(null); setApercuImage(null); }}
                    className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full h-10" disabled={chargement}>
            {chargement ? <Loader2 size={16} className="animate-spin" /> : t("signUpButton")}
          </Button>
        </form>
      </Form>

      {/* Lien connexion */}
      <p className="text-center text-sm text-muted-foreground">
        {t("alreadyHaveAccount")}{" "}
        <Link href="/auth/signin" className="text-primary hover:underline font-medium">
          {t("signInLink")}
        </Link>
      </p>
    </div>
  );
}

async function convertImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
