import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const authRoutes = ["/auth/signin", "/auth/signup"];
const passwordRoutes = ["/reset-password", "/forgot-password"];
const publicRoutes = ["/", "/products", "/about", "/contact", "/unauthorized"];

export async function middleware(request: NextRequest) {
  const pathName = request.nextUrl.pathname;
  const isAuthRoute = authRoutes.includes(pathName);
  const isPasswordRoute = passwordRoutes.includes(pathName);
  const isPublicRoute =
    publicRoutes.includes(pathName) || pathName.startsWith("/products/");

  // Si c'est une route publique, d'authentification ou de mot de passe, pas besoin de vérifier la session
  if (isPublicRoute || isAuthRoute || isPasswordRoute) {
    return NextResponse.next();
  }

  try {
    // Vérifier la session avec Better Auth
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    // Si pas de session valide, rediriger vers la connexion
    if (!session) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }

    // Si l'utilisateur est connecté et tente d'accéder aux routes d'auth
    if (isAuthRoute || isPasswordRoute) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Vérification des permissions admin pour les routes admin
    if (pathName.startsWith("/admin") && session.user.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    // En cas d'erreur, rediriger vers la connexion
    console.error("Middleware auth error:", error);
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }
}

export const config = {
  runtime: "nodejs",
  matcher: [
    "/admin/:path*",
    "/auth/:path*",
    "/reset-password",
    "/profile/:path*",
    "/forgot-password",
    "/((?!api|_next|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
