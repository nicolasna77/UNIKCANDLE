"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Candle3D } from "@/components/Candle3D";
import { Lora } from "next/font/google";

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
      <div className="relative py-12 sm:py-16 md:py-24 lg:py-32 mx-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 md:items-center">
            {/* Text content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isLoaded ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col items-center text-center lg:items-start lg:text-left space-y-6"
            >
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={isLoaded ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6 }}
                className={`${lora.className} text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium text-secondary-foreground tracking-tight`}
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
                <Button
                  size="lg"
                  className="w-full sm:w-auto"
                  variant="default"
                >
                  Je m&apos;inscris pour être informé du lancement
                </Button>
              </motion.div>
            </motion.div>

            {/* 3D Candle */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isLoaded ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative flex justify-center items-center w-full h-[300px] sm:h-[350px] md:h-[400px] lg:h-[450px]"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[300px] h-[300px] sm:w-[350px] sm:h-[350px] md:w-[400px] md:h-[400px] lg:w-[450px] lg:h-[450px]">
                  <Candle3D />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
