"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Category, Scent } from "@/generated/client";
import { useCategories } from "@/hooks/useCategories";

const formSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().min(1, "La description est requise"),
  price: z.coerce.number().positive("Le prix doit être positif"),
  subTitle: z.string().min(1, "Le sous-titre est requis"),
  slogan: z.string().min(1, "Le slogan est requis"),
  categoryId: z.string().min(1, "La catégorie est requise"),
  arAnimation: z.string().min(1, "L&apos;animation AR est requise"),
  scentId: z.string().min(1, "Le parfum est requis"),
  imageUrl: z.string().url("L&apos;URL de l&apos;image doit être valide"),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateProductFormProps {
  onSuccess: () => void;
  scents: Scent[];
}

export default function CreateProductForm({
  onSuccess,
  scents,
}: CreateProductFormProps) {
  const queryClient = useQueryClient();
  const { data: categories = [] } = useCategories();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      subTitle: "",
      slogan: "",
      categoryId: "",
      arAnimation: "",
      scentId: "",
      imageUrl: "",
    },
  });

  const createProduct = useMutation({
    mutationFn: async (values: FormValues) => {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Une erreur est survenue");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Produit créé avec succès");
      onSuccess();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (values: FormValues) => {
    createProduct.mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom</FormLabel>
                <FormControl>
                  <Input placeholder="Nom du produit" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prix</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Prix du produit"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sous-titre</FormLabel>
                <FormControl>
                  <Input placeholder="Sous-titre du produit" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slogan"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slogan</FormLabel>
                <FormControl>
                  <Input placeholder="Slogan du produit" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Catégorie</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category: Category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <span>{category.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="scentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parfum</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un parfum" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {scents?.map((scent: Scent) => (
                      <SelectItem key={scent.id} value={scent.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: scent.color }}
                          />
                          <span>{scent.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="arAnimation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Animation AR</FormLabel>
                <FormControl>
                  <Input placeholder="ID de l'animation AR" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL de l&apos;image</FormLabel>
                <FormControl>
                  <Input placeholder="URL de l'image" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Description du produit"
                  className="min-h-[150px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={createProduct.isPending}
        >
          {createProduct.isPending ? "Création..." : "Créer le produit"}
        </Button>
      </form>
    </Form>
  );
}
