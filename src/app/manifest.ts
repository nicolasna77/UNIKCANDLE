import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "UNIKCANDLE - Bougies personnalisées et écologiques",
    short_name: "UNIKCANDLE",
    description:
      "Découvrez UNIKCANDLE, des bougies uniques et personnalisables avec messages audio intégrés. Créez votre bougie unique à partir de bouteilles recyclées.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#d97706",
    orientation: "portrait-primary",
    scope: "/",
    lang: "fr",
    dir: "ltr",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    categories: ["shopping", "lifestyle"],
    screenshots: [
      {
        src: "/screenshot-1.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
      },
      {
        src: "/screenshot-2.png",
        sizes: "750x1334",
        type: "image/png",
        form_factor: "narrow",
      },
    ],
  };
}
