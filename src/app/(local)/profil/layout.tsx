import UnauthorizedPage from "@/app/unauthorized";
import ProfilMenu from "./profil-menu";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    return <UnauthorizedPage />;
  }
  return (
    <div className="mt-16">
      <ProfilMenu />
      <main className="container m-auto min-h-[calc(100vh_-_theme(spacing.16))] py-12 px-4">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
