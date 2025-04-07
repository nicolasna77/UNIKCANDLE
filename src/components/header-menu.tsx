"use client";

import Link from "next/link";
import { buttonVariants } from "./ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function HeaderMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* Menu Desktop */}
      <div className="hidden md:flex items-center gap-4">
        <Link
          href="/"
          className={buttonVariants({ variant: "link", size: "sm" })}
        >
          Accueil
        </Link>
        <Link
          href="/products"
          className={buttonVariants({ variant: "link", size: "sm" })}
        >
          Nos produits
        </Link>
        <Link
          href="/about"
          className={buttonVariants({ variant: "link", size: "sm" })}
        >
          À Propos
        </Link>
      </div>

      {/* Bouton Menu Mobile */}
      <button
        className="md:hidden p-2 hover:bg-accent rounded-md transition-colors"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
      >
        {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Menu Mobile */}
      <div
        className={cn(
          "md:hidden fixed inset-0 top-16 bg-background/95 backdrop-blur-md border-t transition-transform duration-300 ease-in-out",
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
          <Link
            href="/"
            className={buttonVariants({ variant: "link", size: "lg" })}
            onClick={() => setIsMenuOpen(false)}
          >
            Accueil
          </Link>
          <Link
            href="/about"
            className={buttonVariants({ variant: "link", size: "lg" })}
            onClick={() => setIsMenuOpen(false)}
          >
            À Propos
          </Link>
        </div>
      </div>
    </>
  );
}
