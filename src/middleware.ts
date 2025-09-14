import { NextResponse, type NextRequest } from "next/server";

const authRoutes = ["/auth/signin", "/auth/signup"];
const passwordRoutes = ["/reset-password", "/forgot-password"];
const publicRoutes = ["/", "/products", "/about", "/contact", "/unauthorized"];

export default async function authMiddleware(request: NextRequest) {
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
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(png|jpg|jpeg|gif|svg|ico|webp)).*)"
  ],
};
