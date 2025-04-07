"use client";

import { useEffect, useRef, useState } from "react";

interface VideoProps {
  src: string;
  type: string;
  className?: string;
  captions?: string;
}

export function Video({ src, type, className, captions }: VideoProps) {
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [src]);

  const handleError = () => {
    setError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center bg-muted rounded-lg p-4">
        <p className="text-muted-foreground">Impossible de charger la vidéo</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
      <video
        ref={videoRef}
        className={className}
        controls
        preload="auto"
        onError={handleError}
        onLoadedData={handleLoad}
      >
        <source src={src} type={`video/${type}`} />
        {captions && (
          <track
            src={captions}
            kind="subtitles"
            srcLang="fr"
            label="Français"
          />
        )}
        Votre navigateur ne prend pas en charge la lecture de vidéo.
      </video>
    </div>
  );
}
