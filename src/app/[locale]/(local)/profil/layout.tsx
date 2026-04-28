import { redirect } from "next/navigation";
import ProfilMenu from "./profil-menu";
import { getUser } from "@/lib/auth-session";

const DashboardLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) => {
  const { locale } = await params;
  const session = await getUser();
  if (!session) {
    redirect(`/${locale}/auth/signin`);
  }
  return (
    <div>
      <ProfilMenu />
      <main className="container max-w-7xl m-auto min-h-[calc(100vh-(--spacing(16)))] py-12 px-4">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
