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
        <div className="absolute inset-0 bg-muted rounded-lg animate-pulse">
          <div className="h-full w-full flex items-center justify-center">
            <div className="w-16 h-16 bg-muted-foreground/20 rounded-full"></div>
          </div>
        </div>
      )}
      <video
        ref={videoRef}
        className={`${className} max-h-[700px] max-w-[600px] sm:max-w-[600px] lg:max-w-none mx-auto`}
        controls={false}
        autoPlay={true}
        muted={true}
        loop={true}
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
