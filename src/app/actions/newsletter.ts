"use server";

import { z } from "zod";
import { render } from "@react-email/render";
import NewsletterWelcomeEmail from "@/emails/newsletter-welcome";
import prisma from "@/lib/prisma";
import { sendMail } from "@/lib/mailer";

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
    const existingSubscription = await prisma.newsletter.findUnique({
      where: { email: validatedFields.data.email },
    });

    if (existingSubscription) {
      return {
        error: "Vous êtes déjà inscrit à la newsletter",
        success: false,
      };
    }

    await prisma.newsletter.create({
      data: { email: validatedFields.data.email },
    });

    const html = await render(NewsletterWelcomeEmail());

    await sendMail({
      to: validatedFields.data.email,
      subject: "Bienvenue dans l'aventure UNIKCANDLE !",
      html,
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
