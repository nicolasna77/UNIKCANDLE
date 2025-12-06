import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import UnauthorizedPage from "@/app/unauthorized";

// Force dynamic rendering for all admin pages
export const dynamic = 'force-dynamic';

export default async function PrivateLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.role || session.user.role !== "admin") {
      return <UnauthorizedPage />;
    }

    return <>{children}</>;
  } catch (error) {
    console.error("Error checking admin permission:", error);
    redirect(`/${locale}/auth/signin`);
  }
}
