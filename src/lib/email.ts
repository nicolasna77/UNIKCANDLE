"use server";

import OrderConfirmationEmail from "@/emails/confirm-orders";
import ShippingNotificationEmail from "@/emails/shipping-notification";
import { Order } from "@/types/order";
import { render } from "@react-email/render";
import { sendMail } from "./mailer";

export const sendConfirmationEmail = async (order: Order) => {
  if (!order.user) {
    throw new Error("Utilisateur non trouvé dans la commande");
  }

  const html = await render(
    OrderConfirmationEmail({
      order,
      userName: order.user.name,
      userEmail: order.user.email,
    })
  );

  await sendMail({
    from: "UnikCandle <noreply@unikcandle.com>",
    to: order.user.email,
    subject: "Confirmation de votre commande UnikCandle",
    html,
  });
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
  const html = await render(ShippingNotificationEmail(params));
  const subject = params.isDelivered
    ? "Votre colis UNIKCANDLE a été livré !"
    : "Votre colis UNIKCANDLE est en route !";

  await sendMail({
    from: "UnikCandle <noreply@unikcandle.com>",
    to: params.userEmail,
    subject,
    html,
  });
};
