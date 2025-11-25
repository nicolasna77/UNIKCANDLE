"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { signIn, useSession, authClient } from "@/lib/auth-client";
import Link from "next/link";
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
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Alert } from "@/components/ui/alert";
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
    // Ne pas afficher One Tap si l'utilisateur est déjà connecté ou en développement
    if (!isPending && !session && process.env.NODE_ENV === 'production') {
      authClient.oneTap({
        callbackURL: callbackUrl || "/",
        onPromptNotification: (notification) => {
          console.warn("One Tap prompt was dismissed. Consider showing alternative sign-in options.", notification);
        }
      }).catch((error) => {
        // Ignorer les erreurs FedCM courantes
        if (error instanceof Error &&
            !error.message.includes('AbortError') &&
            !error.message.includes('FedCM')) {
          console.error("One Tap error:", error);
        }
      });
    }
  }, [session, isPending, callbackUrl]);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as Resolver<FormValues>,
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  async function onSubmit(data: FormValues) {
    try {
      setLoading(true);
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

  return (
    <Card className=" border-border">
      <CardHeader>
        <CardTitle className="text-lg text-center md:text-xl">
          {t("signIn")}
        </CardTitle>
        <CardDescription className="text-xs text-center md:text-sm">
          {t("signInDescription")}
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
              name="password"
              render={({
                field,
              }: {
                field: ControllerRenderProps<FormValues, "password">;
              }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>{t("password")}</FormLabel>
                    <Link
                      href="/auth/forgot-password"
                      className="text-sm text-primary hover:underline"
                    >
                      {t("forgotPassword")}
                    </Link>
                  </div>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={t("passwordPlaceholder")}
                      autoComplete="password"
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
              render={({
                field,
              }: {
                field: ControllerRenderProps<FormValues, "rememberMe">;
              }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="!mt-0">{t("rememberMe")}</FormLabel>
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                t("signInButton")
              )}
            </Button>

            <div className="w-full">
              <Button
                type="button"
                variant="outline"
                className="w-full gap-2"
                disabled={loading}
                onClick={async () => {
                  setLoading(true);
                  try {
                    await signIn.social({
                      provider: "google",
                      callbackURL: "/",
                    });
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="0.98em"
                  height="1em"
                  viewBox="0 0 256 262"
                >
                  <path
                    fill="#4285F4"
                    d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                  ></path>
                  <path
                    fill="#34A853"
                    d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                  ></path>
                  <path
                    fill="#FBBC05"
                    d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"
                  ></path>
                  <path
                    fill="#EB4335"
                    d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                  ></path>
                </svg>
                {t("googleSignIn")}
              </Button>
            </div>
          </form>
        </Form>
        <CardFooter className="flex items-center justify-center py-4 gap-2">
          <p>{t("noAccount")}</p>
          <Link className="hover:underline" href="/auth/signup">
            {t("createAccount")}
          </Link>
        </CardFooter>
      </CardContent>
    </Card>
  );
}
