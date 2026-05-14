import { NextRequest, NextResponse } from "next/server";
import { render } from "@react-email/render";
import ContactFormEmail from "@/emails/contact-form";
import { sendMail } from "@/lib/mailer";

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, phone, subject, message } =
      await request.json();

    if (!firstName || !lastName || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Tous les champs obligatoires doivent être remplis" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Format d'email invalide" },
        { status: 400 }
      );
    }

    const [teamHtml, confirmHtml] = await Promise.all([
      render(ContactFormEmail({ firstName, lastName, email, phone, subject, message, isConfirmation: false })),
      render(ContactFormEmail({ firstName, lastName, email, phone, subject, message, isConfirmation: true })),
    ]);

    await sendMail({
      from: "UnikCandle <contact@unikcandle.com>",
      to: "contact@unikcandle.com",
      subject: `Nouveau message de contact: ${subject}`,
      html: teamHtml,
      replyTo: email,
    });

    await sendMail({
      from: "UnikCandle <contact@unikcandle.com>",
      to: email,
      subject: "Confirmation de votre message - UnikCandle",
      html: confirmHtml,
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
