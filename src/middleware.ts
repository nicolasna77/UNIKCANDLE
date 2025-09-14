import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
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
  const isAdminRoute = pathName.startsWith("/admin");

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    if (isAuthRoute || isPasswordRoute || isPublicRoute) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  // Pour les routes admin, vérifier les permissions
  if (isAdminRoute) {
    if (!session.user?.role || session.user.role !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  if (isAuthRoute || isPasswordRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  runtime: "nodejs",
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg|.*\\.ico|.*\\.webp).*)",
  ],
};
