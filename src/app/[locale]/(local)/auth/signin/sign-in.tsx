"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { signIn, useSession, authClient } from "@/lib/auth-client";
import { Link } from "@/i18n/routing";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ControllerRenderProps, Resolver } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslations } from "next-intl";

export default function SignIn() {
  const t = useTranslations("auth");

  const formSchema = z.object({
    email: z.string().email(t("emailInvalid")),
    password: z.string().min(1, t("passwordRequired")),
    rememberMe: z.boolean(),
  });

  type FormValues = z.infer<typeof formSchema>;
  const callbackUrl = useSearchParams().get("callbackUrl");
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { data: session, isPending } = useSession();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isPending && !session && process.env.NODE_ENV === "production") {
      authClient.oneTap({
        callbackURL: callbackUrl || "/",
        onPromptNotification: (notification) => {
          console.warn("One Tap dismissed", notification);
        },
      }).catch((error) => {
        if (
          error instanceof Error &&
          !error.message.includes("AbortError") &&
          !error.message.includes("FedCM")
        ) {
          console.error("One Tap error:", error);
        }
      });
    }
  }, [session, isPending, callbackUrl]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as Resolver<FormValues>,
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  async function onSubmit(data: FormValues) {
    try {
      setLoading(true);
      setError(null);
      await signIn.email(
        {
          email: data.email,
          password: data.password,
          rememberMe: data.rememberMe,
        },
        {
          onRequest: () => setLoading(true),
          onResponse: () => setLoading(false),
          redirectTo: callbackUrl || "/",
          onError: (ctx) => {
            setLoading(false);
            setError(ctx.error.message || t("errorOccurred"));
          },
          callbackUrl: callbackUrl || "/",
          onSuccess: () => router.push(callbackUrl || "/"),
        }
      );
    } catch {
      setLoading(false);
      toast.error(t("signInError"));
    }
  }

  async function handleGoogleSignIn() {
    setLoading(true);
    try {
      await signIn.social({ provider: "google", callbackURL: callbackUrl || "/" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Titre */}
      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl font-bold tracking-tight">{t("signIn")}</h1>
        <p className="text-sm text-muted-foreground">{t("signInDescription")}</p>
      </div>

      {/* Erreur */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Google */}
      <Button
        type="button"
        variant="outline"
        className="w-full gap-2 h-10"
        disabled={loading}
        onClick={handleGoogleSignIn}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 256 262" aria-hidden="true">
          <path fill="#4285F4" d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" />
          <path fill="#34A853" d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" />
          <path fill="#FBBC05" d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z" />
          <path fill="#EB4335" d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" />
        </svg>
        {t("googleSignIn")}
      </Button>

      {/* Séparateur */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-3 text-xs text-muted-foreground">
            ou continuer avec un email
          </span>
        </div>
      </div>

      {/* Formulaire email */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }: { field: ControllerRenderProps<FormValues, "email"> }) => (
              <FormItem>
                <FormLabel>{t("email")}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={t("emailPlaceholder")}
                    autoComplete="email"
                    spellCheck="false"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }: { field: ControllerRenderProps<FormValues, "password"> }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>{t("password")}</FormLabel>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    {t("forgotPassword")}
                  </Link>
                </div>
                <FormControl>
                  <Input
                    type="password"
                    placeholder={t("passwordPlaceholder")}
                    autoComplete="current-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }: { field: ControllerRenderProps<FormValues, "rememberMe"> }) => (
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="!mt-0 font-normal text-sm">{t("rememberMe")}</FormLabel>
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full h-10" disabled={loading}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : t("signInButton")}
          </Button>
        </form>
      </Form>

      {/* Lien inscription */}
      <p className="text-center text-sm text-muted-foreground">
        {t("noAccount")}{" "}
        <Link href="/auth/signup" className="text-primary hover:underline font-medium">
          {t("createAccount")}
        </Link>
      </p>
    </div>
  );
}
