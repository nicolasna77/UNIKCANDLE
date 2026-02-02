import { z } from "zod";

// Schéma pour le formulaire de contact
export const contactFormSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Veuillez entrer une adresse email valide"),
  phone: z.string().optional(),
  subject: z.string().min(5, "Le sujet doit contenir au moins 5 caractères"),
  message: z
    .string()
    .min(10, "Le message doit contenir au moins 10 caractères"),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

// Schéma pour les reviews/avis produits
export const reviewSchema = z.object({
  productId: z.string().min(1, "Le produit est requis"),
  rating: z
    .number({ invalid_type_error: "La note doit être un nombre" })
    .int("La note doit être un nombre entier")
    .min(1, "La note minimum est 1")
    .max(5, "La note maximum est 5"),
  comment: z.string().min(10, "Le commentaire doit contenir au moins 10 caractères"),
});

export type ReviewFormData = z.infer<typeof reviewSchema>;
