"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Lora } from "next/font/google";
import { Button } from "../ui/button";

const lora = Lora({
  subsets: ["latin"],
});

const HeroSection = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <section className="relative overflow-hidden bg-background">
      <div className="relative max-h-screen lg:py-0 mx-auto">
        <div className="max-h-screen py-24 mx-auto px-4 ">
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 items-center">
            {/* Text content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isLoaded ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col items-center  text-center lg:items-center lg:text-left space-y-6 w-full"
            >
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={isLoaded ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6 }}
                className={`${lora.className} text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium text-primary tracking-tight`}
              >
                UNIKCANDLE
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isLoaded ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="max-w-xl lg:max-w-md mx-auto lg:mx-0 space-y-4"
              >
                <p className="text-lg sm:text-xl md:text-2xl text-secondary-foreground font-light">
                  Découvrez la première bougie qui parle avec votre voix.
                </p>
                <p className="text-sm sm:text-base md:text-lg text-secondary-foreground/80">
                  Une bougie, un message, une émotion.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isLoaded ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="w-full sm:w-auto"
              >
                <Button size="lg" variant="default">
                  Je m&apos;inscris pour être informé du lancement
                </Button>
              </motion.div>
            </motion.div>

            {/* 3D Candle */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isLoaded ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="w-full max-h-screen flex items-center justify-center"
            >
              <video
                className="w-full h-full object-cover"
                width={400}
                height={400}
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
      </div>
    </section>
  );
};

export default HeroSection;
