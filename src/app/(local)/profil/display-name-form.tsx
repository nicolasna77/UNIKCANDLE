import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import Image from "next/image";
import { Upload, X } from "lucide-react";
import { User } from "better-auth";

interface DisplayNameFormProps {
  session: User;
  isPending: boolean;
}

export function DisplayNameForm({ session, isPending }: DisplayNameFormProps) {
  const [name, setName] = useState(session.name);
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    session.image || null
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let imageUrl = session.image;
      if (image) {
        const formData = new FormData();
        formData.append("file", image);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Erreur lors de l'upload de l'image");
        }

        const data = await response.json();
        imageUrl = data.url;
      }

      await authClient.updateUser({
        name,
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
    } finally {
      setIsLoading(false);
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
          <form onSubmit={handleSubmit} className="space-y-6">
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
                        {name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="image" className="text-base font-medium">
                    Photo de profil
                  </Label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="flex-1"
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
                          setImage(null);
                          setPreviewUrl(session.image || null);
                        }}
                        className="flex-shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-base font-medium">
                  Nom
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading || isPending}
                  placeholder="Votre nom"
                  className="max-w-md"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-base font-medium">Email</Label>
                <div className="flex items-center gap-2 max-w-md">
                  <Input
                    value={session.email}
                    disabled
                    className="bg-muted/50"
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
              disabled={isLoading || isPending}
              className="w-full sm:w-auto"
            >
              {isLoading ? "Mise à jour..." : "Mettre à jour le profil"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
