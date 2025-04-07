"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

const Error = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 text-destructive">
            <AlertCircle className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Oups ! Une erreur est survenue
            </h1>
            <p className="text-muted-foreground">
              Désolé, nous rencontrons quelques difficultés techniques. Veuillez
              réessayer plus tard ou retourner à l&apos;accueil.
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
    </div>
  );
};

export default Error;
