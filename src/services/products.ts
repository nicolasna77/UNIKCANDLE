/**
 * Service API pour les produits
 * Contient uniquement les appels API (fetch)
 * Les mutations doivent utiliser les Server Actions dans app/actions/products.ts
 */

import { Product, Category, Scent, Image, Review } from "@prisma/client";

export interface ProductWithDetails extends Omit<Product, 'messageType'> {
  messageType: "audio" | "text";
  category: Category;
  scent: Scent;
  images: Image[];
  reviews: Review[];
  averageRating: number;
  reviewCount: number;
}

export interface PaginatedProducts {
  products: ProductWithDetails[];
  pagination: {
    total: number;
    pages: number;
    page: number;
    limit: number;
  };
}

export interface FetchProductsParams {
  page?: number;
  categoryId?: string;
  sortBy?: string;
  sortOrder?: string;
}

/**
 * Récupère les produits avec pagination
 */
export async function fetchProducts(
  params: FetchProductsParams = {}
): Promise<PaginatedProducts> {
  const { page = 1, categoryId, sortBy, sortOrder } = params;

  const searchParams = new URLSearchParams({
    page: page.toString(),
    limit: "12",
    ...(categoryId && { categoryId }),
    ...(sortBy && { sortBy }),
    ...(sortOrder && { sortOrder }),
  });

  const response = await fetch(`/api/products?${searchParams.toString()}`);

  if (!response.ok) {
    throw new Error("Erreur lors de la récupération des produits");
  }

  return response.json();
}

/**
 * Récupère un produit par ID
 */
export async function fetchProductById(
  productId: string
): Promise<ProductWithDetails> {
  const response = await fetch(`/api/products/${productId}`, {
    cache: "no-store",
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error("Produit introuvable");
  }

  const data = await response.json();

  // Vérification des données requises
  if (!data.category || !data.scent || !data.images) {
    throw new Error("Données du produit incomplètes");
  }

  return data;
}

/**
 * Récupère tous les produits pour l'admin
 */
export async function fetchAdminProducts(): Promise<ProductWithDetails[]> {
  const response = await fetch("/api/admin/products");

  if (!response.ok) {
    throw new Error("Erreur lors de la récupération des produits");
  }

  return response.json();
}
