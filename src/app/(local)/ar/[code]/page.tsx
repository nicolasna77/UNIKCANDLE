"use client";

import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/components/loading";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, Volume2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ConfettiEmojiAuto } from "@/components/magicui/confettiEmojiauto";

// Dynamic imports pour les composants lourds (3D et Audio)
const Candle3D = dynamic(
  () => import("@/components/Candle3D").then((mod) => ({ default: mod.Candle3D })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    ),
  }
);

const AudioPlayer = dynamic(
  () => import("@/components/AudioPlayer").then((mod) => ({ default: mod.AudioPlayer })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Volume2 className="w-4 h-4 animate-pulse" />
        <span>Chargement du lecteur audio...</span>
      </div>
    ),
  }
);

interface QRData {
  product: {
    name: string;
    description: string;
    model3dUrl: string;
    category: {
      icon: string;
    };
  };
  scent: {
    name: string;
    description: string;
    color: string;
  };
  audioUrl: string;
  animationId: string;
}

export default function ARPage() {
  const { code } = useParams();
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);
  const [hasShownAutoPlayWarning, setHasShownAutoPlayWarning] = useState(false);

  const { data, isLoading, error } = useQuery<QRData>({
    queryKey: ["qr", code],
    queryFn: async () => {
      const response = await fetch(`/api/qr?code=${code}`);
      if (!response.ok) {
        throw new Error("QR code non trouvé");
      }
      return response.json();
    },
  });

  // Afficher un avertissement sur la lecture automatique
  useEffect(() => {
    if (autoPlayEnabled && !hasShownAutoPlayWarning) {
      toast.info("Lecture automatique activée", {
        description:
          "Note : Certains navigateurs peuvent bloquer la lecture automatique. Cliquez sur play si l'audio ne démarre pas.",
        duration: 5000,
      });
      setHasShownAutoPlayWarning(true);
    }
  }, [autoPlayEnabled, hasShownAutoPlayWarning]);

  if (isLoading) {
    return <Loading />;
  }

  if (error || !data) {
    return (
      <Card className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">
            {error instanceof Error ? error.message : "Données non trouvées"}
          </h1>
          <p className="text-muted-foreground">
            Veuillez scanner un QR code valide ou réessayer plus tard.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center ">
      {/* Fond animé */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
      >
        <div
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
          className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary/30 to-secondary/30 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
        />
      </div>
      <div className="absolute inset-0 bg-grid-black/[0.02] -z-10" />

      {/* Contenu principal */}
      <div className=" flex z-10 container mx-auto px-4 py-8 ">
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Côté gauche : Bougie 3D */}
          <div className="relative">
            <Candle3D />
            <ConfettiEmojiAuto icon={data?.product.category.icon || ""} />
          </div>

          {/* Côté droit : Animation et audio */}
          <div className="flex flex-col justify-center space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-foreground">
                {data.product.name}
              </h1>
              <p className="text-muted-foreground mt-2">
                {data.product.description}
              </p>

              {/* Information sur le parfum */}
              <div className="mt-4 p-4 rounded-lg bg-card border border-border">
                <h2 className="text-xl font-semibold text-foreground">
                  Parfum : {data.scent.name}
                </h2>
                <p className="text-muted-foreground mt-2">
                  {data.scent.description}
                </p>
              </div>
            </div>

            {/* Section audio */}
            {data.audioUrl && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mic className="w-6 h-6 text-primary" />
                  <h3 className="text-xl font-semibold text-foreground">
                    Message personnalisé
                  </h3>
                </div>

                {/* Lecteur audio avec lecture automatique */}
                <AudioPlayer
                  audioUrl={data.audioUrl}
                  autoPlay={autoPlayEnabled}
                  loop={false}
                  showControls={true}
                  className="w-full"
                />

                {/* Contrôles supplémentaires */}
                <div className="flex gap-3 flex-wrap">
                  <Button
                    onClick={() => setShowAudioPlayer(!showAudioPlayer)}
                    variant="outline"
                  >
                    <Volume2 className="w-4 h-4 mr-2" />
                    {showAudioPlayer ? "Masquer" : "Afficher"} les contrôles
                  </Button>

                  <Button
                    onClick={() => setAutoPlayEnabled(!autoPlayEnabled)}
                    variant={autoPlayEnabled ? "default" : "outline"}
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    {autoPlayEnabled
                      ? "Lecture auto activée"
                      : "Lecture auto désactivée"}
                  </Button>
                </div>

                {/* Message d'information */}
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                  <p className="text-primary-foreground text-sm">
                    💡{" "}
                    {autoPlayEnabled
                      ? "Le message se lance automatiquement. Utilisez les contrôles pour ajuster le volume ou relancer l&apos;audio."
                      : "La lecture automatique est désactivée. Cliquez sur play pour écouter le message."}
                  </p>
                </div>

                {/* Avertissement sur les restrictions de lecture automatique */}
                {autoPlayEnabled && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                        <strong>Note :</strong> Certains navigateurs bloquent la
                        lecture automatique. Si l&apos;audio ne démarre pas,
                        cliquez sur le bouton play ou désactivez la lecture
                        automatique.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Message si pas d'audio */}
            {!data.audioUrl && (
              <div className="bg-muted border border-border rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Mic className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <h3 className="text-foreground font-medium">
                      Aucun message enregistré
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Ce produit n&apos;a pas de message personnalisé associé.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
      >
        <div
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
          className="relative left-[calc(50%+3rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
        />
      </div>
    </div>
  );
}
