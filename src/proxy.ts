import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { auth } from "@/lib/auth";

// Create the i18n middleware
const intlMiddleware = createMiddleware(routing);

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
  "/ar",
  "/cart",
];
const staticRoutes = [
  "/asset",
  "/models",
  "/logo",
  "/images",
  "/payment-method",
];

export async function proxy(request: NextRequest) {
  const response = intlMiddleware(request);

  const pathName = request.nextUrl.pathname;

  const localeRegex = /^\/(?:fr|en)(?=\/|$)/;
  const pathnameWithoutLocale = pathName.replace(localeRegex, "") || "/";

  const isAuthRoute = authRoutes.includes(pathnameWithoutLocale);
  const isPasswordRoute = passwordRoutes.includes(pathnameWithoutLocale);
  const isPublicRoute =
    publicRoutes.includes(pathnameWithoutLocale) ||
    pathnameWithoutLocale.startsWith("/products/") ||
    pathnameWithoutLocale.startsWith("/ar/");
  const isStaticRoute = staticRoutes.some((route) =>
    pathName.startsWith(route)
  );
  const isApiRoute = pathName.startsWith("/api/");

  if (
    isPublicRoute ||
    isStaticRoute ||
    isAuthRoute ||
    isPasswordRoute ||
    isApiRoute
  ) {
    return response;
  }

  try {
    // Vérifier la session avec Better Auth
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      const locale = pathName.match(localeRegex)?.[0] || "/fr";
      return NextResponse.redirect(
        new URL(`${locale}/auth/signin`, request.url)
      );
    }

    if (
      pathnameWithoutLocale.startsWith("/admin") &&
      session.user.role !== "admin"
    ) {
      const locale = pathName.match(localeRegex)?.[0] || "/fr";
      return NextResponse.redirect(
        new URL(`${locale}/unauthorized`, request.url)
      );
    }

    return response;
  } catch (error) {
    console.error("Middleware auth error:", error);

    if (pathnameWithoutLocale.startsWith("/auth/")) {
      return response;
    }

    const locale = pathName.match(localeRegex)?.[0] || "/fr";
    return NextResponse.redirect(new URL(`${locale}/auth/signin`, request.url));
  }
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/auth/:path*",
    "/reset-password",
    "/profile/:path*",
    "/profil/:path*",
    "/forgot-password",
    "/((?!api|_next|favicon.ico|sitemap.xml|robots.txt|asset|models|logo|images|payment-method).*)",
  ],
};
