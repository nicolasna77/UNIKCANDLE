"use server";

import { headers } from "next/headers";
import { render } from "@react-email/render";
import ContactEmail from "@/emails/contact";
import { contactFormSchema } from "@/lib/schemas";
import { sendMail } from "@/lib/mailer";
import { rateLimit, getIpFromHeaders } from "@/lib/rate-limit";

export async function sendContactMessage(formData: FormData) {
  // Honeypot anti-spam : ce champ est invisible pour un humain (voir contact/page.tsx),
  // seuls les bots qui remplissent tous les champs le renseignent.
  if (formData.get("company")) {
    return {
      success: true,
      message: "Message envoyé avec succès",
    };
  }

  const ip = getIpFromHeaders(await headers());
  const { allowed, resetAt } = rateLimit(`contact:${ip}`, 3, 10 * 60_000);

  if (!allowed) {
    const retryMinutes = Math.max(1, Math.ceil((resetAt - Date.now()) / 60_000));
    return {
      success: false,
      error: `Trop de messages envoyés. Veuillez réessayer dans ${retryMinutes} minute(s).`,
    };
  }

  const rawData = {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  };

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
    const html = await render(
      ContactEmail({ firstName, lastName, email, phone: phone || "Non renseigné", subject, message })
    );

    await sendMail({
      to: "contact@unikcandle.com",
      subject: `[Contact] ${subject}`,
      html,
      replyTo: email,
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
