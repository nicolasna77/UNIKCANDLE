"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Lora } from "next/font/google";
import { buttonVariants } from "../ui/button";
import Link from "next/link";
import { Candle3D } from "../Candle3D";

const lora = Lora({
  subsets: ["latin"],
});

const HeroSection = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <section className="relative isolate min-h-[100vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-grid-black/[0.02] -z-10" />
      <div className="container mx-auto px-2 sm:px-4 py-12 sm:py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 max-w-7xl mx-auto gap-8 lg:gap-12 items-center">
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
              className={`${lora.className}  scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-4`}
            >
              <span className="">UNIKCANDLE</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isLoaded ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <p className="text-xl text-muted-foreground mb-8">
                Bougies personnalisées et écologiques
                <br />
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
                href="/products"
              >
                Découvrez nos produits
              </Link>
              <Link
                className={buttonVariants({ variant: "secondary", size: "lg" })}
                href="/about"
              >
                Qui sommes-nous ?
              </Link>
            </motion.div>
          </motion.div>

          <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg aspect-square rounded-xl mx-auto">
            <Candle3D />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
