"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Loading from "@/components/loading";

interface Scent {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  model3dUrl: string;
}

export default function ScentsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingScent, setEditingScent] = useState<Scent | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
    color: "",
    model3dUrl: "",
  });
  const [isUploading, setIsUploading] = useState(false);

  const queryClient = useQueryClient();

  const { data: scents = [], isLoading } = useQuery({
    queryKey: ["scents"],
    queryFn: async () => {
      const response = await fetch("/api/admin/scents");
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch("/api/admin/scents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Erreur lors de la création");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scents"] });
      toast.success("Senteur créée avec succès");
      setIsDialogOpen(false);
      setFormData({
        name: "",
        description: "",
        icon: "",
        color: "",
        model3dUrl: "",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const response = await fetch(`/api/admin/scents/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Erreur lors de la mise à jour");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scents"] });
      toast.success("Senteur mise à jour avec succès");
      setIsDialogOpen(false);
      setEditingScent(null);
      setFormData({
        name: "",
        description: "",
        icon: "",
        color: "",
        model3dUrl: "",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/scents/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Erreur lors de la suppression");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scents"] });
      toast.success("Senteur supprimée avec succès");
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/scents/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Erreur lors du téléchargement");
      return response.json();
    },
    onSuccess: (data) => {
      setFormData((prev) => ({ ...prev, model3dUrl: data.url }));
      toast.success("Modèle 3D téléchargé avec succès");
    },
    onError: (error) => {
      console.error("Erreur lors du téléchargement:", error);
      toast.error("Erreur lors du téléchargement du fichier");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingScent) {
      updateMutation.mutate({ id: editingScent.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (scent: Scent) => {
    setEditingScent(scent);
    setFormData({
      name: scent.name,
      description: scent.description,
      icon: scent.icon,
      color: scent.color,
      model3dUrl: scent.model3dUrl,
    });
    setIsDialogOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await uploadMutation.mutateAsync(file);
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestion des senteurs</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingScent(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter une senteur
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingScent ? "Modifier la senteur" : "Ajouter une senteur"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="icon">Icône</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) =>
                    setFormData({ ...formData, icon: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Couleur</Label>
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model3dUrl">Modèle 3D</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="model3dUrl"
                    value={formData.model3dUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, model3dUrl: e.target.value })
                    }
                    readOnly
                  />
                  <Button
                    variant="outline"
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById("file-upload")?.click();
                    }}
                    disabled={isUploading}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {isUploading ? "Téléchargement..." : "Télécharger"}
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".glb,.gltf"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
                {formData.model3dUrl && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    Modèle actuel: {formData.model3dUrl.split("/").pop()}
                  </div>
                )}
              </div>
              <Button type="submit" className="w-full">
                {editingScent ? "Mettre à jour" : "Créer"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Couleur</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scents.map((scent: Scent) => (
              <TableRow key={scent.id}>
                <TableCell className="font-medium">{scent.name}</TableCell>
                <TableCell>{scent.description}</TableCell>
                <TableCell>
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: scent.color }}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(scent)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(scent.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
