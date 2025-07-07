"use client";

import Link from "next/link";
import Image from "next/image";
import AuthButton from "./auth-button";
import HeaderMenu from "./header-menu";
import { buttonVariants } from "@/components/ui/button";
import { Menu } from "lucide-react";
import CartButton from "./cart-button";
import NoSSR from "./no-ssr";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const links = [
  { href: "/", label: "Accueil" },
  { href: "/products", label: "Produits" },
  { href: "/contact", label: "Contact" },
  { href: "/about", label: "À Propos" },
];

export default function Header() {
  return (
    <header className="fixed bg-background border-b border-border top-0 inset-x-0 z-50">
      <nav className="mx-auto max-w-screen-3xl px-4 flex items-center justify-between h-16">
        <Link href="/" className="text-xl font-bold">
          <Image
            src="/logo/logo-primary-color.png"
            alt="logo"
            width={40}
            className="object-contain "
            height={40}
            quality={100}
            priority
          />
        </Link>
        <div className="hidden md:block absolute left-1/2 -translate-x-1/2">
          <HeaderMenu links={links} />
        </div>
        <div className="flex items-center gap-5">
          <NoSSR>
            <CartButton />
          </NoSSR>
          <AuthButton />

          <Sheet>
            <SheetTrigger asChild>
              <button
                className="md:hidden p-2 hover:bg-accent rounded-md transition-colors"
                aria-label="Ouvrir le menu"
              >
                <Menu className="h-6 w-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-1/2">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 mt-6">
                {links.map((link) => (
                  <SheetClose asChild key={link.href}>
                    <Link
                      key={link.href}
                      href={link.href}
                      className={buttonVariants({
                        variant: "link",
                        size: "lg",
                      })}
                    >
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
