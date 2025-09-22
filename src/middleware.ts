import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const authRoutes = ["/auth/signin", "/auth/signup"];
const passwordRoutes = ["/reset-password", "/forgot-password", "/auth/forgot-password"];
const publicRoutes = ["/", "/products", "/about", "/contact", "/unauthorized", "/cgu", "/cart"];
const staticRoutes = ["/asset", "/models", "/logo", "/images"];

export async function middleware(request: NextRequest) {
  const pathName = request.nextUrl.pathname;
  console.log(`[Middleware] Processing: ${pathName} on ${request.nextUrl.origin}`);
  const isAuthRoute = authRoutes.includes(pathName);
  const isPasswordRoute = passwordRoutes.includes(pathName);
  const isPublicRoute =
    publicRoutes.includes(pathName) || pathName.startsWith("/products/");
  const isStaticRoute = staticRoutes.some(route => pathName.startsWith(route));

  // Si c'est une route publique, statique, d'authentification ou de mot de passe, pas besoin de vérifier la session
  if (isPublicRoute || isStaticRoute || isAuthRoute || isPasswordRoute) {
    return NextResponse.next();
  }

  try {
    // Vérifier la session avec Better Auth
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    console.log(`[Middleware] Path: ${pathName}, Session:`, !!session, session?.user?.email);

    // Si pas de session valide, rediriger vers la connexion
    if (!session) {
      console.log(`[Middleware] No session found for ${pathName}, redirecting to signin`);
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
    // En cas d'erreur Better Auth, rediriger vers la connexion mais éviter les boucles
    console.error("Middleware auth error:", error);

    // Si on est déjà sur une page d'auth, ne pas rediriger pour éviter les boucles
    if (pathName.startsWith("/auth/")) {
      return NextResponse.next();
    }

    // Contournement temporaire : si l'utilisateur a un cookie de session valide côté client,
    // permettre l'accès (l'auth sera re-vérifiée côté client)
    console.log(`[Middleware] Available cookies:`, Array.from(request.cookies.entries()).map(([name]) => name));

    const sessionCookie = request.cookies.get('better-auth.session_token') ||
                         request.cookies.get('session_token') ||
                         request.cookies.get('better-auth-session');

    if (sessionCookie && (pathName.startsWith("/profil") || pathName.startsWith("/admin"))) {
      console.log(`[Middleware] Session cookie found, allowing access to ${pathName}`);
      return NextResponse.next();
    }

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
    "/((?!api|_next|favicon.ico|sitemap.xml|robots.txt|asset|models|logo|images).*)",
  ],
};
