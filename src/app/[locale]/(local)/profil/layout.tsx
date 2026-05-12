import ProfilMenu from "./profil-menu";
import { getUser } from "@/lib/auth-session";
import prisma from "@/lib/prisma";

const DashboardLayout = async ({
  children,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) => {
  // Auth is already enforced by the proxy — no redirect needed here
  const session = await getUser();

  const affiliate = session
    ? await prisma.affiliate.findUnique({
        where: { userId: session.id },
        select: { id: true },
      })
    : null;

  return (
    <div>
      <ProfilMenu isAffiliate={!!affiliate} />
      <main className="container max-w-7xl m-auto min-h-[calc(100vh-(--spacing(16)))] py-12 px-4">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
