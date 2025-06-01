"use client";
import {
  Trash2,
  MicIcon,
  VoicemailIcon,
  AudioWaveformIcon as Waveform,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const AudioRecord = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fonction pour démarrer l'enregistrement
  const startRecording = async () => {
    if (!isEnabled) return;

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
        toast.success("Message enregistré avec succès !", {
          description: "Vous pouvez maintenant l'écouter ou le supprimer",
        });
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Démarrer le timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      toast.error("Erreur lors de l'accès au microphone", {
        description: "Vérifiez que vous avez autorisé l'accès au microphone",
      });
      console.error("Erreur d'enregistrement:", error);
    }
  };

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
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [audioUrl]);

  // Fonction pour tester l'enregistrement
  const playRecording = () => {
    if (audioUrl && !isPlaying) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      setIsPlaying(true);

      audio.onended = () => {
        setIsPlaying(false);
        audioRef.current = null;
      };

      audio.onerror = () => {
        setIsPlaying(false);
        audioRef.current = null;
        toast.error("Erreur lors de la lecture");
      };

      audio.play();
    } else if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      audioRef.current = null;
    }
  };

  // Fonction pour supprimer l'enregistrement
  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
      setRecordingTime(0);
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
        audioRef.current = null;
      }
      toast.success("Message supprimé");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card
      className={cn(
        "transition-all duration-300 border-2",
        isEnabled
          ? "border-primary/20 bg-gradient-to-br from-primary/5 to-transparent"
          : "border-border bg-muted/30"
      )}
    >
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <MicIcon className="h-5 w-5" />
              Message personnalisé
              {audioUrl && (
                <Badge variant="secondary" className="ml-2">
                  Enregistré
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Enregistrez un message qui sera lu à l&apos;allumage de la bougie
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-sm font-medium transition-colors",
                isEnabled ? "text-primary" : "text-muted-foreground"
              )}
            >
              {isEnabled ? "Activé" : "Désactivé"}
            </span>
            <Switch
              checked={isEnabled}
              onCheckedChange={setIsEnabled}
              className="data-[state=checked]:bg-primary"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent
        className={cn(
          "transition-all duration-300",
          !isEnabled && "opacity-50 pointer-events-none"
        )}
      >
        <div className="space-y-8">
          {/* Bouton d'enregistrement principal */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "h-28 w-28 rounded-full relative group transition-all duration-500 border-2",
                  isRecording
                    ? "bg-red-500 text-white border-red-400 shadow-lg shadow-red-500/25 scale-105"
                    : "hover:bg-primary/10 hover:border-primary/50 hover:scale-105",
                  !isEnabled && "cursor-not-allowed"
                )}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={!isEnabled}
              >
                {/* Effet de pulsation pendant l'enregistrement */}
                {isRecording && (
                  <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-20" />
                )}

                <div className="absolute inset-0 flex items-center justify-center">
                  {isRecording ? (
                    <div className="w-6 h-6 bg-white rounded-sm animate-pulse" />
                  ) : (
                    <MicIcon className="w-12 h-12 text-primary group-hover:scale-110 transition-transform duration-300" />
                  )}
                </div>
              </Button>

              {/* Indicateur visuel d'enregistrement */}
              {isRecording && (
                <div className="absolute -top-2 -right-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse" />
                </div>
              )}
            </div>

            <div className="text-center space-y-2">
              <p
                className={cn(
                  "text-sm font-medium transition-colors",
                  isRecording ? "text-red-500" : "text-muted-foreground"
                )}
              >
                {isRecording
                  ? "Enregistrement en cours..."
                  : "Appuyez pour enregistrer"}
              </p>

              {/* Timer d'enregistrement */}
              {isRecording && (
                <div className="flex items-center justify-center gap-2 bg-red-50 dark:bg-red-950/20 px-4 py-2 rounded-full">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-red-600 dark:text-red-400 font-mono font-semibold">
                    {formatTime(recordingTime)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Section de lecture et contrôles */}
          {audioUrl && (
            <div className="space-y-4 p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-xl border border-green-200/50 dark:border-green-800/50">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Waveform className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  Message enregistré avec succès
                </span>
              </div>

              <div className="flex justify-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "gap-2 transition-all duration-200",
                    isPlaying
                      ? "bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
                      : "hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                  )}
                  onClick={playRecording}
                  disabled={!audioUrl}
                >
                  <VoicemailIcon className="w-4 h-4" />
                  {isPlaying ? "En lecture..." : "Écouter"}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                  onClick={deleteRecording}
                  disabled={!audioUrl}
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </Button>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="text-center space-y-2 p-4 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              💡 <strong>Conseil :</strong> Parlez clairement et proche du
              microphone
            </p>
            <p className="text-xs text-muted-foreground">
              Durée recommandée : 10-30 secondes
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AudioRecord;
