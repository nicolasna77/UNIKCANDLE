"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
import { useScents } from "@/hooks/useScents";
import { Scent } from "@/generated/client";

const formSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().min(1, "La description est requise"),
  price: z.coerce.number().positive("Le prix doit être positif"),
  subTitle: z.string().min(1, "Le sous-titre est requis"),
  slogan: z.string().min(1, "Le slogan est requis"),
  category: z.string().min(1, "La catégorie est requise"),
  arAnimation: z.string().min(1, "L&apos;animation AR est requise"),
  scentId: z.string().min(1, "Le parfum est requis"),
  imageUrl: z.string().url("L&apos;URL de l&apos;image doit être valide"),
});

type FormValues = z.infer<typeof formSchema>;

const categories = [
  { value: "Amour", label: "Amour" },
  { value: "Vie sociale", label: "Vie sociale" },
  { value: "Travail", label: "Travail" },
  { value: "Émotions", label: "Émotions" },
];

interface EditProductFormProps {
  productId: string;
  initialData: {
    name: string;
    description: string;
    price: number;
    subTitle: string;
    slogan: string;
    category: string;
    arAnimation: string;
    scent: Scent;
    images: { url: string }[];
  };
}

export default function EditProductForm({
  productId,
  initialData,
}: EditProductFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: scents } = useScents();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData.name,
      description: initialData.description,
      price: initialData.price,
      subTitle: initialData.subTitle,
      slogan: initialData.slogan,
      category: initialData.category,
      arAnimation: initialData.arAnimation,
      scentId: initialData.scent.id,
      imageUrl: initialData.images[0]?.url || "",
    },
  });

  const updateProduct = useMutation({
    mutationFn: async (values: FormValues) => {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
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
      toast.success("Produit mis à jour avec succès");
      router.push("/admin/products");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (values: FormValues) => {
    updateProduct.mutate(values);
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
            name="category"
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
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
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
                        {scent.name}
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
          disabled={updateProduct.isPending}
        >
          {updateProduct.isPending
            ? "Mise à jour..."
            : "Mettre à jour le produit"}
        </Button>
      </form>
    </Form>
  );
}
