"use server";

import OrderConfirmationEmail from "@/emails/confirm-orders";
import ShippingNotificationEmail from "@/emails/shipping-notification";
import { Order } from "@/types/order";
import { Resend } from "resend";
import { render } from "@react-email/render";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendConfirmationEmail = async (order: Order) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY n'est pas définie");
    }

    if (!order.user) {
      console.error("Utilisateur non trouvé dans la commande:", order);
      throw new Error("Utilisateur non trouvé dans la commande");
    }

    const html = await render(
      OrderConfirmationEmail({
        order,
        userName: order.user.name,
        userEmail: order.user.email,
      })
    );

    const { data, error } = await resend.emails.send({
      from: "UnikCandle <noreply@unikcandle.com>",
      to: order.user.email,
      subject: "Confirmation de votre commande UnikCandle",
      html,
      text: "Merci pour votre commande !", // Version texte simple
    });

    if (error) {
      console.error("Erreur Resend:", error);
      throw error;
    }

    console.log("Email envoyé avec succès:", data);
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    throw error;
  }
};

export const sendShippingNotificationEmail = async (params: {
  userName: string;
  userEmail: string;
  orderId: string;
  trackingNumber: string;
  trackingUrl: string;
  statusMessage: string;
  isDelivered: boolean;
}) => {
  if (!process.env.RESEND_API_KEY) return;

  const html = await render(ShippingNotificationEmail(params));
  const subject = params.isDelivered
    ? "Votre colis UNIKCANDLE a été livré !"
    : "Votre colis UNIKCANDLE est en route !";

  await resend.emails.send({
    from: "UnikCandle <noreply@unikcandle.com>",
    to: params.userEmail,
    subject,
    html,
  });
};
