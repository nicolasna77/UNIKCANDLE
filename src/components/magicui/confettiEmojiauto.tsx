"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

export function ConfettiEmojiAuto({ icon }: { icon: string }) {
  useEffect(() => {
    const scalar = 4;
    const unicorn = confetti.shapeFromText({ text: icon, scalar });
    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    const defaults = {
      spread: 360,
      ticks: 80,
      gravity: 0.9,
      decay: 0.95, // plus lent
      startVelocity: 15, // plus lent
      shapes: [unicorn],
      scalar,
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
        ...defaults,
        particleCount: 15,
        scalar: scalar / 2,
        shapes: ["circle"],
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    };

    // Lancer en boucle toutes les 800ms
    const interval = setInterval(shoot, 800);
    // Lancer une fois au début
    shoot();

    return () => clearInterval(interval);
  }, []);

  return null; // Pas de bouton, effet auto
}
