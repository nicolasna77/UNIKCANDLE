"use client";
import Link from "next/link";
import { useScroll } from "@/hooks/use-scroll";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { buttonVariants } from "./ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const scrolled = useScroll();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header>
      <div
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-background/80 backdrop-blur-md shadow-sm"
            : "bg-transparent"
        )}
      >
        <nav className="container mx-auto px-4 flex items-center justify-between h-16">
          <Link
            href="/"
            className="text-xl bg-white border border-border rounded-xl p-1 font-bold"
          >
            <Image
              src="/logo/logo-primary-color.png"
              alt="logo"
              width={40}
              height={40}
              quality={100}
            />
          </Link>

          {/* Menu Desktop */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/"
              className={buttonVariants({ variant: "link", size: "sm" })}
            >
              Accueil
            </Link>
            <Link
              href="/about"
              className={buttonVariants({ variant: "link", size: "sm" })}
            >
              À Propos
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {/* Bouton Menu Mobile */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </nav>

        {/* Menu Mobile */}
        {isMenuOpen && (
          <div className="md:hidden bg-background/95 backdrop-blur-md border-t">
            <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
              <Link
                href="/"
                className={buttonVariants({ variant: "link", size: "sm" })}
                onClick={() => setIsMenuOpen(false)}
              >
                Accueil
              </Link>
              <Link
                href="/about"
                className={buttonVariants({ variant: "link", size: "sm" })}
                onClick={() => setIsMenuOpen(false)}
              >
                À Propos
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
