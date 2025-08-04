import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import ContactFormEmail from "@/emails/contact-form";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, phone, subject, message } =
      await request.json();

    // Validation des champs requis
    if (!firstName || !lastName || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Tous les champs obligatoires doivent être remplis" },
        { status: 400 }
      );
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Format d'email invalide" },
        { status: 400 }
      );
    }

    // Envoi de l'email à l'équipe
    const { error } = await resend.emails.send({
      from: "UnikCandle <contact@unikcandle.com>",
      to: ["contact@unikcandle.com"], // Email de l'équipe
      subject: `Nouveau message de contact: ${subject}`,
      react: ContactFormEmail({
        firstName,
        lastName,
        email,
        phone,
        subject,
        message,
        isConfirmation: false,
      }),
    });

    if (error) {
      console.error("Erreur Resend:", error);
      return NextResponse.json(
        { error: "Erreur lors de l'envoi de l'email" },
        { status: 500 }
      );
    }

    // Email de confirmation au client
    await resend.emails.send({
      from: "UnikCandle <contact@unikcandle.com>",
      to: [email],
      subject: "Confirmation de votre message - UnikCandle",
      react: ContactFormEmail({
        firstName,
        lastName,
        email,
        phone,
        subject,
        message,
        isConfirmation: true,
      }),
    });

    return NextResponse.json(
      { success: true, message: "Message envoyé avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors du traitement de la demande:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
