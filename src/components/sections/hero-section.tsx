"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Montserrat } from "next/font/google";
import { buttonVariants } from "../ui/button";
import Link from "next/link";
import { Candle3D } from "../Candle3D";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["800"],
});

const HeroSection = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <section className="relative bg-background py-16 isolate min-h-[100vh] flex items-center justify-center overflow-hidden">
      {/* Arrière-plan sophistiqué */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background/50 -z-20" />
      <div className="absolute inset-0 bg-grid-black/[0.02] -z-10" />

      {/* Éléments décoratifs flottants */}

      <div className="container mx-auto px-2 sm:px-4 py-12 sm:py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 max-w-7xl mx-auto gap-8 lg:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center lg:text-left space-y-8 relative"
          >
            {/* Badge élégant */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={isLoaded ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-6"
            >
              <div className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse" />
              Nouvelle collection disponible
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={isLoaded ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.3 }}
              className={`${montserrat.className} scroll-m-20 text-5xl  font-extrabold tracking-tight mb-6 relative`}
            >
              <span className=" ">UNIKCANDLE</span>
              <motion.div
                initial={{ width: 0 }}
                animate={isLoaded ? { width: "100%" } : {}}
                transition={{ duration: 1, delay: 1.2 }}
                className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-primary to-primary/30 rounded-full"
              />
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isLoaded ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="space-y-4"
            >
              <p className="text-2xl lg:text-3xl font-semibold text-foreground leading-relaxed">
                Bougies d&apos;exception. Émotions sur-mesure.
              </p>
              <p className="text-xl text-foreground font-medium leading-relaxed max-w-md mx-auto lg:mx-0">
                Les seules bougies parfumées qui parlent avec ta voix.
              </p>
              <p className="text-lg text-muted-foreground max-w-md mx-auto balance-text lg:mx-0 leading-relaxed">
                Un moment à vivre. Une attention à écouter. Un cadeau surprenant.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isLoaded ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  className={`${buttonVariants({ variant: "default", size: "lg" })} relative overflow-hidden group shadow-lg hover:shadow-xl transition-all duration-300`}
                  href="/products"
                >
                  <span className="relative z-10">
                    {" "}
                    Explorez notre collection
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  className={`${buttonVariants({ variant: "outline", size: "lg" })} `}
                  href="/about"
                >
                  L’univers UNIKCANDLE
                </Link>
              </motion.div>
            </motion.div>

            {/* Statistiques élégantes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isLoaded ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="flex flex-wrap gap-8 justify-center lg:justify-start pt-8 text-center lg:text-left"
            >
              <div className="space-y-1">
                <div className="text-2xl font-bold text-primary">1000+</div>
                <div className="text-sm text-muted-foreground">
                  Créations sur-mesure
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">
                  Clients privilégiés
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-primary">100%</div>
                <div className="text-sm text-muted-foreground">exclusif</div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isLoaded ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 1, delay: 0.4 }}
            className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg aspect-square mx-auto"
          >
            {/* Halo lumineux autour de la bougie */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-full blur-3xl scale-150 animate-pulse" />

            {/* Container de la bougie 3D */}
            <div className="relative w-full h-full overflow-hidden ">
              <Candle3D />

              {/* Reflet élégant */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-2xl" />
            </div>

            {/* Particules flottantes */}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
