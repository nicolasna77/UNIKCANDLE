import type { Metadata } from "next";
import { Lora, Montserrat } from "next/font/google";
import "./globals.css";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "@/components/ui/sonner";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

const geistMono = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://unikcandle.com"),
  title: {
    default: "UNIKCANDLE - Bougies personnalisées et écologiques",
    template: "%s | UNIKCANDLE",
  },
  description:
    "Découvrez UNIKCANDLE, des bougies uniques et personnalisables, alliant émotion, élégance et engagement écologique. Créez votre bougie unique à partir de bouteilles recyclées.",
  keywords: [
    "bougies",
    "personnalisation",
    "écologie",
    "recyclage",
    "décoration",
    "maison",
    "artisanal",
    "français",
    "bougies personnalisées",
    "bougies écologiques",
    "bougies recyclées",
    "bougies artisanales",
    "bougies françaises",
    "bougies uniques",
    "bougies personnalisables",
  ],
  authors: [{ name: "UNIKCANDLE" }],
  creator: "UNIKCANDLE",
  publisher: "UNIKCANDLE",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://unikcandle.com",
    title: "UNIKCANDLE - Bougies personnalisées et écologiques",
    description:
      "Découvrez UNIKCANDLE, des bougies uniques et personnalisables, alliant émotion, élégance et engagement écologique.",
    siteName: "UNIKCANDLE",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth w-full">
      <Analytics />
      <body className={`${lora.variable} ${geistMono.variable} antialiased`}>
        <Header />
        {children}
        <Toaster />
        <Footer />
      </body>
    </html>
  );
}
