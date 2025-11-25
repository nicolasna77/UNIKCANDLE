import "./globals.css";
import type { Metadata } from "next";
import { Lora, Montserrat } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "@/components/ui/sonner";
import QueryProvider from "@/providers/query-provider";
import { CartProvider } from "@/context/CartContext";
import {
  StructuredData,
  getOrganizationSchema,
  getWebsiteSchema,
} from "@/lib/structured-data";

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
    "Découvrez UNIKCANDLE, des bougies uniques et personnalisables avec messages audio intégrés. Alliant émotion, élégance et engagement écologique. Créez votre bougie unique à partir de bouteilles recyclées.",
  keywords: [
    "bougies personnalisées",
    "bougies écologiques",
    "bougies avec message audio",
    "bougies recyclées",
    "bougies artisanales",
    "bougies françaises",
    "bougies uniques",
    "cadeau personnalisé",
    "décoration maison",
    "bougie parfumée",
    "bougie artisanale",
    "QR code bougie",
    "AR bougie",
    "réalité augmentée",
    "cadeau émotion",
  ],
  authors: [{ name: "UNIKCANDLE", url: "https://unikcandle.com" }],
  creator: "UNIKCANDLE",
  publisher: "UNIKCANDLE",
  applicationName: "UNIKCANDLE",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  category: "E-commerce",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://unikcandle.com",
    title: "UNIKCANDLE - Bougies personnalisées avec messages audio",
    description:
      "Des bougies uniques et personnalisables avec messages audio intégrés. Alliant émotion, élégance et engagement écologique.",
    siteName: "UNIKCANDLE",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "UNIKCANDLE - Bougies personnalisées",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "UNIKCANDLE - Bougies personnalisées avec messages audio",
    description:
      "Des bougies uniques et personnalisables avec messages audio intégrés. Créez votre bougie unique.",
    images: ["/twitter-image.png"],
    creator: "@unikcandle",
    site: "@unikcandle",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  alternates: {
    canonical: "https://unikcandle.com",
    languages: {
      "fr-FR": "https://unikcandle.com/fr",
      "en-US": "https://unikcandle.com/en",
    },
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico"],
  },
};

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <html lang={params.locale} className="smooth-scroll">
      <head>
        <StructuredData data={getOrganizationSchema()} />
        <StructuredData data={getWebsiteSchema()} />
      </head>
      <Analytics />
      <body className={`${lora.variable} ${geistMono.variable} antialiased `}>
        <CartProvider>
          <QueryProvider>
            {children}
            <Toaster theme="system" position="top-center" />
          </QueryProvider>
        </CartProvider>
      </body>
    </html>
  );
}
