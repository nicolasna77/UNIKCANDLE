"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AudioPlayerProps {
  audioUrl: string;
  autoPlay?: boolean; // Lecture automatique
  loop?: boolean; // Lecture en boucle
  showControls?: boolean; // Afficher les contrôles avancés
  className?: string;
}

export function AudioPlayer({
  audioUrl,
  autoPlay = false,
  loop = false,
  showControls = true,
  className = "",
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      // Lecture automatique après chargement si activée
      if (autoPlay && !hasAutoPlayed) {
        audio
          .play()
          .then(() => {
            setIsPlaying(true);
            setHasAutoPlayed(true);
          })
          .catch((error) => {
            console.log(
              "Lecture automatique bloquée par le navigateur:",
              error
            );
          });
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (loop) {
        audio.currentTime = 0;
        audio.play().then(() => setIsPlaying(true));
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, [autoPlay, hasAutoPlayed, loop]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((error) => {
        console.error("Erreur lors de la lecture:", error);
      });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const time = parseFloat(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    audioRef.current.volume = newVolume;
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const restart = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    if (!isPlaying) {
      audioRef.current.play().catch((error) => {
        console.error("Erreur lors de la lecture:", error);
      });
    }
  };

  return (
    <div
      className={`bg-card/50 rounded-lg p-4 backdrop-blur-sm border ${className}`}
    >
      <audio ref={audioRef} src={audioUrl} loop={loop} preload="metadata" />

      <div className="space-y-4">
        {/* Contrôles principaux */}
        <div className="flex items-center gap-4">
          <Button
            onClick={togglePlay}
            variant="ghost"
            size="sm"
            className="p-3 rounded-full bg-primary/20 hover:bg-primary/30 transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-primary-foreground" />
            ) : (
              <Play className="w-6 h-6 text-primary-foreground" />
            )}
          </Button>

          <div className="flex-1">
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Contrôles avancés */}
        {showControls && (
          <div className="flex items-center gap-4">
            {/* Contrôle du volume */}
            <div className="flex items-center gap-2">
              <Button
                onClick={toggleMute}
                variant="ghost"
                size="sm"
                className="p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Volume2 className="w-4 h-4 text-muted-foreground" />
                )}
              </Button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-muted rounded-full appearance-none cursor-pointer"
              />
            </div>

            {/* Bouton restart */}
            <Button
              onClick={restart}
              variant="ghost"
              size="sm"
              className="p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-muted-foreground" />
            </Button>

            {/* Indicateurs */}
            <div className="flex gap-2">
              {autoPlay && (
                <span className="text-xs bg-primary/20 text-primary-foreground px-2 py-1 rounded">
                  Auto-play
                </span>
              )}
              {loop && (
                <span className="text-xs bg-secondary/20 text-secondary-foreground px-2 py-1 rounded">
                  Loop
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
