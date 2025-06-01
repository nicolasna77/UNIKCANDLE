import UnauthorizedPage from "@/app/unauthorized";
import ProfilMenu from "./profil-menu";
import { getUser } from "@/lib/auth-session";

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getUser();
  if (!session) {
    return <UnauthorizedPage />;
  }
  return (
    <div className="mt-16">
      <ProfilMenu />
      <main className="container max-w-7xl m-auto min-h-[calc(100vh_-_theme(spacing.16))] py-12 px-4">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
