"use client";

import type React from "react";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

interface Step {
  number: number;
  title: string;
  description: string;
  emoji: string;
}

const steps: Step[] = [
  {
    number: 1,
    title: "Choisissez votre parfum préféré",
    description:
      "Sélectionnez parmi nos fragrances uniques et personnalisez l'ambiance de votre bougie",
    emoji: "🌸",
  },
  {
    number: 2,
    title: "Enregistrez votre message audio",
    description:
      "Capturez vos émotions en enregistrant un message personnel qui sera révélé à la fin",
    emoji: "🎙️",
  },
  {
    number: 3,
    title: "Scannez et découvrez la magie AR",
    description:
      "Une fois la bougie consumée, scannez le QR code pour révéler votre message en réalité augmentée",
    emoji: "🔮",
  },
];

export default function AboutSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  // Parallax pour les éléments décoratifs
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 50]);

  return (
    <section
      ref={sectionRef}
      className="py-24 px-4 bg-secondary/30 relative overflow-hidden"
    >
      {/* Décorations */}
      <motion.div
        className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl"
        style={{ y: y1 }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"
        style={{ y: y2 }}
      />

      <div className="container mx-auto flex flex-col gap-y-16 relative z-10">
        <div className="text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-foreground tracking-tight">
            Comment ça marche ?
          </h2>
          <p className="text-xl sm:text-2xl lg:text-3xl font-medium text-primary/80 max-w-2xl mx-auto">
            Allumez la magie de vos souvenirs
          </p>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mx-auto">
          {/* Liste des étapes */}
          <div className="space-y-6 w-full max-w-lg">
            {steps.map((step, index) => (
              <Card
                key={step.number}
                className="group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 bg-gradient-to-br from-card/90 to-primary/5 backdrop-blur-sm hover:from-card hover:to-primary/10"
              >
                {/* Effet de flamme au survol */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/10 group-hover:via-primary/5 group-hover:to-primary/10 transition-all duration-500"></div>

                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      {/* Cercle avec effet de bougie */}
                      <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-gradient-to-br from-primary via-primary to-primary/80 flex items-center justify-center shadow-lg group-hover:shadow-primary/30 group-hover:scale-110 transition-all duration-300 relative overflow-hidden">
                        <span className="text-primary-foreground text-2xl sm:text-3xl font-bold relative z-10">
                          {step.number}
                        </span>
                        {/* Effet de lueur intérieure */}
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent rounded-full"></div>
                      </div>

                      {/* Ligne de connexion avec effet de cire */}
                      {index < steps.length - 1 && (
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-1 h-12 bg-gradient-to-b from-primary/40 via-primary/30 to-transparent"></div>
                      )}
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg sm:text-xl font-semibold text-card-foreground group-hover:text-primary transition-colors duration-300">
                          {step.title}
                        </h3>
                        <div className="text-3xl sm:text-4xl transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                          {step.emoji}
                        </div>
                      </div>

                      {/* Description de l'étape */}
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>

                      {/* Barre de progression avec effet de flamme */}
                      <div className="w-full bg-muted/50 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary via-primary to-primary/80 w-0 group-hover:w-full transition-all duration-700 ease-out shadow-sm"></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Image centrale */}
          <div className="w-full max-w-lg">
            <div className="relative  overflow-hidden rounded-2xl ">
              <video
                src="/asset/copy_4447286A-9868-4AB4-8560-658743442719.mp4"
                autoPlay
                loop
                muted
                width={600}
                height={800}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
