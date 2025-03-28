"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Lora } from "next/font/google";
import { buttonVariants } from "../ui/button";
import Link from "next/link";

const lora = Lora({
  subsets: ["latin"],
});

const HeroSection = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      <div className="absolute inset-0 bg-grid-black/[0.02] -z-10" />
      <div className="container mx-auto px-4 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center lg:text-left space-y-8"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={isLoaded ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className={`${lora.className} text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground tracking-tight`}
            >
              <span className="text-primary">UNIKCANDLE</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isLoaded ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="space-y-4"
            >
              <p className="text-xl sm:text-2xl text-muted-foreground">
                Découvrez la première bougie qui parle avec votre voix.
              </p>
              <p className="text-lg text-muted-foreground/80">
                Une bougie, un message, une émotion.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isLoaded ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link
                className={buttonVariants({ variant: "default", size: "lg" })}
                href="#newsletter"
              >
                Je m&apos;inscris pour le lancement
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isLoaded ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative aspect-square rounded-xl overflow-hidden shadow-2xl"
          >
            <video
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            >
              <source
                src="./asset/copy_4447286A-9868-4AB4-8560-658743442719.mp4"
                type="video/mp4"
              />
              Votre navigateur ne supporte pas la lecture de vidéos.
            </video>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
