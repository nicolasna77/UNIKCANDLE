"use client";

import { useParams } from "next/navigation";
import { Candle3D } from "@/components/Candle3D";
import { BirdAnimation } from "@/components/BirdAnimation";
import { AudioPlayer } from "@/components/AudioPlayer";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/components/loading";
import { Card } from "@/components/ui/card";

interface QRData {
  product: {
    name: string;
    description: string;
    model3dUrl: string;
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

  if (isLoading) {
    return <Loading />;
  }

  if (error || !data) {
    return (
      <Card className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">
            {error instanceof Error ? error.message : "Données non trouvées"}
          </h1>
          <p className="text-gray-600">
            Veuillez scanner un QR code valide ou réessayer plus tard.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="relative min-h-screen bg-black">
      {/* Fond animé */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900 to-black opacity-50"></div>

      {/* Contenu principal */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Côté gauche : Bougie 3D */}
          <div className="h-[80vh]">
            {data.product.model3dUrl ? (
              <Candle3D
                selectedScent={{
                  id: data.scent.name,
                  name: data.scent.name,
                  description: data.scent.description,
                  icon: "/logo/candleGlass.glb",
                  color: data.scent.color,
                  model3dUrl: "/logo/candleGlass.glb",
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-white">Modèle 3D non disponible</p>
              </div>
            )}
          </div>

          {/* Côté droit : Animation et audio */}
          <div className="flex flex-col justify-center space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white">
                {data.product.name}
              </h1>
              <p className="text-gray-300 mt-2">{data.product.description}</p>

              {/* Information sur le parfum */}
              <div
                className="mt-4 p-4 rounded-lg"
                style={{ backgroundColor: data.scent.color + "20" }}
              >
                <h2 className="text-xl font-semibold text-white">
                  Parfum : {data.scent.name}
                </h2>
                <p className="text-gray-300 mt-2">{data.scent.description}</p>
              </div>
            </div>

            {/* Animation de l'oiseau */}
            <div className="h-64">
              <BirdAnimation />
            </div>

            {/* Lecteur audio */}
            {data.audioUrl && (
              <div className="mt-8">
                <AudioPlayer audioUrl={data.audioUrl} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
