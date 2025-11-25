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
    } catch (error: unknown) {
      console.error("Erreur lors de la mise à jour du profil:", error);
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
                  <div className="relative w-24 h-24 mx-auto sm:mx-0 rounded-full overflow-hidden border-2 border-border">
                    {previewUrl ? (
                      <Image
                        src={previewUrl || "/placeholder.svg"}
                        alt="Photo de profil"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <span className="text-3xl text-muted-foreground">
                          {form.watch("name").charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <FormLabel htmlFor="image" className="text-base font-medium">
                      Photo de profil
                    </FormLabel>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="flex-1"
                          aria-label="Télécharger une photo de profil"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          <span className="hidden sm:inline">Télécharger</span>
                        </Button>
                      </div>
                      {previewUrl && previewUrl !== session.image && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            form.setValue("image", undefined);
                            setPreviewUrl(session.image || null);
                          }}
                          className="flex-shrink-0"
                          aria-label="Annuler le changement de photo"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
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
                          aria-label="Nom"
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
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                        Vérifié
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                        Non vérifié
                      </span>
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
                {form.formState.isSubmitting ? "Mise à jour..." : "Mettre à jour le profil"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
