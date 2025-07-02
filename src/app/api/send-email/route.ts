import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, subject, message } = body;

    // Validation côté serveur
    if (!firstName || !lastName || !email || !subject || !message) {
      return NextResponse.json(
        { message: "Tous les champs obligatoires doivent être remplis" },
        { status: 400 }
      );
    }

    if (!email.includes("@")) {
      return NextResponse.json(
        { message: "Adresse email invalide" },
        { status: 400 }
      );
    }

    // Email pour l'équipe UNIKCANDLE
    await resend.emails.send({
      from: "UNIKCANDLE <contact@unikcandle.com>",
      to: ["contact@unikcandle.com"], // Remplacez par votre email
      subject: `Nouveau message de contact - ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #6366f1; margin-bottom: 20px;">Nouveau message de contact</h1>
            
            <div style="margin-bottom: 20px;">
              <h2 style="color: #333; margin-bottom: 10px;">Informations du contact :</h2>
              <p><strong>Nom :</strong> ${firstName} ${lastName}</p>
              <p><strong>Email :</strong> ${email}</p>
              ${phone ? `<p><strong>Téléphone :</strong> ${phone}</p>` : ""}
            </div>
            
            <div style="margin-bottom: 20px;">
              <h2 style="color: #333; margin-bottom: 10px;">Sujet :</h2>
              <p style="background-color: #f3f4f6; padding: 10px; border-radius: 5px;">${subject}</p>
            </div>
            
            <div>
              <h2 style="color: #333; margin-bottom: 10px;">Message :</h2>
              <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${message}</div>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280;">
              <p>Ce message a été envoyé depuis le formulaire de contact de UNIKCANDLE</p>
            </div>
          </div>
        </div>
      `,
    });

    // Email de confirmation pour le client
    await resend.emails.send({
      from: "UNIKCANDLE <contact@unikcandle.com>",
      to: [email],
      subject: "Confirmation de votre message - UNIKCANDLE",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #6366f1; margin-bottom: 20px;">Merci pour votre message !</h1>
            
            <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
              Bonjour ${firstName},
            </p>
            
            <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
              Nous avons bien reçu votre message et nous vous en remercions. Notre équipe va l'étudier avec attention et vous répondre dans les plus brefs délais.
            </p>
            
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <h3 style="color: #333; margin-bottom: 10px;">Récapitulatif de votre message :</h3>
              <p><strong>Sujet :</strong> ${subject}</p>
              <p><strong>Message :</strong></p>
              <div style="white-space: pre-wrap; color: #666;">${message}</div>
            </div>
            
            <p style="color: #333; line-height: 1.6; margin-bottom: 20px;">
              En attendant notre réponse, n'hésitez pas à découvrir nos bougies uniques sur notre site web.
            </p>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="https://unikcandle.com" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Visiter UNIKCANDLE
              </a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280;">
              <p>L'équipe UNIKCANDLE</p>
              <p>contact@unikcandle.com</p>
            </div>
          </div>
        </div>
      `,
    });

    return NextResponse.json(
      { message: "Email envoyé avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    return NextResponse.json(
      { message: "Erreur lors de l'envoi de l'email" },
      { status: 500 }
    );
  }
}
