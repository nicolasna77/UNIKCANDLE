"use client";

import Link from "next/link";
import Image from "next/image";
import AuthButton from "./auth-button";
import HeaderMenu from "./header-menu";
import { ShoppingCartIcon } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { X, Menu } from "lucide-react";
import { useState } from "react";

const links = [
  { href: "/", label: "Accueil" },
  { href: "/products", label: "Nos produits" },
  { href: "/about", label: "À Propos" },
];

export default function Header() {
  const { cart } = useCart();
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div>
      <header className="fixed shadow-sm bg-background top-0 inset-x-0 z-50 transition-all duration-300">
        <nav className=" mx-auto max-w-screen-3xl px-4 flex items-center justify-between h-16">
          <Link href="/" className="text-xl    font-bold">
            <Image
              src="/logo/logo-primary-color.png"
              alt="logo"
              width={40}
              height={40}
              quality={100}
            />
          </Link>
          <div className="hidden md:block absolute left-1/2 -translate-x-1/2">
            <HeaderMenu links={links} />
          </div>
          <div className="flex items-center gap-5">
            <div className="relative ">
              <Link href="/cart">
                <ShoppingCartIcon className="text-secondary-foreground w-6 h-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {totalItems}
                  </span>
                )}
              </Link>
            </div>
            <AuthButton />

            <button
              className="md:hidden p-2 hover:bg-accent rounded-md transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>

            {/* Menu Mobile */}
            <div
              className={cn(
                "md:hidden fixed inset-0 top-16 bg-background/95 backdrop-blur-md border-t transition-transform duration-300 ease-in-out",
                isMenuOpen ? "translate-x-0" : "translate-x-full"
              )}
            >
              <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={buttonVariants({ variant: "link", size: "lg" })}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </nav>
      </header>
    </div>
  );
}
