import { z } from "zod";

/**
 * Schéma de validation pour créer un retour
 */
export const createReturnSchema = z.object({
  orderItemId: z.string().min(1, "L'ID de l'article est requis"),
  reason: z.string().min(5, "La raison doit contenir au moins 5 caractères"),
  description: z.string().optional(),
});

/**
 * Schéma de validation pour mettre à jour le statut
 */
export const updateReturnStatusSchema = z.object({
  status: z.enum([
    "REQUESTED",
    "APPROVED",
    "REJECTED",
    "COMPLETED",
    "RETURN_SHIPPING_SENT",
    "RETURN_IN_TRANSIT",
    "RETURN_DELIVERED",
    "PROCESSING",
  ]),
  adminNote: z.string().optional(),
  refundAmount: z.number().optional(),
  returnInstructions: z.string().optional(),
  returnAddress: z.string().optional(),
  returnDeadline: z.string().optional(),
});

/**
 * Schéma de validation pour le tracking
 */
export const updateReturnTrackingSchema = z.object({
  status: z.string().optional(),
  trackingNumber: z.string().optional(),
  carrier: z.string().optional(),
  trackingUrl: z.string().optional(),
});

/**
 * Include standard pour les requêtes de retour
 */
export const returnInclude = {
  orderItem: {
    include: {
      product: {
        include: {
          images: true,
        },
      },
      scent: true,
      order: {
        include: {
          user: true,
        },
      },
    },
  },
} as const;
