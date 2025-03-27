"use client";
import Link from "next/link";
import { useScroll } from "@/hooks/use-scroll";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { buttonVariants } from "./ui/button";

export default function Header() {
  const scrolled = useScroll();

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
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
        <div className="flex-1 flex justify-center">
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
      </nav>
    </header>
  );
}
