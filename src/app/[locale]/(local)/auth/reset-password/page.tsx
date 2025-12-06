"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
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
import { Link } from "@/i18n/routing";
import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

export default function ResetPassword() {
  const t = useTranslations("auth");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const formSchema = z
    .object({
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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as Resolver<FormValues>,
    defaultValues: {
      motDePasse: "",
      confirmationMotDePasse: "",
    },
  });

  async function onSubmit(data: FormValues) {
    if (!token) {
      toast.error(t("missingResetToken"));
      return;
    }

    try {
      setLoading(true);
      await authClient.resetPassword({
        newPassword: data.motDePasse,
        token,
      });
      toast.success(t("passwordResetSuccess"), {
        description: t("passwordResetSuccessDescription"),
      });
      router.push("/auth/signin");
    } catch {
      setLoading(false);
      toast.error(t("resetPasswordError"));
    }
  }

  if (!token) {
    return (
      <div className="container mx-auto flex items-center justify-center min-h-screen py-12">
        <Card className="max-w-md w-full border-border">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">{t("invalidToken")}</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              {t("invalidTokenDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <Link
                href="/forgot-password"
                className="text-primary hover:underline"
              >
                {t("requestNewLink")}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen py-12">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">
            {t("resetPasswordTitle")}
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">
            {t("resetPasswordDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormField
                control={form.control}
                name="motDePasse"
                render={({
                  field,
                }: {
                  field: ControllerRenderProps<FormValues, "motDePasse">;
                }) => (
                  <FormItem>
                    <FormLabel>{t("newPassword")}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
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
                    <FormLabel>{t("confirmNewPassword")}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  t("resetPasswordButton")
                )}
              </Button>

              <div className="text-center text-sm">
                <Link
                  href="/auth/signin"
                  className="text-primary hover:underline"
                >
                  {t("backToSignIn")}
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
