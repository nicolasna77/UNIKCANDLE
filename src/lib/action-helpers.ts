import "server-only";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Type de réponse standard pour les Server Actions
 * Discriminated union pour un meilleur type inference
 */
export type ActionResponse<T = unknown> =
  | { success: true; data?: T; error?: never; fieldErrors?: never }
  | { success: false; data?: never; error?: string; fieldErrors?: Record<string, string[]> };

/**
 * Résultat d'une vérification d'authentification
 */
type AuthCheckResult =
  | { success: true; userId: string; role: string | null }
  | { success: false; error: ActionResponse<never> };

/**
 * Vérifie l'authentification de l'utilisateur
 * @returns Le userId si authentifié, sinon une réponse d'erreur
 */
export async function requireAuth(): Promise<AuthCheckResult> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return {
      success: false,
      error: {
        success: false,
        error: "Non autorisé. Veuillez vous connecter.",
      },
    };
  }

  return {
    success: true,
    userId: session.user.id,
    role: session.user.role ?? null,
  };
}

/**
 * Vérifie l'authentification et le rôle admin
 * @returns Le userId si admin, sinon une réponse d'erreur
 */
export async function requireAdmin(): Promise<AuthCheckResult> {
  const authResult = await requireAuth();

  if (!authResult.success) {
    return authResult;
  }

  if (authResult.role !== "admin") {
    return {
      success: false,
      error: {
        success: false,
        error: "Accès refusé. Droits administrateur requis.",
      },
    };
  }

  return authResult;
}

/**
 * Wrapper pour exécuter une action avec gestion d'erreur standardisée
 */
export async function executeAction<T>(
  action: () => Promise<T>,
  errorMessage: string
): Promise<ActionResponse<T>> {
  try {
    const data = await action();
    return { success: true, data };
  } catch (error) {
    console.error(errorMessage, error);
    return { success: false, error: errorMessage };
  }
}

/**
 * Crée une réponse d'erreur de validation
 */
export function validationError<T = never>(
  fieldErrors: Record<string, string[]>,
  message = "Données invalides"
): ActionResponse<T> {
  return {
    success: false,
    error: message,
    fieldErrors,
  };
}

/**
 * Crée une réponse d'erreur simple
 */
export function errorResponse<T = never>(error: string): ActionResponse<T> {
  return { success: false, error };
}

/**
 * Crée une réponse de succès
 */
export function successResponse<T>(data?: T): ActionResponse<T> {
  return { success: true, data };
}
