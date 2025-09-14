import { NextRequest, NextResponse } from "next/server";

const authRoutes = ["/auth/signin", "/auth/signup"];
const passwordRoutes = ["/reset-password", "/forgot-password"];
const publicRoutes = ["/", "/products", "/about", "/contact", "/unauthorized"];

export async function middleware(request: NextRequest) {
  const pathName = request.nextUrl.pathname;
  const isAuthRoute = authRoutes.includes(pathName);
  const isPasswordRoute = passwordRoutes.includes(pathName);
  const isPublicRoute =
    publicRoutes.includes(pathName) || pathName.startsWith("/products/");

  const sessionCookie = request.cookies.get("better-auth.session_token");

  if (!sessionCookie) {
    if (isAuthRoute || isPasswordRoute || isPublicRoute) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  if (isAuthRoute || isPasswordRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  runtime: "nodejs",
  matcher: [
    "/admin/:path*",
    "/auth/:path*",
    "/reset-password",
    "/forgot-password",
    "/((?!api|_next|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
