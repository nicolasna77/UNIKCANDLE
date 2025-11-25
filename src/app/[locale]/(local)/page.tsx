import HeroSection from "@/components/sections/heroSection";
import TestimonialSection from "@/components/sections/testimonial-section";
import NewsletterSection from "@/components/sections/newsletter";
import AboutSection from "@/components/sections/AboutSection";
import CategoriesSection from "@/components/sections/CategoriesSection";
import ConceptSection from "@/components/sections/ConceptSection";
import WhyChooseSection from "@/components/sections/WhyChooseSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accueil - Bougies personnalisées avec messages audio",
  description:
    "Découvrez UNIKCANDLE : des bougies uniques avec messages audio cachés dans la cire. Personnalisez votre bougie avec votre voix, choisissez votre parfum et créez une expérience émotionnelle inoubliable. Fabriquées en France avec des matériaux recyclés.",
  keywords: [
    "bougie personnalisée message audio",
    "bougie avec QR code",
    "cadeau unique",
    "bougie émotionnelle",
    "message caché bougie",
    "bougie recyclée",
    "cadeau personnalisé France",
  ],
  openGraph: {
    title: "UNIKCANDLE - Bougies avec messages audio cachés",
    description:
      "Créez une expérience unique : des bougies personnalisées qui révèlent votre message audio en fondant. Écologiques et fabriquées en France.",
    images: [
      {
        url: "/og-home.png",
        width: 1200,
        height: 630,
        alt: "Bougie UNIKCANDLE avec message audio",
      },
    ],
  },
};

export default function Home() {
  return (
    <main className="bg-primary-background">
      <HeroSection />
      <CategoriesSection />
      <ConceptSection />
      <AboutSection />
      <WhyChooseSection />
      <TestimonialSection />
      <NewsletterSection />
    </main>
  );
}
