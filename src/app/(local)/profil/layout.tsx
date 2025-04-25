import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import ProfilMenu from "./profil-menu";
import { Button } from "@/components/ui/button";
import Link from "next/link";
const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return (
      <div className="mt-16 flex flex-col min-h-[calc(100vh_-_theme(spacing.16))] items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Vous n&apos;êtes pas connecté</h1>
        <p className="text-sm text-muted-foreground">
          Veuillez vous connecter pour accéder à votre profil
        </p>
        <div className="flex gap-4">
          <Button>
            <Link href="/auth/signin">Se connecter</Link>
          </Button>
          <Button variant="outline">
            <Link href="/auth/signup">Créer un compte</Link>
          </Button>
        </div>
      </div>
    );
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
