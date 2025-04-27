"use client";

import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] space-y-4">
      <ShieldAlert className="h-16 w-16 text-red-500" />
      <h1 className="text-2xl font-bold">Accès non autorisé</h1>
      <p className="text-muted-foreground text-center max-w-md">
        Vous n&apos;avez pas les permissions nécessaires pour accéder à cette
        page. Veuillez contacter un administrateur si vous pensez qu&apos;il
        s&apos;agit d&apos;une erreur.
      </p>
      <Button onClick={() => router.push("/")}>Retour à l&apos;accueil</Button>
    </div>
  );
}
