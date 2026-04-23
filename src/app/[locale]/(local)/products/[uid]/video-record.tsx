"use client";

import { useRef, useState, useEffect } from "react";
import {
  Camera,
  Square,
  Trash2,
  Upload,
  Video,
  Play,
  Pause,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

interface VideoRecordProps {
  productId: string;
  onVideoChange?: (videoUrl: string | undefined) => void;
}

// Sélection du meilleur codec disponible (VP9 > VP8 > H264)
function getSupportedMimeType(): string {
  const types = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
    "video/mp4",
  ];
  return types.find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
}

const VideoRecord = ({ productId, onVideoChange }: VideoRecordProps) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [mode, setMode] = useState<"record" | "upload">("record");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const liveVideoRef = useRef<HTMLVideoElement>(null);
  const previewRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { updateItemVideo, removeItemVideo, cart } = useCart();
  const cartItem = cart.find((item) => item.id === productId);

  useEffect(() => {
    if (cartItem?.videoUrl) {
      setVideoUrl(cartItem.videoUrl);
      onVideoChange?.(cartItem.videoUrl);
    }
  }, [cartItem?.videoUrl, onVideoChange]);

  // Nettoyage à la destruction du composant
  useEffect(() => {
    return () => {
      stopStream();
      if (timerRef.current) clearInterval(timerRef.current);
      if (videoUrl?.startsWith("blob:")) URL.revokeObjectURL(videoUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const uploadVideo = async (blob: Blob): Promise<string | null> => {
    try {
      setIsUploading(true);
      const ext = blob.type.includes("mp4") ? "mp4" : "webm";
      const formData = new FormData();
      formData.append("file", blob, `video-${Date.now()}.${ext}`);

      const res = await fetch("/api/upload/video", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload échoué");
      const data = await res.json();
      return data.url as string;
    } catch {
      toast.error("Erreur lors de l'envoi de la vidéo");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const startRecording = async () => {
    if (!isEnabled) return;
    try {
      // 720p max — bon équilibre qualité/taille
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } },
        audio: true,
      });
      streamRef.current = stream;

      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = stream;
        liveVideoRef.current.muted = true;
        liveVideoRef.current.play();
      }

      const mimeType = getSupportedMimeType();
      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 2_500_000, // 2.5 Mbps — qualité excellente sans gaspillage
        audioBitsPerSecond: 128_000,
      });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stopStream();
        const blob = new Blob(chunksRef.current, {
          type: mimeType || "video/webm",
        });
        const localUrl = URL.createObjectURL(blob);
        setVideoUrl(localUrl);

        const url = await uploadVideo(blob);
        if (url) {
          if (videoUrl?.startsWith("blob:")) URL.revokeObjectURL(videoUrl);
          setVideoUrl(url);
          updateItemVideo(productId, url);
          onVideoChange?.(url);
          toast.success("Vidéo enregistrée", {
            description: "Votre message vidéo a bien été sauvegardé.",
          });
        }
      };

      recorder.start(500); // chunk toutes les 500ms
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
    } catch {
      toast.error("Impossible d'accéder à la caméra", {
        description: "Vérifiez que vous avez autorisé l'accès à la caméra et au microphone.",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 200 * 1024 * 1024) {
      toast.error("Fichier trop volumineux (max 200 Mo)");
      return;
    }
    if (!file.type.startsWith("video/")) {
      toast.error("Seuls les fichiers vidéo sont acceptés");
      return;
    }

    const url = await uploadVideo(file);
    if (url) {
      if (videoUrl?.startsWith("blob:")) URL.revokeObjectURL(videoUrl);
      setVideoUrl(url);
      updateItemVideo(productId, url);
      onVideoChange?.(url);
      toast.success("Vidéo importée", {
        description: "Votre vidéo a bien été sauvegardée.",
      });
    }
  };

  const deleteVideo = () => {
    if (videoUrl?.startsWith("blob:")) URL.revokeObjectURL(videoUrl);
    setVideoUrl(null);
    removeItemVideo(productId);
    onVideoChange?.(undefined);
    toast.success("Vidéo supprimée");
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    return `${m}:${(s % 60).toString().padStart(2, "0")}`;
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
              <Video className="h-5 w-5" />
              Message vidéo
              {videoUrl && (
                <Badge variant="default" className="ml-2 bg-green-500">
                  Enregistrée
                </Badge>
              )}
              {isUploading && (
                <Badge variant="outline" className="ml-2">
                  <Upload className="w-3 h-3 mr-1 animate-spin" />
                  Envoi…
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Enregistrez ou importez un message vidéo pour personnaliser votre bougie.
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
              onCheckedChange={(v) => {
                setIsEnabled(v);
                if (!v && isRecording) stopRecording();
              }}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent
        className={cn(
          "transition-all duration-300 space-y-6",
          !isEnabled && "opacity-50 pointer-events-none"
        )}
      >
        {/* Tabs mode */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={mode === "record" ? "default" : "outline"}
            onClick={() => setMode("record")}
            className="flex-1"
          >
            <Camera className="w-4 h-4 mr-2" />
            Enregistrer
          </Button>
          <Button
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
          <div className="space-y-4">
            {/* Preview live */}
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
              <video
                ref={liveVideoRef}
                muted
                playsInline
                className={cn(
                  "w-full h-full object-cover",
                  !isRecording && "opacity-0"
                )}
              />
              {!isRecording && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Camera className="w-12 h-12 text-muted-foreground/40" />
                </div>
              )}
              {isRecording && (
                <div className="absolute top-3 right-3 flex items-center gap-2 bg-black/60 rounded-full px-3 py-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-white text-xs font-mono">
                    {formatTime(recordingTime)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-center">
              <Button
                size="lg"
                variant={isRecording ? "destructive" : "default"}
                className={cn(
                  "rounded-full h-16 w-16 transition-all duration-300",
                  isRecording && "scale-110"
                )}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isUploading}
              >
                {isRecording ? (
                  <Square className="w-6 h-6 fill-white" />
                ) : (
                  <Camera className="w-6 h-6" />
                )}
              </Button>
            </div>
            <p className="text-center text-xs text-muted-foreground">
              {isRecording ? "Cliquez pour arrêter" : "Cliquez pour démarrer l'enregistrement"}
            </p>
          </div>
        )}

        {/* Mode import */}
        {mode === "upload" && (
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
              className="hidden"
              onChange={handleFileUpload}
            />
            <button
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
                  MP4, WebM, MOV — max 200 Mo
                </p>
              </div>
            </button>
          </div>
        )}

        {/* Prévisualisation de la vidéo enregistrée/importée */}
        {videoUrl && (
          <div className="space-y-3 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-xl border border-green-200/50 dark:border-green-800/50">
            <p className="text-sm font-medium text-green-700 dark:text-green-300 text-center">
              Aperçu de votre message
            </p>
            <div className="relative rounded-lg overflow-hidden bg-black aspect-video">
              <video
                ref={previewRef}
                src={videoUrl}
                className="w-full h-full object-contain"
                playsInline
                onPlay={() => setIsPreviewPlaying(true)}
                onPause={() => setIsPreviewPlaying(false)}
                onEnded={() => setIsPreviewPlaying(false)}
              />
              {!isPreviewPlaying && (
                <button
                  onClick={() => previewRef.current?.play()}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 hover:bg-white/30 transition-colors">
                    <Play className="w-6 h-6 text-white fill-white" />
                  </div>
                </button>
              )}
              {isPreviewPlaying && (
                <button
                  onClick={() => previewRef.current?.pause()}
                  className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                >
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                    <Pause className="w-6 h-6 text-white fill-white" />
                  </div>
                </button>
              )}
            </div>
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300"
                onClick={deleteVideo}
              >
                <Trash2 className="w-4 h-4" />
                Supprimer la vidéo
              </Button>
            </div>
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground">
          Vidéo enregistrée en haute qualité (720p, codec VP9).
          Durée recommandée : 15–60 secondes.
        </p>
      </CardContent>
    </Card>
  );
};

export default VideoRecord;
