"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { User } from "better-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface DisplayNameFormProps {
  session: User;
  isPending: boolean;
}

// Schéma de validation Zod
const profileSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  image: z.instanceof(File).optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function DisplayNameForm({ session, isPending }: DisplayNameFormProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    session.image || null
  );

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: session.name,
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("image", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      let imageUrl = session.image;
      if (data.image) {
        const formData = new FormData();
        formData.append("file", data.image);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Erreur lors de l'upload de l'image");
        }

        const uploadData = await response.json();
        imageUrl = uploadData.url;
      }

      await authClient.updateUser({
        name: data.name,
        image: imageUrl,
      });
      toast.success("Profil mis à jour", {
        description: "Votre profil a été modifié avec succès",
      });
    } catch {
      toast.error("Erreur", {
        description: "Une erreur est survenue lors de la mise à jour du profil",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Informations personnelles
          </CardTitle>
          <CardDescription>
            Mettez à jour vos informations personnelles et gérez votre profil
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                  <div className="relative w-24 h-24 mx-auto sm:mx-0 rounded-full overflow-hidden border-2 border-border bg-muted shrink-0">
                    {previewUrl ? (
                      <Image
                        src={previewUrl}
                        alt="Photo de profil"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-3xl text-muted-foreground">
                          {form.watch("name").charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <FormLabel className="text-base font-medium">
                      Photo de profil
                    </FormLabel>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() =>
                          document.getElementById("image-upload")?.click()
                        }
                      >
                        <Upload className="h-4 w-4" aria-hidden="true" />
                        Choisir une photo
                      </Button>
                      {previewUrl && previewUrl !== session.image && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="gap-2 text-muted-foreground hover:text-foreground"
                          onClick={() => {
                            form.setValue("image", undefined);
                            setPreviewUrl(session.image || null);
                          }}
                          aria-label="Annuler le changement de photo"
                        >
                          <X className="h-4 w-4" aria-hidden="true" />
                          Annuler
                        </Button>
                      )}
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="sr-only"
                        aria-label="Télécharger une photo de profil"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG ou WebP. Max 4 Mo.
                    </p>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium">
                        Nom
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={form.formState.isSubmitting || isPending}
                          placeholder="Votre nom"
                          className="max-w-md"
                          autoComplete="name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel className="text-base font-medium">Email</FormLabel>
                  <div className="flex items-center gap-2 max-w-md">
                    <Input
                      value={session.email}
                      disabled
                      className="bg-muted/50"
                      aria-label="Email (non modifiable)"
                    />
                    {session.emailVerified ? (
                      <Badge
                        variant="outline"
                        className="shrink-0 text-xs font-medium text-green-700 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950/30 dark:border-green-800"
                      >
                        Vérifié
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="shrink-0 text-xs font-medium text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/30 dark:border-amber-800"
                      >
                        Non vérifié
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={form.formState.isSubmitting || isPending}
                className="w-full sm:w-auto"
                aria-label="Mettre à jour le profil"
              >
                {form.formState.isSubmitting ? "Mise à jour…" : "Mettre à jour le profil"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
