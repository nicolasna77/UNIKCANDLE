"use client";

import { Button } from "@/components/ui/button";
import { ShieldAlert, Home } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-[calc(100vh)] flex items-center justify-center p-4 bg-gradient-to-br from-background via-cream to-background">
      <Card className="w-full max-w-md shadow-lg border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="mx-auto w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
            <ShieldAlert className="h-10 w-10 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold text-card-foreground">
            Accès non autorisé
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center space-y-3">
            <p className="text-muted-foreground leading-relaxed">
              Vous n&apos;avez pas les permissions nécessaires pour accéder à
              cette page. Veuillez contacter un administrateur si vous pensez
              qu&apos;il s&apos;agit d&apos;une erreur.
            </p>
            <div className="w-16 h-1 bg-primary/20 rounded-full mx-auto"></div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => router.push("/")}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Home className="h-4 w-4 mr-2" />
              Accueil
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
