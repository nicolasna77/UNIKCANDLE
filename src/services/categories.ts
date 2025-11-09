/**
 * Service API pour les catégories
 * Contient uniquement les appels API (fetch)
 * Les mutations doivent utiliser les Server Actions dans app/actions/categories.ts
 */

import { Category, Product } from "@prisma/client";

export interface CategoryWithProducts extends Category {
  products: Product[];
  _count?: {
    products: number;
  };
}

/**
 * Récupère toutes les catégories avec leurs produits
 */
export async function fetchCategories(): Promise<CategoryWithProducts[]> {
  const response = await fetch("/api/categories");

  if (!response.ok) {
    throw new Error("Erreur lors de la récupération des catégories");
  }

  return response.json();
}

/**
 * Récupère une catégorie par ID
 */
export async function fetchCategoryById(id: string): Promise<Category> {
  const response = await fetch(`/api/categories/${id}`);

  if (!response.ok) {
    throw new Error("Catégorie introuvable");
  }

  return response.json();
}
