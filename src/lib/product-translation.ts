import { Product, Category, Scent } from "@prisma/client";

/**
 * Récupère le texte traduit d'un produit selon la locale
 */
export function getProductTranslation<T extends Partial<Product>>(
  product: T,
  field: "name" | "description" | "subTitle" | "slogan",
  locale: string
): string {
  if (locale === "en") {
    const enField = `${field}EN` as keyof T;
    const enValue = product[enField];
    // Si la traduction EN existe et n'est pas vide, l'utiliser
    if (enValue && typeof enValue === "string" && enValue.trim() !== "") {
      return enValue;
    }
  }

  // Fallback sur la version FR
  return (product[field as keyof T] as string) || "";
}

/**
 * Récupère toutes les traductions d'un produit selon la locale
 */
export function getTranslatedProduct<T extends Partial<Product>>(
  product: T,
  locale: string
): {
  name: string;
  description: string;
  subTitle: string;
  slogan: string;
} {
  return {
    name: getProductTranslation(product, "name", locale),
    description: getProductTranslation(product, "description", locale),
    subTitle: getProductTranslation(product, "subTitle", locale),
    slogan: getProductTranslation(product, "slogan", locale),
  };
}

/**
 * Récupère le texte traduit d'une catégorie selon la locale
 */
export function getCategoryTranslation<T extends Partial<Category>>(
  category: T,
  field: "name" | "description",
  locale: string
): string {
  if (locale === "en") {
    const enField = `${field}EN` as keyof T;
    const enValue = category[enField];
    // Si la traduction EN existe et n'est pas vide, l'utiliser
    if (enValue && typeof enValue === "string" && enValue.trim() !== "") {
      return enValue;
    }
  }

  // Fallback sur la version FR
  return (category[field as keyof T] as string) || "";
}

/**
 * Récupère toutes les traductions d'une catégorie selon la locale
 */
export function getTranslatedCategory<T extends Partial<Category>>(
  category: T,
  locale: string
): {
  name: string;
  description: string;
} {
  return {
    name: getCategoryTranslation(category, "name", locale),
    description: getCategoryTranslation(category, "description", locale),
  };
}

/**
 * Récupère le texte traduit d'un scent selon la locale
 */
export function getScentTranslation<T extends Partial<Scent>>(
  scent: T,
  field: "name" | "description",
  locale: string
): string {
  if (locale === "en") {
    const enField = `${field}EN` as keyof T;
    const enValue = scent[enField];
    // Si la traduction EN existe et n'est pas vide, l'utiliser
    if (enValue && typeof enValue === "string" && enValue.trim() !== "") {
      return enValue;
    }
  }

  // Fallback sur la version FR
  return (scent[field as keyof T] as string) || "";
}

/**
 * Récupère toutes les traductions d'un scent selon la locale
 */
export function getTranslatedScent<T extends Partial<Scent>>(
  scent: T,
  locale: string
): {
  name: string;
  description: string;
} {
  return {
    name: getScentTranslation(scent, "name", locale),
    description: getScentTranslation(scent, "description", locale),
  };
}
