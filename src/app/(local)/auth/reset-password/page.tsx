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
import { useRouter, useSearchParams } from "next/navigation";

const formSchema = z
  .object({
    motDePasse: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    confirmationMotDePasse: z.string(),
  })
  .refine((data) => data.motDePasse === data.confirmationMotDePasse, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmationMotDePasse"],
  });

type FormValues = z.infer<typeof formSchema>;

export default function ResetPassword() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as Resolver<FormValues>,
    defaultValues: {
      motDePasse: "",
      confirmationMotDePasse: "",
    },
  });

  async function onSubmit(data: FormValues) {
    if (!token) {
      toast.error("Token de réinitialisation manquant");
      return;
    }

    try {
      setLoading(true);
      await authClient.resetPassword({
        newPassword: data.motDePasse,
        token,
      });
      toast.success("Mot de passe réinitialisé", {
        description:
          "Vous pouvez maintenant vous connecter avec votre nouveau mot de passe",
      });
      router.push("/auth/signin");
    } catch {
      setLoading(false);
      toast.error(
        "Une erreur est survenue lors de la réinitialisation du mot de passe"
      );
    }
  }

  if (!token) {
    return (
      <div className="container mx-auto flex items-center justify-center min-h-screen py-12">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Token invalide</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Le lien de réinitialisation est invalide ou a expiré.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <Link
                href="/forgot-password"
                className="text-primary hover:underline"
              >
                Demander un nouveau lien
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
            Réinitialiser le mot de passe
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Entrez votre nouveau mot de passe
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
                    <FormLabel>Nouveau mot de passe</FormLabel>
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
                    <FormLabel>Confirmer le mot de passe</FormLabel>
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
                  "Réinitialiser le mot de passe"
                )}
              </Button>

              <div className="text-center text-sm">
                <Link
                  href="/auth/signin"
                  className="text-primary hover:underline"
                >
                  Retour à la connexion
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
