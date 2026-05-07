"use client";

import { Trash2, Mic, AudioWaveformIcon as Waveform, Upload, VoicemailIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useTranslations } from "next-intl";

interface AudioRecordProps {
  productId: string;
  onAudioChange?: (audioUrl: string | undefined) => void;
}

const AudioRecord = ({ productId, onAudioChange }: AudioRecordProps) => {
  const t = useTranslations("products.audioRecord");
  const [mode, setMode] = useState<"record" | "upload">("record");
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { updateItemAudio, removeItemAudio, cart } = useCart();

  const cartItem = cart.find((item) => item.id === productId);

  useEffect(() => {
    if (cartItem?.audioUrl) {
      setAudioUrl(cartItem.audioUrl);
      onAudioChange?.(cartItem.audioUrl);
    }
  }, [cartItem?.audioUrl, onAudioChange]);

  useEffect(() => {
    return () => {
      if (audioUrl?.startsWith("blob:")) URL.revokeObjectURL(audioUrl);
      if (timerRef.current) clearInterval(timerRef.current);
      audioRef.current?.pause();
    };
  }, [audioUrl]);

  const uploadAudio = async (blob: Blob, filename: string): Promise<string | null> => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", blob, filename);
      const response = await fetch("/api/upload/audio", { method: "POST", body: formData });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Upload échoué");
      }
      const data = await response.json();
      return data.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("uploadError"));
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const startRecording = async () => {
    try {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingTime(0);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        const url = await uploadAudio(blob, `audio-${Date.now()}.wav`);
        if (url) {
          setAudioUrl(url);
          updateItemAudio(productId, url);
          onAudioChange?.(url);
          toast.success(t("savedSuccess"), { description: t("savedDescription") });
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      timerRef.current = setInterval(() => setRecordingTime((s) => s + 1), 1000);
    } catch {
      toast.error("Impossible d'accéder au microphone", {
        description: "Vérifiez que vous avez autorisé l'accès au microphone.",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Fichier trop volumineux (max 10 Mo)");
      return;
    }
    if (!file.type.startsWith("audio/")) {
      toast.error("Seuls les fichiers audio sont acceptés");
      return;
    }

    const url = await uploadAudio(file, file.name);
    if (url) {
      setAudioUrl(url);
      updateItemAudio(productId, url);
      onAudioChange?.(url);
      toast.success("Audio importé", {
        description: "Votre message audio a bien été sauvegardé.",
      });
    }
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  const playRecording = () => {
    if (audioUrl && !isPlaying) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      setIsPlaying(true);
      audio.onended = () => { setIsPlaying(false); audioRef.current = null; };
      audio.onerror = () => { setIsPlaying(false); audioRef.current = null; };
      audio.play();
    } else if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      audioRef.current = null;
    }
  };

  const deleteRecording = () => {
    if (audioUrl?.startsWith("blob:")) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setRecordingTime(0);
    audioRef.current?.pause();
    audioRef.current = null;
    setIsPlaying(false);
    removeItemAudio(productId);
    onAudioChange?.(undefined);
    toast.success("Message supprimé");
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <Card className="transition-all duration-300 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              {t("title")}
              {isUploading && (
                <Badge variant="outline" className="ml-2">
                  <Upload className="w-3 h-3 mr-1 animate-spin" />
                  {t("uploading")}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>{t("description")}</CardDescription>
          </div>
          {audioUrl && (
            <Badge className="bg-green-500 shrink-0">✓ Enregistré</Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Tabs mode */}
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant={mode === "record" ? "default" : "outline"}
            onClick={() => setMode("record")}
            className="flex-1"
          >
            <Mic className="w-4 h-4 mr-2" />
            Enregistrer
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mode === "upload" ? "default" : "outline"}
            onClick={() => setMode("upload")}
            className="flex-1"
          >
            <Upload className="w-4 h-4 mr-2" />
            Importer
          </Button>
        </div>

        {/* Mode enregistrement */}
        {mode === "record" && (
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className={cn(
                  "h-24 w-24 rounded-full border-2 transition-all duration-300",
                  isRecording
                    ? "bg-red-500 text-white border-red-400 shadow-lg shadow-red-500/25 scale-105"
                    : "hover:bg-primary/10 hover:border-primary/50 hover:scale-105"
                )}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isUploading}
              >
                {isRecording && (
                  <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-20" />
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  {isRecording ? (
                    <div className="w-6 h-6 bg-white rounded-sm animate-pulse" />
                  ) : (
                    <Mic className="w-10 h-10 text-primary" />
                  )}
                </div>
              </Button>
              {isRecording && (
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full animate-pulse" />
              )}
            </div>

            <div className="text-center">
              <p className={cn("text-sm font-medium", isRecording ? "text-red-500" : "text-muted-foreground")}>
                {isRecording ? t("recordingInProgress") : t("pressToRecord")}
              </p>
              {isRecording && (
                <div className="inline-flex items-center gap-2 mt-1.5 bg-red-50 dark:bg-red-950/20 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-red-600 dark:text-red-400 font-mono text-sm font-semibold">
                    {formatTime(recordingTime)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mode import */}
        {mode === "upload" && (
          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/mp3,audio/mpeg,audio/wav,audio/ogg,audio/webm,audio/m4a,audio/x-m4a,.mp3,.wav,.ogg,.webm,.m4a"
              className="hidden"
              onChange={handleFileUpload}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className={cn(
                "w-full border-2 border-dashed rounded-xl p-10 flex flex-col items-center gap-3 transition-colors",
                "hover:border-primary/50 hover:bg-primary/5 cursor-pointer",
                isUploading && "opacity-50 cursor-not-allowed"
              )}
            >
              <Upload className="w-8 h-8 text-muted-foreground" />
              <div className="text-center">
                <p className="text-sm font-medium">Glissez ou cliquez pour importer</p>
                <p className="text-xs text-muted-foreground mt-1">
                  MP3, WAV, OGG, M4A, WebM — max 10 Mo
                </p>
              </div>
            </button>
          </div>
        )}

        {/* Aperçu */}
        {audioUrl && (
          <div className="space-y-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-xl border border-amber-200/50 dark:border-amber-800/50">
            <div className="flex items-center gap-2">
              <Waveform className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                Aperçu de votre message
              </span>
            </div>
            <div className="flex justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={cn(
                  "gap-2",
                  isPlaying && "bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
                )}
                onClick={playRecording}
              >
                <VoicemailIcon className="w-4 h-4" />
                {isPlaying ? t("playing") : t("listen")}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={deleteRecording}
              >
                <Trash2 className="w-4 h-4" />
                {t("delete")}
              </Button>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground">
          {t("recommendedDuration")}
        </p>
      </CardContent>
    </Card>
  );
};

export default AudioRecord;
