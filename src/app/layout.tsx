import "./globals.css";
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "@/components/ui/sonner";
import QueryProvider from "@/providers/query-provider";
import { CartProvider } from "@/context/CartContext";
import {
  StructuredData,
  getOrganizationSchema,
  getWebsiteSchema,
} from "@/lib/structured-data";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["800"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://unikcandle.com"),
  applicationName: "UNIKCANDLE",
  authors: [{ name: "UNIKCANDLE", url: "https://unikcandle.com" }],
  creator: "UNIKCANDLE",
  publisher: "UNIKCANDLE",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  category: "E-commerce",
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
      <body className={`${montserrat.variable} antialiased `}>
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
