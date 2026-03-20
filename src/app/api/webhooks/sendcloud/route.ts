import { NextResponse } from "next/server";
import { createHmac } from "crypto";
import prisma from "@/lib/prisma";
import { sendShippingNotificationEmail } from "@/lib/email";
import { logger } from "@/lib/logger";
import type { OrderStatus } from "@prisma/client";

// Correspondance statuts SendCloud → OrderStatus Prisma
// https://support.sendcloud.com/hc/en-us/articles/360024967072
const SENDCLOUD_STATUS_MAP: Record<number, OrderStatus | null> = {
  11: "DELIVERED",       // Delivered
  12: "PROCESSING",      // Announced (label created) — déjà en processing
  13: "SHIPPED",         // In transit
  14: "SHIPPED",         // Out for delivery
  22: "SHIPPED",         // Picked up by driver
  // Statuts terminaux non mappés (on ne rétrograde pas)
  15: null,              // Failed delivery attempt
  92: null,              // Announcement error
  1000: null,            // Unknown
};

// Statuts pour lesquels on envoie un email au client
const NOTIFY_STATUSES = new Set([13, 14, 22, 11]);

function verifySignature(body: string, signature: string): boolean {
  const secret = process.env.SENDCLOUD_WEBHOOK_SECRET;
  if (!secret) {
    logger.warn("SENDCLOUD_WEBHOOK_SECRET non défini — vérification ignorée");
    return true; // En dev, on laisse passer
  }
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  return expected === signature;
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("sendcloud-signature") ?? "";

  if (!verifySignature(body, signature)) {
    logger.error("Webhook SendCloud: signature invalide");
    return new NextResponse("Signature invalide", { status: 401 });
  }

  let payload: {
    action: string;
    timestamp: number;
    parcel: {
      id: number;
      tracking_number: string;
      tracking_url: string;
      order_number: string; // = notre Order.id
      status: { id: number; message: string };
    };
  };

  try {
    payload = JSON.parse(body);
  } catch {
    return new NextResponse("JSON invalide", { status: 400 });
  }

  if (payload.action !== "parcel_status_changed") {
    return new NextResponse(null, { status: 200 });
  }

  const { parcel } = payload;
  const orderId = parcel.order_number;
  const sendcloudStatusId = parcel.status.id;
  const statusMessage = parcel.status.message;

  logger.info(
    `Webhook SendCloud: commande ${orderId} — statut ${sendcloudStatusId} (${statusMessage})`
  );

  // Récupérer la commande via l'order_number (= notre Order.id)
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true },
  });

  if (!order) {
    logger.warn(`Webhook SendCloud: commande ${orderId} introuvable`);
    return new NextResponse(null, { status: 200 }); // 200 pour éviter les retries
  }

  const newStatus = SENDCLOUD_STATUS_MAP[sendcloudStatusId];

  // Mettre à jour le statut si mappé et si ce n'est pas une rétrogradation
  const STATUS_RANK: Record<OrderStatus, number> = {
    PENDING: 0,
    PROCESSING: 1,
    SHIPPED: 2,
    DELIVERED: 3,
    CANCELLED: -1,
  };

  const shouldUpdateStatus =
    newStatus !== null &&
    newStatus !== undefined &&
    STATUS_RANK[newStatus] > STATUS_RANK[order.status];

  if (shouldUpdateStatus && newStatus) {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: newStatus,
        trackingNumber: parcel.tracking_number,
        trackingUrl: parcel.tracking_url,
      },
    });

    logger.info(
      `Webhook SendCloud: commande ${orderId} mise à jour → ${newStatus}`
    );
  }

  // Envoyer un email de notification si pertinent
  if (NOTIFY_STATUSES.has(sendcloudStatusId) && order.user) {
    try {
      await sendShippingNotificationEmail({
        userName: order.user.name,
        userEmail: order.user.email,
        orderId: order.id,
        trackingNumber: parcel.tracking_number,
        trackingUrl: parcel.tracking_url,
        statusMessage,
        isDelivered: sendcloudStatusId === 11,
      });
    } catch (emailError) {
      logger.error(
        "Webhook SendCloud: erreur envoi email notification",
        emailError
      );
    }
  }

  return new NextResponse(null, { status: 200 });
}
