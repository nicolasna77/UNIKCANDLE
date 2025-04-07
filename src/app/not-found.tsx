"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted">
      <div className="max-w-md w-full mx-auto p-6 text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-9xl font-extrabold text-primary">404</h1>
          <h2 className="text-3xl font-bold tracking-tight">
            Page non trouvée
          </h2>
          <p className="text-muted-foreground">
            Désolé, nous n&apos;avons pas trouvé la page que vous recherchez.
            Retournez à l&apos;accueil pour découvrir nos produits.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="outline">
            <Link href="/">Retour à l&apos;accueil</Link>
          </Button>
          <Button asChild>
            <Link href="/products">Voir nos produits</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
