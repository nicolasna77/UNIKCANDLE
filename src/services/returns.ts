/**
 * Service API pour les retours
 * Contient uniquement les appels API (fetch) pour les requêtes GET
 * Les mutations doivent utiliser les Server Actions dans app/actions/returns.ts
 */

import { Return, OrderItem, Product, Image, Scent, Order, User } from "@prisma/client";

export interface ReturnItemWithDetails extends Return {
  orderItem: OrderItem & {
    product: Product & {
      images: Image[];
    };
    scent: Scent;
    order: Order & {
      user?: Pick<User, "name" | "email"> | null;
    };
  };
}

/**
 * Récupère les retours d'un utilisateur
 */
export async function fetchReturns(orderItemId?: string): Promise<ReturnItemWithDetails[]> {
  const params = new URLSearchParams();
  if (orderItemId) {
    params.append("orderItemId", orderItemId);
  }

  const response = await fetch(`/api/returns?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Erreur lors de la récupération des retours");
  }

  return response.json();
}

/**
 * Récupère toutes les demandes de retour (admin)
 */
export async function fetchAdminReturns(): Promise<ReturnItemWithDetails[]> {
  const response = await fetch("/api/admin/returns");

  if (!response.ok) {
    throw new Error("Erreur lors de la récupération des retours");
  }

  return response.json();
}
