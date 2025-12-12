import { headers } from "next/headers";
import { unauthorized } from "next/navigation";
import { auth } from "./auth";
import { NextResponse } from "next/server";

export const getUser = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user;
};

export const getRequiredUser = async () => {
  const user = await getUser();
  if (!user) {
    unauthorized();
  }
  return user;
};

/**
 * Get the current user and verify they have admin role
 * @throws unauthorized() if user is not authenticated or not an admin
 */
export const getRequiredAdmin = async () => {
  const user = await getUser();
  if (!user) {
    unauthorized();
  }
  if (user.role !== "admin") {
    throw new Error("Forbidden: Admin access required");
  }
  return user;
};

/**
 * API route helper to verify admin access
 * Returns an error response if user is not authenticated or not an admin
 * Use this at the start of admin API routes
 */
export const verifyAdminAccess = async (): Promise<NextResponse | null> => {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 }
      );
    }

    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Accès interdit : droits administrateur requis" },
        { status: 403 }
      );
    }

    return null; // Access granted
  } catch {
    return NextResponse.json(
      { error: "Erreur lors de la vérification des permissions" },
      { status: 500 }
    );
  }
};
