"use client";

import { Button } from "@/components/ui/button";
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
    defaultValues: { email: "" },
  });

  async function onSubmit(data: FormValues) {
    try {
      setLoading(true);
      await authClient.requestPasswordReset({
        email: data.email,
        redirectTo: "/reset-password",
      });
      toast.success(t("emailSent"), { description: t("checkInboxMessage") });
    } catch {
      setLoading(false);
      toast.error(t("sendEmailError"));
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl font-bold tracking-tight">{t("forgotPasswordTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("forgotPasswordDescription")}</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }: { field: ControllerRenderProps<FormValues, "email"> }) => (
              <FormItem>
                <FormLabel>{t("email")}</FormLabel>
                <FormControl>
                  <Input type="email" placeholder={t("emailPlaceholder")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full h-10" disabled={loading}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : t("sendLink")}
          </Button>
        </form>
      </Form>

      <p className="text-center text-sm">
        <Link href="/auth/signin" className="text-muted-foreground hover:text-primary transition-colors">
          ← {t("backToSignIn")}
        </Link>
      </p>
    </div>
  );
}
