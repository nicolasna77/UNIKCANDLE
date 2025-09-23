import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const authRoutes = ["/auth/signin", "/auth/signup"];
const passwordRoutes = [
  "/reset-password",
  "/forgot-password",
  "/auth/forgot-password",
];
const publicRoutes = [
  "/",
  "/products",
  "/about",
  "/contact",
  "/unauthorized",
  "/cgu",
  "/cart",
];
const staticRoutes = ["/asset", "/models", "/logo", "/images"];

export async function middleware(request: NextRequest) {
  const pathName = request.nextUrl.pathname;
  const isAuthRoute = authRoutes.includes(pathName);
  const isPasswordRoute = passwordRoutes.includes(pathName);
  const isPublicRoute =
    publicRoutes.includes(pathName) || pathName.startsWith("/products/");
  const isStaticRoute = staticRoutes.some((route) =>
    pathName.startsWith(route)
  );
  const isApiRoute = pathName.startsWith("/api/");

  // Si c'est une route publique, statique, API, d'authentification ou de mot de passe, pas besoin de vérifier la session
  if (
    isPublicRoute ||
    isStaticRoute ||
    isAuthRoute ||
    isPasswordRoute ||
    isApiRoute
  ) {
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

    if (pathName.startsWith("/admin") && session.user.role !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Middleware auth error:", error);

    if (pathName.startsWith("/auth/")) {
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
