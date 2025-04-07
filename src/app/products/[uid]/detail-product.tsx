"use client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState, useEffect, useRef } from "react";
import { Candle3D } from "@/components/Candle3D";
import {
  ShoppingBag,
  Star,
  VoicemailIcon,
  MicIcon,
  Trash2,
} from "lucide-react";
import ReviewProduct from "./review-product";
import { Scent, ProductVariant } from "./types";
import { useProduct } from "@/hooks/useProducts";
import LoadingPage from "../loading";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

const DetailProduct = ({ productId }: { productId: string }) => {
  const { data: product, isLoading, error } = useProduct(productId);
  const [selectedScent, setSelectedScent] = useState<Scent | null>(null);
  const { addToCart } = useCart();

  // États pour l'enregistrement vocal
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (product && product.variants.length > 0) {
      setSelectedScent(product.variants[0].scent);
    }
  }, [product]);

  // Fonction pour démarrer l'enregistrement
  const startRecording = async () => {
    try {
      // Réinitialiser le timer avant de commencer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setRecordingTime(0);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        toast.success("Message enregistré avec succès !");
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Démarrer le timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      toast.error("Erreur lors de l'accès au microphone");
      console.error("Erreur d'enregistrement:", error);
    }
  };

  // Fonction pour arrêter l'enregistrement
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      setIsRecording(false);

      // Arrêter et réinitialiser le timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setRecordingTime(0);
    }
  };

  // Fonction pour tester l'enregistrement
  const playRecording = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  // Fonction pour supprimer l'enregistrement
  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
      setRecordingTime(0);
      toast.success("Message supprimé");
    }
  };

  // Nettoyage des ressources
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [audioUrl]);

  if (isLoading) {
    return <LoadingPage />;
  }

  if (error || !product) {
    return (
      <div className="flex justify-center p-8 text-red-500">
        Erreur lors du chargement du produit
      </div>
    );
  }

  if (!selectedScent) {
    return (
      <div className="flex justify-center p-8">Chargement des options...</div>
    );
  }

  return (
    <section className="bg-white md:py-8 dark:bg-gray-900 antialiased">
      <div className="max-w-screen-xl  mx-auto ">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8 xl:gap-16">
          <div className="w-full h-[500px] bg-gradient-to-b rounded-t-lg from-gray-300">
            <Candle3D selectedScent={selectedScent} />
          </div>

          <div className="mt-6 sm:mt-8 lg:mt-0">
            <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">
              {product.name}
            </h1>
            <div className="mt-4 sm:items-center sm:gap-4 sm:flex">
              <p className="text-2xl font-extrabold text-gray-900 sm:text-3xl dark:text-white">
                {product.price.toFixed(2)} €
              </p>

              <div className="flex items-center gap-2 mt-2 sm:mt-0">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <p className="text-sm font-medium leading-none text-gray-500 dark:text-gray-400">
                    ({product.averageRating?.toFixed(1) || "0.0"})
                  </p>
                </div>
                <a
                  href="#reviews"
                  className="text-sm font-medium leading-none text-gray-900 underline dark:text-white"
                >
                  {product.reviewCount || 0} Avis
                </a>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Choisissez votre senteur
                </h3>
                <RadioGroup
                  value={selectedScent.id}
                  onValueChange={(value) => {
                    const variant = product.variants.find(
                      (v: ProductVariant) => v.scent.id === value
                    );
                    if (variant) {
                      setSelectedScent(variant.scent);
                    }
                  }}
                  className="mt-2 grid grid-cols-2 gap-2"
                >
                  {product.variants.map((variant: ProductVariant) => (
                    <div key={variant.scent.id}>
                      <RadioGroupItem
                        value={variant.scent.id}
                        id={variant.scent.id}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={variant.scent.id}
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all duration-200"
                      >
                        <span className="text-2xl mb-2">
                          {variant.scent.icon}
                        </span>
                        <span className="font-medium">
                          {variant.scent.name}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 text-center">
                          {variant.scent.description}
                        </span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Message personnalisé
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Enregistrez un message qui sera lu à l&apos;allumage de la
                  bougie
                </p>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-center">
                    <div className="relative">
                      <Button
                        variant="outline"
                        size="icon"
                        className={`h-20 w-20 rounded-full relative group ${
                          isRecording
                            ? "bg-red-500 text-white"
                            : "hover:bg-primary/10"
                        }`}
                        onClick={isRecording ? stopRecording : startRecording}
                      >
                        <div className="absolute inset-0 flex items-center justify-center">
                          {isRecording ? (
                            <div className="w-4 h-4 bg-white rounded-full animate-pulse" />
                          ) : (
                            <MicIcon className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
                          )}
                        </div>
                      </Button>
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                        <span className="text-xs text-muted-foreground">
                          {isRecording
                            ? "Enregistrement en cours..."
                            : "Appuyez pour enregistrer"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {recordingTime > 0 && (
                    <div className="text-center text-sm text-muted-foreground">
                      Durée: {Math.floor(recordingTime / 60)}:
                      {(recordingTime % 60).toString().padStart(2, "0")}
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground"
                      onClick={playRecording}
                      disabled={!audioUrl}
                    >
                      <VoicemailIcon className="w-4 h-4 mr-2" />
                      Tester le son
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground"
                      onClick={deleteRecording}
                      disabled={!audioUrl}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 sm:gap-4 sm:items-center sm:flex sm:mt-8">
              <Button
                onClick={() => {
                  const productWithScent = {
                    ...product,
                    selectedScent: selectedScent,
                  };
                  addToCart(productWithScent);
                }}
                variant="default"
                size="lg"
                className="flex w-full items-center gap-2"
              >
                <ShoppingBag className="w-5 h-5" />
                Ajouter au panier
              </Button>
            </div>

            <Separator className="my-6 md:my-8" />
            {product.description}
          </div>
        </div>

        {/* Section des avis */}
        <ReviewProduct product={product} />
      </div>
    </section>
  );
};

export default DetailProduct;
