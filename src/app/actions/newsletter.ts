"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";

const newsletterSchema = z.object({
  email: z.string().email("Email invalide"),
});

export async function subscribeToNewsletter(formData: FormData) {
  const validatedFields = newsletterSchema.safeParse({
    email: formData.get("email"),
  });

  if (!validatedFields.success) {
    return {
      error: "Email invalide",
      success: false,
    };
  }

  try {
    // Vérifier si l'email existe déjà
    const existingSubscription = await prisma.newsletter.findUnique({
      where: {
        email: validatedFields.data.email,
      },
    });

    if (existingSubscription) {
      return {
        error: "Vous êtes déjà inscrit à la newsletter",
        success: false,
      };
    }

    // Créer l'inscription dans la base de données
    await prisma.newsletter.create({
      data: {
        email: validatedFields.data.email,
      },
    });

    return {
      success: true,
      message: "Inscription réussie !",
    };
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    return {
      error: "Une erreur est survenue lors de l'inscription",
      success: false,
    };
  }
}
