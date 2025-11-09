"use server";

import { Resend } from "resend";
import ContactEmail from "@/emails/contact";
import { contactFormSchema } from "@/lib/schemas";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendContactMessage(formData: FormData) {
  // Extraction et validation des données du formulaire
  const rawData = {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  };

  // Validation côté serveur (sécurité primaire)
  const validatedFields = contactFormSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      success: false,
      error: "Données invalides",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { firstName, lastName, email, phone, subject, message } =
    validatedFields.data;

  try {
    // Envoyer l'email
    await resend.emails.send({
      from: "UNIKCANDLE Contact <contact@unikcandle.com>",
      to: "support@unikcandle.com", // Votre adresse email de support
      replyTo: email,
      subject: `[Contact] ${subject}`,
      react: ContactEmail({
        firstName,
        lastName,
        email,
        phone: phone || "Non renseigné",
        subject,
        message,
      }),
      tags: [{ name: "category", value: "contact" }],
    });

    return {
      success: true,
      message: "Message envoyé avec succès",
    };
  } catch (error) {
    console.error("Erreur lors de l'envoi du message:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors de l'envoi du message",
    };
  }
}
