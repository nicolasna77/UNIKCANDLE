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
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function ForgotPassword() {
  const t = useTranslations("auth");
  const [loading, setLoading] = useState(false);

  const formSchema = z.object({
    email: z.string().email(t("emailInvalid")),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as Resolver<FormValues>,
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: FormValues) {
    try {
      setLoading(true);
      await authClient.requestPasswordReset({
        email: data.email,
        redirectTo: "/reset-password",
      });
      toast.success(t("emailSent"), {
        description: t("checkInboxMessage"),
      });
    } catch {
      setLoading(false);
      toast.error(t("sendEmailError"));
    }
  }

  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen py-12">
      <Card className="max-w-md border-border w-full">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">
            {t("forgotPasswordTitle")}
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">
            {t("forgotPasswordDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
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

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  t("sendLink")
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
