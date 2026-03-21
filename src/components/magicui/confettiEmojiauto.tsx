"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

export function ConfettiEmojiAuto({ icon }: { icon: string }) {
  useEffect(() => {
    const scalar = 4;
    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    // shapeFromText requires OffscreenCanvas (iOS 17+, Chrome 69+)
    // Fall back to circle confetti on older browsers
    let emojiShape: ReturnType<typeof confetti.shapeFromText> | null = null;
    try {
      emojiShape = confetti.shapeFromText({ text: icon, scalar });
    } catch {
      // OffscreenCanvas not supported (e.g. iOS 15 / iPhone 7)
    }

    const defaults = {
      spread: 360,
      ticks: 80,
      gravity: 0.9,
      decay: 0.95,
      startVelocity: 15,
      shapes: emojiShape ? [emojiShape] : (["circle"] as confetti.Shape[]),
      scalar: emojiShape ? scalar : 1,
    };

    const shoot = () => {
      confetti({
        ...defaults,
        particleCount: 30,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });

      confetti({
        ...defaults,
        particleCount: 5,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });

      confetti({
        particleCount: 15,
        spread: 360,
        ticks: 80,
        gravity: 0.9,
        decay: 0.95,
        startVelocity: 15,
        scalar: scalar / 2,
        shapes: ["circle"] as confetti.Shape[],
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    };

    // Lancer en boucle toutes les 800ms
    const interval = setInterval(shoot, 800);
    // Lancer une fois au début
    shoot();

    return () => clearInterval(interval);
  }, [icon]);

  return null; // Pas de bouton, effet auto
}
