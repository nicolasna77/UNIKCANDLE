"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { Resend } from "resend";
import NewsletterWelcomeEmail from "@/emails/newsletter-welcome";

const resend = new Resend(process.env.RESEND_API_KEY);

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

    // Envoyer l'email de bienvenue
    await resend.emails.send({
      from: "UNIKCANDLE <noreply@unikcandle.com>",
      to: validatedFields.data.email,
      subject: "Bienvenue dans l'aventure UNIKCANDLE !",
      react: NewsletterWelcomeEmail(),
      headers: {
        "List-Unsubscribe": `<mailto:unsubscribe@unikcandle.com?subject=unsubscribe>, <https://unikcandle.com/unsubscribe>`,
        Precedence: "bulk",
        "X-Auto-Response-Suppress": "OOF, AutoReply",
      },
      tags: [{ name: "category", value: "welcome" }],
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
