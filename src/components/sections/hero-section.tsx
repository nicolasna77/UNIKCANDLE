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
    <section className="bg-primary-foreground py-16 md:py-24 lg:py-32 mx-auto">
      {/* Background decorative elements */}
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 space-y-reverse gap-4 md:items-center">
          {/* Text content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col items-center text-center lg:items-start lg:text-left"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={isLoaded ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className={`${lora.className} text-5xl sm:text-6xl md:text-7xl font-medium text-secondary-foreground mb-6 tracking-tight`}
            >
              UNIKCANDLE
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isLoaded ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="max-w-xl lg:max-w-md mx-auto lg:mx-0"
            >
              <p className="text-xl sm:text-2xl text-secondary-foreground mb-4 font-light">
                La bougie qui parle, qui éclaire, qui émeut.
              </p>
              <p className="text-base sm:text-lg text-secondary-foreground/80 mb-8">
                Une bougie, un message, une émotion. Découvrez la première
                bougie qui porte vos mots et illumine vos souvenirs.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isLoaded ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="w-full sm:w-auto"
            >
              <Button size="lg">
                Je m&apos;inscris pour être informé du lancement
              </Button>
            </motion.div>
          </motion.div>

          {/* 3D Candle */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isLoaded ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative flex justify-center items-center w-full h-[450px]"
          >
            <div className="relative w-[450px] h-[450px]">
              <Candle3D />
            </div>
          </motion.div>
        </div>{" "}
      </div>
    </section>
  );
};

export default HeroSection;
