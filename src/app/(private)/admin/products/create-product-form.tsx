import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import Image from "next/image";
import { Product, Scent } from "@/generated/client";
import { useState } from "react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

const CreateProductForm = ({
  scents,
  onSuccess,
}: {
  scents: Scent[];
  onSuccess: () => void;
}) => {
  const [selectedScents, setSelectedScents] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [productData, setProductData] = useState<Partial<Product>>({
    name: "",
    description: "",
    price: 0,
    imageUrl: "",
    subTitle: "",
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("L'image ne doit pas dépasser 5MB");
      }

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/products/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors du téléchargement");
      }

      return response.json();
    },
    onSuccess: (data) => {
      setProductData((prev) => ({ ...prev, imageUrl: data.url }));
      toast.success("Image téléchargée avec succès");
    },
    onError: (error: Error) => {
      console.error("Erreur lors du téléchargement:", error);
      toast.error(error.message || "Erreur lors du téléchargement de l'image");
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (
      data: Partial<Product> & { selectedScents: string[] }
    ) => {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la création du produit");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Produit créé avec succès");
      onSuccess();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la création du produit");
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Le fichier doit être une image");
      return;
    }

    setIsUploading(true);
    try {
      await uploadMutation.mutateAsync(file);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !productData.name ||
      !productData.description ||
      !productData.price ||
      !productData.imageUrl
    ) {
      toast.error("Tous les champs sont obligatoires");
      return;
    }

    if (selectedScents.length === 0) {
      toast.error("Veuillez sélectionner au moins une senteur");
      return;
    }

    try {
      await createProductMutation.mutateAsync({
        ...productData,
        selectedScents,
      });
    } catch (error) {
      console.error("Erreur lors de la création du produit:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nom</Label>
        <Input
          id="name"
          value={productData.name}
          onChange={(e) =>
            setProductData({ ...productData, name: e.target.value })
          }
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="subTitle">Sous-titre</Label>
        <Textarea
          id="subTitle"
          value={productData.subTitle}
          onChange={(e) =>
            setProductData({ ...productData, subTitle: e.target.value })
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={productData.description}
          onChange={(e) =>
            setProductData({ ...productData, description: e.target.value })
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">Prix</Label>
        <Input
          id="price"
          type="number"
          value={productData.price}
          onChange={(e) =>
            setProductData({ ...productData, price: Number(e.target.value) })
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageUrl">Image du produit</Label>
        <div className="flex items-center gap-2">
          <Input id="imageUrl" value={productData.imageUrl} readOnly />
          <Button
            variant="outline"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("image-upload")?.click();
            }}
            disabled={isUploading}
          >
            <Upload className="mr-2 h-4 w-4" />
            {isUploading ? "Téléchargement..." : "Télécharger"}
          </Button>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </div>
        {productData.imageUrl && (
          <div className="mt-2">
            <Image
              src={productData.imageUrl}
              alt="Aperçu"
              width={100}
              height={100}
              className="rounded-md"
            />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Senteurs disponibles</Label>
        <div className="grid grid-cols-2 gap-2">
          {scents.map((scent: Scent) => (
            <div key={scent.id} className="flex items-center space-x-2">
              <Checkbox
                id={`scent-${scent.id}`}
                checked={selectedScents.includes(scent.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedScents([...selectedScents, scent.id]);
                  } else {
                    setSelectedScents(
                      selectedScents.filter((id) => id !== scent.id)
                    );
                  }
                }}
              />
              <Label
                htmlFor={`scent-${scent.id}`}
                className="flex items-center gap-2"
              >
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: scent.color }}
                />
                {scent.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={createProductMutation.isPending}
      >
        {createProductMutation.isPending
          ? "Création en cours..."
          : "Créer le produit"}
      </Button>
    </form>
  );
};

export default CreateProductForm;
