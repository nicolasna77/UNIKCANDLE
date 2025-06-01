import { NextResponse } from "next/server";
import { Resend } from "resend";
import { render } from "@react-email/render";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { to, subject, react } = await request.json();

    console.log("Tentative d'envoi d'email à:", to);
    console.log("Sujet:", subject);

    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY n'est pas définie");
      return NextResponse.json(
        { error: "Configuration manquante" },
        { status: 500 }
      );
    }

    if (!to) {
      console.error("Adresse email manquante");
      return NextResponse.json(
        { error: "Adresse email manquante" },
        { status: 400 }
      );
    }

    // Convertir le composant React en HTML
    const html = await render(react);

    // Envoyer l'email avec l'HTML généré
    const { data, error } = await resend.emails.send({
      from: "UnikCandle <noreply@unikcandle.com>",
      to,
      subject,
      html: html,
      text: "Merci pour votre commande !", // Version texte simple
    });

    if (error) {
      console.error("Erreur Resend:", error);
      return NextResponse.json({ error }, { status: 400 });
    }

    console.log("Email envoyé avec succès:", data);
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi de l'email" },
      { status: 500 }
    );
  }
}
