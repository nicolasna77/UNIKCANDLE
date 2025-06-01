"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

interface CreateScentFormProps {
  onSuccess: () => void;
}

export default function CreateScentForm({ onSuccess }: CreateScentFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#000000");
  const [icon, setIcon] = useState("");
  const [notes] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const createScent = useMutation({
    mutationFn: async (data: {
      name: string;
      description: string;
      color: string;
      icon: string;
      notes: string[];
    }) => {
      const response = await fetch("/api/admin/scents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Erreur lors de la création du parfum");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scents"] });
      toast.success("Parfum créé avec succès");
      onSuccess();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la création du parfum");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createScent.mutateAsync({
        name,
        description,
        color,
        icon,
        notes,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nom</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="color">Couleur</Label>
        <div className="flex gap-2">
          <Input
            id="color"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            required
            disabled={isSubmitting}
            className="w-20"
          />
          <Input
            type="text"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            required
            disabled={isSubmitting}
            className="flex-1"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="icon">Icône</Label>
        <Input
          id="icon"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          required
          disabled={isSubmitting}
          placeholder="Nom de l'icône (ex: Flower)"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Création en cours...
          </>
        ) : (
          "Créer le parfum"
        )}
      </Button>
    </form>
  );
}
