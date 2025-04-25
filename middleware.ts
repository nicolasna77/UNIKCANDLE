import { NextRequest, NextResponse } from "next/server";
import { auth } from "./src/lib/auth";
import { headers } from "next/headers";

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  console.log(session);

  // Si l'utilisateur n'est pas connecté, rediriger vers la page d'accueil
  if (!session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Si l'utilisateur essaie d'accéder à /admin et n'est pas admin
  if (
    request.nextUrl.pathname.startsWith("/admin") &&
    session.user.role !== "admin"
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  runtime: "nodejs",
  matcher: ["/admin/:path*", "/profil/:path*"],
};
