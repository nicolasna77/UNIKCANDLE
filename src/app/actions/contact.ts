"use server";

import { render } from "@react-email/render";
import ContactEmail from "@/emails/contact";
import { contactFormSchema } from "@/lib/schemas";
import { sendMail } from "@/lib/mailer";

export async function sendContactMessage(formData: FormData) {
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
      from: "UNIKCANDLE Contact <contact@unikcandle.com>",
      to: "support@unikcandle.com",
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
