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
import { Pencil, Trash2 } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Loading from "@/components/loading";

import { Category } from "@/generated/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const categorySchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  description: z
    .string()
    .min(10, "La description doit contenir au moins 10 caractères"),
  icon: z.string().min(1, "L'icône est requise"),
  color: z.string().min(1, "La couleur est requise"),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  onSuccess: () => void;
  initialData?: Category;
}

function CategoryForm({ onSuccess, initialData }: CategoryFormProps) {
  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      icon: "",
      color: "#000000",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      const response = await fetch("/api/admin/categories", {
        method: initialData ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          initialData ? { ...data, id: initialData.id } : data
        ),
      });
      if (!response.ok)
        throw new Error("Erreur lors de la création de la catégorie");
    },
    onSuccess: () => {
      onSuccess();
      toast.success(initialData ? "Catégorie mise à jour" : "Catégorie créée");
    },
  });

  const onSubmit = (data: CategoryFormData) => {
    mutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icône</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Couleur</FormLabel>
              <FormControl>
                <Input type="color" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          {initialData ? "Mettre à jour" : "Créer"}
        </Button>
      </form>
    </Form>
  );
}

export default function CategoriesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const { data: categories = [], isLoading } = useCategories();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Erreur lors de la suppression");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Catégorie supprimée avec succès");
    },
  });

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestion des catégories</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>Créer une catégorie</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une catégorie</DialogTitle>
            </DialogHeader>
            <CategoryForm onSuccess={() => setIsCreateDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Icône</TableHead>
              <TableHead>Couleur</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category: Category) => (
              <TableRow key={category.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span>{category.name}</span>
                  </div>
                </TableCell>
                <TableCell>{category.description}</TableCell>
                <TableCell>{category.icon}</TableCell>
                <TableCell>
                  <div
                    className="w-6 h-6 rounded-full border"
                    style={{ backgroundColor: category.color }}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Dialog
                      open={editingCategory?.id === category.id}
                      onOpenChange={(open) => !open && setEditingCategory(null)}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingCategory(category)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Modifier la catégorie</DialogTitle>
                        </DialogHeader>
                        {editingCategory && (
                          <CategoryForm
                            initialData={editingCategory}
                            onSuccess={() => setEditingCategory(null)}
                          />
                        )}
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(category.id)}
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
