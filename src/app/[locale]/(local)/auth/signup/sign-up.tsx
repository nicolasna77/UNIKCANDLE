"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SignUp() {
  const t = useTranslations("auth");

  const formSchema = z
    .object({
      prenom: z.string().min(2, t("firstNameMinLength")),
      nom: z.string().min(2, t("lastNameMinLength")),
      email: z.string().email(t("emailInvalid")),
      motDePasse: z
        .string()
        .min(8, t("passwordMinLength")),
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
      reader.onloadend = () => {
        setApercuImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(data: FormValues) {
    try {
      setChargement(true);
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
    <Card className="z-50 border-border">
      <CardHeader>
        <CardTitle className="text-lg text-center md:text-xl">
          {t("signUpTitle")}
        </CardTitle>
        <CardDescription className="text-xs text-center md:text-sm">
          {t("signUpDescriptionLong")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className=" py-4 ">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{t("error")}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="prenom"
                render={({
                  field,
                }: {
                  field: ControllerRenderProps<FormValues, "prenom">;
                }) => (
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
                render={({
                  field,
                }: {
                  field: ControllerRenderProps<FormValues, "nom">;
                }) => (
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
              render={({
                field,
              }: {
                field: ControllerRenderProps<FormValues, "email">;
              }) => (
                <FormItem>
                  <FormLabel>{t("email")}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={t("emailPlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="motDePasse"
              render={({
                field,
              }: {
                field: ControllerRenderProps<FormValues, "motDePasse">;
              }) => (
                <FormItem>
                  <FormLabel>{t("password")}</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmationMotDePasse"
              render={({
                field,
              }: {
                field: ControllerRenderProps<
                  FormValues,
                  "confirmationMotDePasse"
                >;
              }) => (
                <FormItem>
                  <FormLabel>{t("confirmPassword")}</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-2">
              <Label htmlFor="image">{t("profilePicture")}</Label>
              <div className="flex items-end gap-4">
                {apercuImage && (
                  <div className="relative w-16 h-16 rounded-sm overflow-hidden">
                    <Image
                      src={apercuImage}
                      alt={t("profilePreview")}
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                )}
                <div className="flex items-center gap-2 w-full">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full"
                  />
                  {apercuImage && (
                    <X
                      className="cursor-pointer"
                      onClick={() => {
                        setImage(null);
                        setApercuImage(null);
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={chargement}>
              {chargement ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                t("signUpButton")
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex items-center justify-center gap-2">
        <p>{t("alreadyHaveAccount")}</p>
        <Link className="hover:underline" href="/auth/signin">
          {t("signInLink")}
        </Link>
      </CardFooter>
    </Card>
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
