/**
 * Service API pour les parfums/senteurs
 * Contient uniquement les appels API (fetch)
 * Les mutations doivent utiliser les Server Actions dans app/actions/scents.ts
 */

import { Scent } from "@prisma/client";

/**
 * Récupère tous les parfums
 */
export async function fetchScents(): Promise<Scent[]> {
  const response = await fetch("/api/admin/scents");

  if (!response.ok) {
    throw new Error("Erreur lors de la récupération des parfums");
  }

  return response.json();
}

/**
 * Récupère un parfum par ID
 */
export async function fetchScentById(id: string): Promise<Scent> {
  const response = await fetch(`/api/admin/scents/${id}`);

  if (!response.ok) {
    throw new Error("Parfum introuvable");
  }

  return response.json();
}
