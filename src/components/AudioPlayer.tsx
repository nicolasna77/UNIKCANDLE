"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
          .catch(() => {
            // Lecture automatique bloquée par le navigateur
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
      audioRef.current.play().catch(() => {
        // Erreur lors de la lecture
      });
    }
  };

  const handleSeek = (value: number[]) => {
    if (!audioRef.current) return;
    const time = value[0];
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (value: number[]) => {
    if (!audioRef.current) return;
    const newVolume = value[0];
    setVolume(newVolume);
    audioRef.current.volume = newVolume;
    setIsMuted(newVolume === 0);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
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
      audioRef.current.play().catch(() => {
        // Erreur lors de la lecture
      });
    }
  };

  return (
    <Card className={`p-4 ${className}`}>
      <audio ref={audioRef} src={audioUrl} loop={loop} preload="metadata" />

      <div className="space-y-4">
        {/* Contrôles principaux */}
        <div className="flex items-center gap-4">
          <Button
            onClick={togglePlay}
            size="icon"
            className="h-10 w-10 shrink-0"
            variant="default"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>

          <div className="flex-1 space-y-2">
            <Slider
              value={[currentTime]}
              min={0}
              max={duration || 100}
              step={0.1}
              onValueChange={handleSeek}
              className="cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>

        {/* Contrôles avancés */}
        {showControls && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Contrôle du volume */}
            <div className="flex items-center gap-3 min-w-[180px]">
              <Button
                onClick={toggleMute}
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              <Slider
                value={[isMuted ? 0 : volume]}
                min={0}
                max={1}
                step={0.1}
                onValueChange={handleVolumeChange}
                className="flex-1 cursor-pointer"
              />
            </div>

            {/* Bouton restart */}
            <Button
              onClick={restart}
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>

            {/* Indicateurs */}
            <div className="flex gap-2 flex-wrap ml-auto">
              {autoPlay && (
                <Badge variant="secondary" className="text-xs">
                  Auto-play
                </Badge>
              )}
              {loop && (
                <Badge variant="secondary" className="text-xs">
                  Loop
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
