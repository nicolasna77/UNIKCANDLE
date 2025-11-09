"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";

// Schéma de validation pour la création d'une session Stripe
const checkoutItemSchema = z.object({
  id: z.string(),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
  name: z.string(),
  selectedScent: z.object({
    id: z.string(),
    name: z.string(),
  }),
});

const createCheckoutSessionSchema = z.object({
  items: z.array(checkoutItemSchema).min(1, "Au moins un article est requis"),
});

// Types pour les réponses
interface ActionResponse<T = unknown> {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  data?: T;
}

/**
 * Créer une session de checkout Stripe
 */
export async function createCheckoutSession(
  data: unknown
): Promise<ActionResponse<{ sessionId: string; url: string }>> {
  try {
    // Vérification de l'authentification
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        success: false,
        error: "Vous devez être connecté pour créer une session de paiement",
      };
    }

    // Validation des données
    const validatedFields = createCheckoutSessionSchema.safeParse(data);

    if (!validatedFields.success) {
      return {
        success: false,
        error: "Données invalides",
        fieldErrors: validatedFields.error.flatten().fieldErrors,
      };
    }

    // Note: La logique Stripe sera implémentée ici
    // Pour l'instant, on utilise l'API route existante
    const response = await fetch(
      `${process.env.BETTER_AUTH_URL}/api/create-checkout-session`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: (await headers()).get("cookie") || "",
        },
        body: JSON.stringify(validatedFields.data),
      }
    );

    if (!response.ok) {
      return {
        success: false,
        error: "Erreur lors de la création de la session de paiement",
      };
    }

    const result = await response.json();

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Erreur lors de la création de la session Stripe:", error);
    return {
      success: false,
      error: "Erreur lors de la création de la session de paiement",
    };
  }
}
