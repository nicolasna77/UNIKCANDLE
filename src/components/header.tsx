"use client";

import Link from "next/link";
import Image from "next/image";
import AuthButton from "./auth-button";
import HeaderMenu from "./header-menu";
import { buttonVariants } from "@/components/ui/button";
import { Menu } from "lucide-react";
import CartButton from "./cart-button";
import { LanguageSwitcher } from "./language-switcher";
import { useTranslations } from "next-intl";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Header() {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");

  const links = [
    { href: "/", label: t("home") },
    { href: "/products", label: t("products") },
    { href: "/contact", label: t("contact") },
    { href: "/about", label: t("about") },
  ];

  return (
    <header className="fixed bg-background border-b border-border top-0 inset-x-0 z-50">
      <nav className="mx-auto max-w-screen-3xl px-4 flex items-center justify-between h-16">
        <Link href="/" className="text-xl font-bold">
          <Image
            src="/favicon.ico"
            alt="logo"
            width={40}
            height={40}
            quality={75}
            priority
          />
        </Link>
        <div className="hidden md:block absolute left-1/2 -translate-x-1/2">
          <HeaderMenu links={links} />
        </div>
        <div className="flex items-center gap-5">
          <LanguageSwitcher />
          <CartButton />
          <AuthButton />

          <Sheet>
            <SheetTrigger asChild>
              <button
                className="md:hidden p-2 hover:bg-accent rounded-md transition-colors"
                aria-label={tCommon("openMenu")}
              >
                <Menu className="h-6 w-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-1/2">
              <SheetHeader>
                <SheetTitle>{tCommon("menu")}</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 mt-6">
                {links.map((link) => (
                  <SheetClose asChild key={link.href}>
                    <Link
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
