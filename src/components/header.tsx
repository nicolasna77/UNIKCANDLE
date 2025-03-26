"use client";
import Link from "next/link";
import { useScroll } from "@/hooks/use-scroll";
import { cn } from "@/lib/utils";
import Image from "next/image";

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
      <div className="mx-auto flex h-16 max-w-screen-xl flex-1 items-center gap-8 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-bold">
          <Image src="/logo/symbol.png" alt="logo" width={40} height={40} />
        </Link>
      </div>
    </header>
  );
}
