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

    // Envoyer l'email via OVH
    const response = await fetch("https://api.ovh.com/1.0/email/prod/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Ovh-Application": process.env.OVH_APP_KEY!,
        "X-Ovh-Consumer": process.env.OVH_CONSUMER_KEY!,
        "X-Ovh-Timestamp": Date.now().toString(),
        "X-Ovh-Signature": process.env.OVH_SIGNATURE!, // À générer selon la doc OVH
      },
      body: JSON.stringify({
        from: "noreply@unikcandle.com",
        to: validatedFields.data.email,
        subject: "Bienvenue chez UNIKCANDLE !",
        text: "Merci de votre inscription à notre newsletter. Nous vous tiendrons informé de notre lancement !",
        html: `
          <h1>Bienvenue chez UNIKCANDLE !</h1>
          <p>Merci de votre inscription à notre newsletter. Nous vous tiendrons informé de notre lancement !</p>
        `,
      }),
    });

    if (!response.ok) {
      throw new Error("Erreur lors de l'envoi de l'email");
    }

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
