"use client";

import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/components/loading";
import { Card } from "@/components/ui/card";
import { Video, AlertCircle } from "lucide-react";
import { ConfettiEmojiAuto } from "@/components/magicui/confettiEmojiauto";
import Image from "next/image";

const VideoPlayer = dynamic(
  () => import("@/components/VideoPlayer").then((mod) => ({ default: mod.VideoPlayer })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Video className="w-4 h-4 animate-pulse" />
        <span>Chargement du lecteur vidéo…</span>
      </div>
    ),
  }
);

interface QRData {
  product: {
    name: string;
    description: string;
    category: { icon: string };
    images: { id: string; url: string }[];
  };
  scent: { name: string; description: string; color: string };
  videoUrl: string | null;
  audioUrl: string | null;
  animationId: string;
}

export default function ARPage() {
  const { code } = useParams();

  const { data, isLoading, error } = useQuery<QRData>({
    queryKey: ["qr", code],
    queryFn: async () => {
      const response = await fetch(`/api/qr?code=${code}`);
      if (!response.ok) throw new Error("QR code non trouvé");
      return response.json();
    },
  });

  if (isLoading) return <Loading />;

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

  const hasMedia = data.videoUrl || data.audioUrl;

  return (
    <div className="relative min-h-screen flex items-center justify-center">
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
      <div className="flex z-10 container mx-auto px-4 py-8">
        <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 w-full items-center">
          {/* Image du produit */}
          <div className="relative flex items-center justify-center">
            {data?.product.images?.[0]?.url ? (
              <div className="relative w-full max-w-md aspect-square bg-card/30 backdrop-blur-sm rounded-3xl p-4 border border-border/50 shadow-2xl">
                <div className="relative w-full h-full">
                  <Image
                    src={data.product.images[0].url}
                    alt={data.product.name}
                    fill
                    className="object-contain rounded-2xl"
                    priority
                  />
                </div>
              </div>
            ) : (
              <div className="w-full max-w-md aspect-square bg-card/30 backdrop-blur-sm border border-border/50 rounded-3xl flex items-center justify-center shadow-2xl">
                <span className="text-muted-foreground text-sm">
                  Aucune image disponible
                </span>
              </div>
            )}
            <ConfettiEmojiAuto icon={data?.product.category.icon || ""} />
          </div>

          {/* Message vidéo / audio / vide */}
          <div className="flex flex-col justify-center space-y-6">
            {data.videoUrl && (
              <div className="space-y-4 bg-card/50 backdrop-blur-sm rounded-2xl p-6 border border-border/50 shadow-lg">
                <div className="flex items-center gap-3 pb-2 border-b border-border/50">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Video className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground">
                    Message personnalisé
                  </h3>
                </div>

                <VideoPlayer
                  videoUrl={data.videoUrl}
                  autoPlay={false}
                  loop={false}
                  className="w-full rounded-xl"
                />

                <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
                  <p className="text-primary-foreground text-xs sm:text-sm leading-relaxed">
                    💡 Appuyez sur play pour regarder le message qui vous a été laissé.
                  </p>
                </div>
              </div>
            )}

            {/* Fallback audio si pas de vidéo */}
            {!data.videoUrl && data.audioUrl && (
              <div className="space-y-4 bg-card/50 backdrop-blur-sm rounded-2xl p-6 border border-border/50 shadow-lg">
                <div className="flex items-center gap-3 pb-2 border-b border-border/50">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Video className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground">
                    Message audio
                  </h3>
                </div>
                <audio controls src={data.audioUrl} className="w-full" />
              </div>
            )}

            {/* Avertissement navigateur si nécessaire */}
            {hasMedia && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <p className="text-yellow-700 dark:text-yellow-300 text-xs sm:text-sm leading-relaxed">
                    <strong>Note :</strong> Si la lecture ne démarre pas, vérifiez que
                    votre navigateur autorise la lecture des médias.
                  </p>
                </div>
              </div>
            )}

            {/* Aucun message */}
            {!hasMedia && (
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-muted/50">
                    <Video className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-foreground font-semibold text-base sm:text-lg">
                      Aucun message enregistré
                    </h3>
                    <p className="text-muted-foreground text-xs sm:text-sm mt-1">
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
