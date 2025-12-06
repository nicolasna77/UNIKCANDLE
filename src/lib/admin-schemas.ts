import { z } from "zod";

// Schéma pour les produits
export const productSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  nameEN: z.string().min(2, "The name must contain at least 2 characters").optional().or(z.literal("")),
  description: z
    .string()
    .min(10, "La description doit contenir au moins 10 caractères"),
  descriptionEN: z.string().min(10, "The description must contain at least 10 characters").optional().or(z.literal("")),
  price: z.coerce.number().positive("Le prix doit être supérieur à 0"),
  subTitle: z
    .string()
    .min(2, "Le sous-titre doit contenir au moins 2 caractères"),
  subTitleEN: z.string().min(2, "The subtitle must contain at least 2 characters").optional().or(z.literal("")),
  slogan: z.string().min(2, "Le slogan doit contenir au moins 2 caractères"),
  sloganEN: z.string().min(2, "The slogan must contain at least 2 characters").optional().or(z.literal("")),
  categoryId: z.string().min(1, "La catégorie est requise"),
  arAnimation: z.string().optional(),
  messageType: z.enum(["audio", "text"]).default("audio"),
  scentId: z.string().min(1, "Le parfum est requis"),
  imageUrl: z.string().url("L'URL de l'image doit être valide").optional().or(z.literal("")),
  images: z
    .array(
      z.object({
        url: z.string().url("L'URL de l'image doit être valide"),
      })
    )
    .optional(),
});

export const productUpdateSchema = productSchema
  .extend({
    id: z.string(),
  })
  .partial()
  .required({ id: true });

// Schéma pour les catégories
export const categorySchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  nameEN: z.string().min(2, "The name must contain at least 2 characters").optional().or(z.literal("")),
  description: z
    .string()
    .min(10, "La description doit contenir au moins 10 caractères"),
  descriptionEN: z.string().min(10, "The description must contain at least 10 characters").optional().or(z.literal("")),
  icon: z.string().min(1, "L'icône est requise"),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Format de couleur invalide"),
  imageUrl: z.string().url("L'URL de l'image doit être valide").optional().or(z.literal("")),
});

export const categoryUpdateSchema = categorySchema
  .extend({
    id: z.string(),
  })
  .partial()
  .required({ id: true });

// Schéma pour les senteurs
export const scentSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  description: z
    .string()
    .min(10, "La description doit contenir au moins 10 caractères"),
  icon: z.string().min(1, "L'icône est requise"),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Format de couleur invalide"),
  notes: z.array(z.string()).optional().default([]),
});

export const scentUpdateSchema = scentSchema
  .extend({
    id: z.string(),
  })
  .partial()
  .required({ id: true });

// Schéma pour les utilisateurs
export const userSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("L'email doit être valide"),
  role: z.enum(["USER", "ADMIN"], {
    errorMap: () => ({ message: "Le rôle doit être USER ou ADMIN" }),
  }),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .optional(),
});

export const userUpdateSchema = userSchema
  .extend({
    id: z.string(),
  })
  .partial()
  .required({ id: true });

// Schéma pour le bannissement d'utilisateurs
export const banUserSchema = z.object({
  userId: z.string().min(1, "L'utilisateur est requis"),
  reason: z.string().min(5, "La raison doit contenir au moins 5 caractères"),
  expirationDate: z.date().optional(),
});

// Types TypeScript inférés
export type ProductFormData = z.infer<typeof productSchema>;
export type ProductUpdateData = z.infer<typeof productUpdateSchema>;
export type CategoryFormData = z.infer<typeof categorySchema>;
export type CategoryUpdateData = z.infer<typeof categoryUpdateSchema>;
export type ScentFormData = z.infer<typeof scentSchema>;
export type ScentUpdateData = z.infer<typeof scentUpdateSchema>;
export type UserFormData = z.infer<typeof userSchema>;
export type UserUpdateData = z.infer<typeof userUpdateSchema>;
export type BanUserFormData = z.infer<typeof banUserSchema>;

// Types pour les entités avec relations
export interface ProductWithRelations {
  id: string;
  name: string;
  nameEN?: string | null;
  description: string;
  descriptionEN?: string | null;
  price: number;
  subTitle: string;
  subTitleEN?: string | null;
  slogan: string;
  sloganEN?: string | null;
  messageType: "audio" | "text";
  category: {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
  };
  scent: {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
  };
  images: Array<{
    id: string;
    url: string;
  }>;
}

export interface CategoryWithProducts {
  id: string;
  name: string;
  nameEN?: string | null;
  description: string;
  descriptionEN?: string | null;
  icon: string;
  color: string;
  imageUrl?: string;
  _count?: {
    products: number;
  };
}

export interface ScentWithProducts {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  notes: string[];
  _count?: {
    products: number;
  };
}

// Utilitaires de validation
export const validateImageUrls = (urls: string[]): boolean => {
  return urls.every((url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  });
};

export const validateColor = (color: string): boolean => {
  return /^#[0-9A-F]{6}$/i.test(color);
};
